import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { sendPaymentFailureNotification } from "@/lib/slack-notification";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const message = url.searchParams.get("message");
    const orderId = url.searchParams.get("orderId");
    const paymentKey = url.searchParams.get("paymentKey");
    const amount = url.searchParams.get("amount");
    const paymentId = url.searchParams.get("paymentId");

    // Get authenticated user (optional)
    let userId = null;
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    } catch (error) {
      console.error("Error getting user:", error);
    }

    // 결제 실패 정보를 PaymentResult 테이블에 저장
    if (paymentId || (paymentKey && orderId)) {
      try {
        if (paymentId) {
          // 미리 저장된 결제 정보 업데이트
          await prisma.paymentResult.update({
            where: { id: paymentId },
            data: {
              status: "FAILED",
              failureCode: code || "UNKNOWN_ERROR",
              failureMessage: message || "결제에 실패했습니다",
              updatedAt: new Date(),
            },
          });
        } else {
          // 기존 방식 (하위 호환성)
          await prisma.paymentResult.upsert({
            where: { paymentKey },
            update: {
              status: "FAILED",
              failureCode: code || "UNKNOWN_ERROR",
              failureMessage: message || "결제에 실패했습니다",
              updatedAt: new Date(),
            },
            create: {
              userId,
              paymentKey,
              orderId,
              amount: amount ? parseInt(amount) : 0,
              status: "FAILED",
              failureCode: code || "UNKNOWN_ERROR",
              failureMessage: message || "결제에 실패했습니다",
              requestedAt: new Date(),
              metadata: {
                code,
                message,
                orderId,
              },
            },
          });
        }

        // 슬랙 알림 전송 (비동기로 처리하여 사용자 응답 지연 방지)
        sendPaymentFailureNotification({
          paymentKey,
          orderId,
          amount: amount ? parseInt(amount) : 0,
          failureCode: code || "UNKNOWN_ERROR",
          failureMessage: message || "결제에 실패했습니다",
          userId,
        }).catch((error) => {
          console.error("슬랙 알림 전송 실패:", error);
        });
      } catch (error) {
        // 결제 실패 정보 저장 실패는 무시하고 계속 진행
        console.error("Error saving payment failure:", error);
      }
    }

    // 결제 실패 페이지로 리다이렉트 (또는 원래 페이지로)
    const failUrl = new URL("/payment/fail", request.url);
    failUrl.searchParams.set("code", code || "UNKNOWN_ERROR");
    failUrl.searchParams.set("message", message || "결제에 실패했습니다");

    if (orderId) {
      failUrl.searchParams.set("orderId", orderId);
    }

    return NextResponse.redirect(failUrl);
  } catch (error) {
    console.error("결제 실패 처리 중 오류:", error);
    return NextResponse.redirect(
      new URL(
        "/payment/fail?message=결제 처리 중 오류가 발생했습니다",
        request.url
      )
    );
  }
}
