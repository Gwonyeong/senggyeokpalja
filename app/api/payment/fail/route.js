import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const message = url.searchParams.get("message");
    const orderId = url.searchParams.get("orderId");

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
