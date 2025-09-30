import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { calculateSajuForServer } from "@/lib/saju-utils-server";

export async function POST(request) {
  try {
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

    // 요청 본문 파싱
    const data = await request.json();
    const { birthInfo } = data;

    // 생년월일로 Date 객체 생성 (시간대 문제 해결을 위해 UTC로 생성)
    const birthDate = new Date(Date.UTC(
      birthInfo.year,
      birthInfo.month - 1,
      birthInfo.day
    ));

    console.log("birthDate", birthDate);
    // 시간 인덱스 (unknown인 경우 오시(6) 기본값)
    let timeIndex = birthInfo.hour !== "unknown" ? parseInt(birthInfo.hour) : 6;

    // 만세력으로 사주팔자 계산
    const isLunar = birthInfo.calendar === "lunar";
    const sajuData = calculateSajuForServer(birthDate, timeIndex, isLunar);

    // 사주팔자 데이터 추출
    const { palja, ohaeng, ilgan, sibsin, cheonganSibsin, primarySibsin } = sajuData;

    // 시간 정보 저장 (UTC 변환 문제 방지를 위해 문자열로 저장)
    let birthTime = null;
    if (birthInfo.hour !== "unknown") {
      const timeMapping = {
        0: { hour: 0, minute: 30 }, // 자시
        1: { hour: 2, minute: 30 }, // 축시
        2: { hour: 4, minute: 30 }, // 인시
        3: { hour: 6, minute: 30 }, // 묘시
        4: { hour: 8, minute: 30 }, // 진시
        5: { hour: 10, minute: 30 }, // 사시
        6: { hour: 12, minute: 30 }, // 오시
        7: { hour: 14, minute: 30 }, // 미시
        8: { hour: 16, minute: 30 }, // 신시
        9: { hour: 18, minute: 30 }, // 유시
        10: { hour: 20, minute: 30 }, // 술시
        11: { hour: 22, minute: 30 }, // 해시
      };

      const { hour, minute } = timeMapping[timeIndex] || {
        hour: 12,
        minute: 30,
      };
      // UTC 변환 문제 방지를 위해 ISO 문자열로 생성
      const timeString = `1970-01-01T${hour
        .toString()
        .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00.000Z`;
      birthTime = new Date(timeString);
    }

    // 데이터베이스에 저장
    const consultationResult = await prisma.consultationResult.create({
      data: {
        userId: profile.id, // Profile 테이블의 ID 사용

        // 생년월일 정보
        birthDate: birthDate,
        birthTime: birthTime,
        lunarCalendar: birthInfo.calendar === "lunar",

        // 사주팔자
        yearStem: palja.yunju?.gan?.han || "",
        yearBranch: palja.yunju?.ji?.han || "",
        monthStem: palja.wolju?.gan?.han || "",
        monthBranch: palja.wolju?.ji?.han || "",
        dayStem: palja.ilju?.gan?.han || "",
        dayBranch: palja.ilju?.ji?.han || "",
        timeStem: palja.siju?.gan?.han || null,
        timeBranch: palja.siju?.ji?.han || null,

        // 오행
        woodCount: ohaeng["木"] || 0,
        fireCount: ohaeng["火"] || 0,
        earthCount: ohaeng["土"] || 0,
        metalCount: ohaeng["金"] || 0,
        waterCount: ohaeng["水"] || 0,
        dominantElement: Object.entries(ohaeng).reduce(
          (a, b) => (b[1] > (ohaeng[a] || 0) ? b[0] : a),
          "木"
        ),

        // 십신 및 분석 데이터
        tenGods: sibsin,  // 지지 기반 십신
        heavenlyStemGods: cheonganSibsin,  // 천간 기반 십신
        personalityType: null, // 필요시 MBTI x 팔자 유형 계산 후 저장
        fortuneData: {
          primarySibsin: primarySibsin,
          birthInfo: birthInfo,
        },

        // 추가 데이터 (manseryeok 계산 결과 포함)
        additionalData: {
          ilgan: ilgan,
          gender: birthInfo.gender,
          name: birthInfo.name,
          mbti: birthInfo.mbti || null,
          sajuData: sajuData, // manseryeok 전체 결과를 additionalData에 저장
        },

        // 상담 정보
        consultationType: "사주팔자 상담",

        // 결제 정보 (기본값)
        isPaid: false,
      },
    });

    return NextResponse.json({
      success: true,
      consultationId: consultationResult.id,
      message: "상담 신청이 성공적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error("Consultation save error:", error);
    return NextResponse.json(
      { error: "상담 신청 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
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

    // 사용자의 상담 기록 조회
    const consultations = await prisma.consultationResult.findMany({
      where: {
        userId: profile.id, // Profile 테이블의 ID 사용
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // 최근 10개만 조회
    });

    return NextResponse.json({
      success: true,
      consultations: consultations,
    });
  } catch (error) {
    console.error("Consultation fetch error:", error);
    return NextResponse.json(
      { error: "상담 기록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
