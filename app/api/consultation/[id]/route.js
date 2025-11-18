import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function GET(request, { params }) {
  try {
    // 상담 ID 파라미터 추출
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "상담 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase Auth 클라이언트 생성
    const supabase = await createClient();

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // Profile 테이블에서 사용자 정보 조회
    const profile = await prisma.profile.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "사용자 프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 상담 결과 조회 (본인 데이터만)
    const consultation = await prisma.consultationResult.findFirst({
      where: {
        id: id,
        userId: profile.id, // 본인의 상담 결과만 조회 가능
      },
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "상담 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // MBTI 정보 확인을 위한 콘솔 로그

    return NextResponse.json({
      success: true,
      consultation: consultation,
    });
  } catch (error) {
    console.error("Consultation fetch error:", error);
    return NextResponse.json(
      { error: "상담 결과 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
