import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { passcode } = await request.json();

    // Supabase Auth 클라이언트 생성 (서버 사이드용)
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 통행증 확인
    if (passcode.trim().toLowerCase() !== "happytory") {
      return NextResponse.json(
        { error: "Invalid passcode" },
        { status: 400 }
      );
    }

    // Profile 테이블에서 사용자 정보 조회
    const profile = await prisma.profile.findUnique({
      where: {
        email: user.email
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: "사용자 프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 상담 데이터 확인
    const consultation = await prisma.consultationResult.findFirst({
      where: {
        id: id,
        userId: profile.id  // 본인의 상담 결과만 조회
      },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 }
      );
    }

    // 이미 결제된 경우
    if (consultation.isPaid) {
      return NextResponse.json(
        { message: "Already paid" },
        { status: 200 }
      );
    }

    // 결제 상태 업데이트
    await prisma.consultationResult.update({
      where: { id: id },
      data: {
        isPaid: true,
        paymentMethod: "추석이벤트_통행증",
        paidAt: new Date(),
        paymentAmount: 10000,
        additionalData: {
          ...consultation.additionalData,
          paymentInfo: {
            type: "event",
            eventName: "추석이벤트",
            passcode: "happytory",
            appliedAt: new Date().toISOString(),
          }
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment completed with event passcode",
    });
  } catch (error) {
    console.error("Complete payment error:", error);
    return NextResponse.json(
      { error: "Failed to complete payment" },
      { status: 500 }
    );
  }
}