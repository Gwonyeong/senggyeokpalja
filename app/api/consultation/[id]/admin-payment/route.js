import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/custom-auth-server";

// 어드민 사용자 목록
const ADMIN_USERS = [
  "jaehxxn7@naver.com",
  "tnalsqkr1234@gmail.com",
  "regend0726@gmail.com",
  "rnjsdud980@gmail.com",
];

export async function POST(request, { params }) {
  try {
    // Next.js 15에서 params는 Promise이므로 await 필요
    const resolvedParams = await params;

    // 사용자 인증 확인
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 어드민 사용자 체크
    if (!ADMIN_USERS.includes(user.email)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const consultationId = resolvedParams.id;

    // 상담 결과가 존재하는지 확인
    const consultation = await prisma.consultationResult.findUnique({
      where: { id: consultationId }
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 }
      );
    }

    // 이미 결제된 상담인지 확인
    if (consultation.isPaid) {
      return NextResponse.json(
        { error: "Already paid" },
        { status: 400 }
      );
    }

    // 어드민 결제 처리 (결제 데이터 생성)
    const mockPaymentData = {
      paymentKey: `ADMIN_KEY_${Date.now()}`,
      orderId: `ADMIN_${Date.now()}`,
      amount: 9900,
      orderName: "성격팔자 상세리포트",
      method: "ADMIN_MOCK_PAYMENT",
      status: "SUCCESS",
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      totalAmount: 9900,
      currency: "KRW",
      customerName: "어드민",
      customerEmail: user.email,
    };

    // 트랜잭션으로 결제 결과 생성 및 상담 결과 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 결제 결과 생성
      const paymentResult = await tx.paymentResult.create({
        data: {
          userId: user.id,
          paymentKey: mockPaymentData.paymentKey,
          orderId: mockPaymentData.orderId,
          amount: mockPaymentData.amount,
          currency: mockPaymentData.currency,
          method: mockPaymentData.method,
          status: mockPaymentData.status,
          productName: mockPaymentData.orderName,
          requestedAt: new Date(mockPaymentData.requestedAt),
          approvedAt: new Date(mockPaymentData.approvedAt),
          customerName: mockPaymentData.customerName,
          customerEmail: mockPaymentData.customerEmail,
        },
      });

      // 상담 결과의 결제 상태 업데이트
      const updatedConsultation = await tx.consultationResult.update({
        where: { id: consultationId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentKey: mockPaymentData.paymentKey,
          orderId: mockPaymentData.orderId,
          paymentAmount: mockPaymentData.amount,
          paymentMethod: mockPaymentData.method,
        },
      });

      return { paymentResult, updatedConsultation };
    });

    console.log(`Admin payment processed for consultation ${consultationId} by ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Admin payment processed successfully",
      data: {
        consultationId: consultationId,
        paymentId: result.paymentResult.id,
        orderId: result.paymentResult.orderId,
        amount: result.paymentResult.amount,
        processedBy: user.email,
        processedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Admin payment processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}