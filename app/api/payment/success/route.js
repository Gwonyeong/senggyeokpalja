import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPLEX_TRANSACTION_OPTIONS } from "@/lib/db-config";
import {
  withTransactionRetry,
  CRITICAL_RETRY_OPTIONS,
  handleDatabaseError,
} from "@/lib/db-retry";

export async function GET(request) {
  const url = new URL(request.url);
  const paymentKey = url.searchParams.get("paymentKey");
  const orderId = url.searchParams.get("orderId");
  const amount = url.searchParams.get("amount");
  try {
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.redirect(
        new URL("/payment/fail?message=잘못된 요청입니다", request.url)
      );
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
          throw new Error(paymentData.message || "결제 승인에 실패했습니다");
        }

        // 2. orderId에서 consultationId 추출
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

        // 3. 결제 상태가 이미 완료된 상담인지 확인
        const existingConsultation = await tx.consultationResult.findUnique({
          where: { id: consultationId },
          select: { id: true, isPaid: true },
        });

        if (!existingConsultation) {
          throw new Error("상담 결과를 찾을 수 없습니다");
        }

        if (existingConsultation.isPaid) {
          console.warn("이미 결제가 완료된 상담입니다:", consultationId);
          return { consultationId, alreadyPaid: true };
        }

        // 4. 데이터베이스 결제 상태 업데이트
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
          alreadyPaid: false,
        };
      },
      COMPLEX_TRANSACTION_OPTIONS,
      CRITICAL_RETRY_OPTIONS
    );

    const { consultationId } = result;

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
