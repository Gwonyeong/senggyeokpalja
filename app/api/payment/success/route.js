import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPLEX_TRANSACTION_OPTIONS } from "@/lib/db-config";
import {
  withTransactionRetry,
  CRITICAL_RETRY_OPTIONS,
  handleDatabaseError,
} from "@/lib/db-retry";
import { getCurrentUser } from "@/lib/custom-auth-server";
import { sendPaymentSuccessNotification } from "@/lib/slack-notification";

export async function GET(request) {
  const url = new URL(request.url);
  const paymentKey = url.searchParams.get("paymentKey");
  const orderId = url.searchParams.get("orderId");
  const amount = url.searchParams.get("amount");
  const paymentId = url.searchParams.get("paymentId");
  try {
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.redirect(
        new URL("/payment/fail?message=잘못된 요청입니다", request.url)
      );
    }

    // Get authenticated user (optional)
    let userId = null;
    try {
      const user = await getCurrentUser();
      userId = user?.id;
    } catch (error) {
      console.error("Error getting user:", error);
    }

    // 결제 확인 및 DB 업데이트를 재시도 가능한 트랜잭션으로 처리
    const result = await withTransactionRetry(
      prisma,
      async (tx) => {
        // 1. 토스페이먼츠 결제 승인 API 호출
        const response = await fetch(
          `https://api.tosspayments.com/v1/payments/confirm`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(
                process.env.TOSS_SECRET_KEY + ":"
              ).toString("base64")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentKey,
              orderId,
              amount: parseInt(amount),
            }),
          }
        );

        const paymentData = await response.json();

        if (!response.ok) {
          console.error("결제 승인 실패:", paymentData);

          // 결제 실패 정보를 PaymentResult 테이블에 저장
          await tx.paymentResult.create({
            data: {
              userId,
              paymentKey,
              orderId,
              amount: parseInt(amount),
              status: "FAILED",
              failureCode: paymentData.code,
              failureMessage: paymentData.message,
              requestedAt: new Date(),
              metadata: paymentData,
            },
          });

          throw new Error(paymentData.message || "결제 승인에 실패했습니다");
        }

        // 2. 기존 PaymentResult 업데이트 또는 새로 생성
        let savedPayment;

        if (paymentId) {
          // 미리 저장된 결제 정보 업데이트
          savedPayment = await tx.paymentResult.update({
            where: { id: paymentId },
            data: {
              paymentKey,
              status: "SUCCESS",
              approvedAt: paymentData.approvedAt
                ? new Date(paymentData.approvedAt)
                : new Date(),
              method: paymentData.method,
              cardNumber: paymentData.card?.number,
              cardType: paymentData.card?.cardType,
              cardCompany: paymentData.card?.company,
              installmentMonth: paymentData.card?.installmentPlanMonths,
              customerName: paymentData.customerName,
              customerEmail: paymentData.customerEmail,
              customerPhone: paymentData.customerMobilePhone,
              metadata: paymentData,
            },
          });
        } else {
          // 기존 방식 (하위 호환성)
          savedPayment = await tx.paymentResult.upsert({
            where: { paymentKey },
            update: {
              status: "SUCCESS",
              approvedAt: paymentData.approvedAt
                ? new Date(paymentData.approvedAt)
                : new Date(),
              method: paymentData.method,
              cardNumber: paymentData.card?.number,
              cardType: paymentData.card?.cardType,
              cardCompany: paymentData.card?.company,
              installmentMonth: paymentData.card?.installmentPlanMonths,
              customerName: paymentData.customerName,
              customerEmail: paymentData.customerEmail,
              customerPhone: paymentData.customerMobilePhone,
              metadata: paymentData,
            },
            create: {
              userId,
              paymentKey,
              orderId,
              amount: parseInt(amount),
              status: "SUCCESS",
              method: paymentData.method,
              cardNumber: paymentData.card?.number,
              cardType: paymentData.card?.cardType,
              cardCompany: paymentData.card?.company,
              installmentMonth: paymentData.card?.installmentPlanMonths,
              customerName: paymentData.customerName,
              customerEmail: paymentData.customerEmail,
              customerPhone: paymentData.customerMobilePhone,
              productName: paymentData.orderName,
              requestedAt: paymentData.requestedAt
                ? new Date(paymentData.requestedAt)
                : null,
              approvedAt: paymentData.approvedAt
                ? new Date(paymentData.approvedAt)
                : new Date(),
              metadata: paymentData,
            },
          });
        }

        // 3. orderId에서 consultationId 추출
        let consultationId = paymentData.metadata?.consultationId;

        if (!consultationId) {
          const orderIdParts = orderId.split("_");
          if (orderIdParts[0] === "order" && orderIdParts.length >= 3) {
            const possibleId = orderIdParts[1];
            if (
              possibleId.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
              )
            ) {
              consultationId = possibleId;
            }
          }
        }

        if (!consultationId) {
          console.error("consultationId를 찾을 수 없습니다:", {
            orderId,
            paymentData,
          });
          throw new Error("상담 정보를 찾을 수 없습니다");
        }

        // 4. 결제 상태가 이미 완료된 상담인지 확인
        const existingConsultation = await tx.consultationResult.findUnique({
          where: { id: consultationId },
          select: { id: true, isPaid: true },
        });

        if (!existingConsultation) {
          throw new Error("상담 결과를 찾을 수 없습니다");
        }

        if (existingConsultation.isPaid) {
          console.warn("이미 결제가 완료된 상담입니다:", consultationId);
          return { consultationId, alreadyPaid: true, savedPayment };
        }

        // 5. 데이터베이스 결제 상태 업데이트
        const updatedConsultation = await tx.consultationResult.update({
          where: { id: consultationId },
          data: {
            isPaid: true,
            paidAt: new Date(),
            paymentMethod: paymentData.method,
            paymentAmount: paymentData.totalAmount,
            paymentKey: paymentKey,
            orderId: orderId,
          },
        });

        return {
          consultationId,
          updatedConsultation,
          paymentData,
          savedPayment,
          alreadyPaid: false,
        };
      },
      COMPLEX_TRANSACTION_OPTIONS,
      CRITICAL_RETRY_OPTIONS
    );

    const { consultationId, savedPayment } = result;

    // 슬랙 알림 전송 (비동기로 처리하여 사용자 응답 지연 방지)

    sendPaymentSuccessNotification({
      paymentKey: savedPayment.paymentKey,
      orderId: savedPayment.orderId,
      amount: savedPayment.amount,
      method: savedPayment.method,
      customerName: savedPayment.customerName,
      customerEmail: savedPayment.customerEmail,
      productName: savedPayment.productName,
      approvedAt: savedPayment.approvedAt,
      cardCompany: savedPayment.cardCompany,
      cardNumber: savedPayment.cardNumber,
    }).catch((error) => {
      console.error("슬랙 알림 전송 실패:", error);
    });

    // 결제 성공 페이지로 리다이렉트
    return NextResponse.redirect(
      new URL(
        `/consultation/result/${consultationId}?section=2&payment=success`,
        request.url
      )
    );
  } catch (error) {
    console.error("결제 처리 중 오류:", error);

    // 데이터베이스 에러 처리
    const handledError = await handleDatabaseError(error, {
      operation: "payment_confirmation",
      paymentKey,
      orderId,
      amount,
    });

    // 에러 유형에 따른 구체적인 메시지 제공
    let errorMessage = "결제 처리 중 오류가 발생했습니다";

    if (error.message?.includes("결제 승인에 실패")) {
      errorMessage = error.message;
    } else if (error.message?.includes("상담 정보를 찾을 수 없습니다")) {
      errorMessage = "상담 정보를 찾을 수 없습니다";
    } else if (error.message?.includes("상담 결과를 찾을 수 없습니다")) {
      errorMessage = "상담 결과를 찾을 수 없습니다";
    } else if (handledError.message !== error.message) {
      // 데이터베이스 에러 핸들러에서 처리된 메시지 사용
      errorMessage = handledError.message;
    }

    return NextResponse.redirect(
      new URL(
        `/payment/fail?message=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    );
  }
}
