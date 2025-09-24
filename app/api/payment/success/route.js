import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const paymentKey = url.searchParams.get("paymentKey");
    const orderId = url.searchParams.get("orderId");
    const amount = url.searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.redirect(new URL("/payment/fail?message=잘못된 요청입니다", request.url));
    }

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch(`https://api.tosspayments.com/v1/payments/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: parseInt(amount)
      })
    });

    const paymentData = await response.json();

    if (!response.ok) {
      console.error("결제 승인 실패:", paymentData);
      return NextResponse.redirect(
        new URL(`/payment/fail?message=${paymentData.message || "결제 승인에 실패했습니다"}`, request.url)
      );
    }

    // metadata에서 consultationId 추출
    const consultationId = paymentData.metadata?.consultationId;

    if (!consultationId) {
      console.error("consultationId가 없습니다:", paymentData);
      return NextResponse.redirect(
        new URL("/payment/fail?message=상담 정보를 찾을 수 없습니다", request.url)
      );
    }

    // 데이터베이스에서 isPaid 상태 업데이트
    const updatedConsultation = await prisma.consultationResult.update({
      where: { id: consultationId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentMethod: paymentData.method,
        paymentAmount: paymentData.totalAmount
      }
    });

    // 결제 성공 페이지로 리다이렉트
    return NextResponse.redirect(
      new URL(`/consultation/result/${consultationId}?section=2&payment=success`, request.url)
    );

  } catch (error) {
    console.error("결제 처리 중 오류:", error);
    return NextResponse.redirect(
      new URL("/payment/fail?message=결제 처리 중 오류가 발생했습니다", request.url)
    );
  }
}