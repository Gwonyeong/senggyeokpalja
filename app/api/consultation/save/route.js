import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/custom-auth-server";
import { calculateSajuForServer } from "@/lib/saju-utils-server";
import { DEFAULT_TRANSACTION_OPTIONS } from "@/lib/db-config";

export async function POST(request) {
  try {
    // 현재 로그인한 사용자 확인
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const data = await request.json();
    const { birthInfo } = data;

    // 사주팔자 계산 및 상담 결과 저장을 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. Profile 테이블에서 사용자 정보 조회 (프로필이 없으면 생성)
      let profile = await tx.profile.findUnique({
        where: {
          email: user.email,
        },
      });

      // 프로필이 없는 경우 새로 생성
      if (!profile) {
        profile = await tx.profile.create({
          data: {
            email: user.email,
            name: user.user_metadata?.name || birthInfo.name || "사용자",
            avatarUrl: user.user_metadata?.avatar_url || null,
            provider: user.app_metadata?.provider || "email",
          },
        });
      }

      // 2. 생년월일로 Date 객체 생성 (시간대 문제 해결을 위해 UTC로 생성)
      const birthDate = new Date(
        Date.UTC(birthInfo.year, birthInfo.month - 1, birthInfo.day)
      );

      // 시간 인덱스 (unknown인 경우 오시(6) 기본값)
      let timeIndex =
        birthInfo.hour !== "unknown" ? parseInt(birthInfo.hour) : 6;

      // 3. 만세력으로 사주팔자 계산 (트랜잭션 외부에서 계산)
      const isLunar = birthInfo.calendar === "lunar";
      const sajuData = calculateSajuForServer(birthDate, timeIndex, isLunar);

      // 사주팔자 데이터 추출
      const { palja, ohaeng, ilgan, sibsin, cheonganSibsin, primarySibsin } =
        sajuData;

      // 4. 시간 정보 저장 (UTC 변환 문제 방지를 위해 문자열로 저장)
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

      // 6. 데이터베이스에 상담 결과 저장
      const consultationResult = await tx.consultationResult.create({
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
          tenGods: sibsin, // 지지 기반 십신
          heavenlyStemGods: cheonganSibsin, // 천간 기반 십신
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

      return {
        isExisting: false,
        consultationId: consultationResult.id,
        consultationResult: consultationResult,
        profile: profile,
      };
    }, DEFAULT_TRANSACTION_OPTIONS);

    const { isExisting, consultationId, message } = result;

    return NextResponse.json({
      success: true,
      consultationId: consultationId,
      message: isExisting ? message : "상담 신청이 성공적으로 저장되었습니다.",
      isExisting: isExisting,
    });
  } catch (error) {
    console.error("Consultation save error:", error);

    // 에러 유형에 따른 구체적인 메시지 제공
    let errorMessage = "상담 신청 저장 중 오류가 발생했습니다.";
    let statusCode = 500;

    if (error.code === "P2002") {
      errorMessage = "중복된 상담 정보입니다.";
      statusCode = 409;
    } else if (error.code === "P2025") {
      errorMessage = "사용자 정보를 찾을 수 없습니다.";
      statusCode = 404;
    } else if (error.message?.includes("사주팔자 계산")) {
      errorMessage = "사주팔자 계산 중 오류가 발생했습니다.";
      statusCode = 400;
    } else if (error.message?.includes("timeout")) {
      errorMessage = "처리 시간이 초과되었습니다. 다시 시도해주세요.";
      statusCode = 408;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
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

    // 사용자 프로필 조회 및 상담 기록 조회를 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // Profile 테이블에서 사용자 정보 조회
      const profile = await tx.profile.findUnique({
        where: {
          email: user.email,
        },
      });

      if (!profile) {
        throw new Error("사용자 프로필을 찾을 수 없습니다.");
      }

      // 사용자의 상담 기록 조회
      const consultations = await tx.consultationResult.findMany({
        where: {
          userId: profile.id, // Profile 테이블의 ID 사용
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // 최근 10개만 조회
        select: {
          id: true,
          consultationType: true,
          isPaid: true,
          paidAt: true,
          createdAt: true,
          birthDate: true,
          lunarCalendar: true,
          additionalData: true,
        },
      });

      return { profile, consultations };
    }, DEFAULT_TRANSACTION_OPTIONS);

    const { consultations } = result;

    return NextResponse.json({
      success: true,
      consultations: consultations,
    });
  } catch (error) {
    console.error("Consultation fetch error:", error);

    // 에러 유형에 따른 구체적인 메시지 제공
    let errorMessage = "상담 기록 조회 중 오류가 발생했습니다.";
    let statusCode = 500;

    if (error.message?.includes("사용자 프로필을 찾을 수 없습니다")) {
      errorMessage = "사용자 프로필을 찾을 수 없습니다.";
      statusCode = 404;
    } else if (error.code === "P2025") {
      errorMessage = "요청한 데이터를 찾을 수 없습니다.";
      statusCode = 404;
    } else if (error.message?.includes("timeout")) {
      errorMessage = "처리 시간이 초과되었습니다. 다시 시도해주세요.";
      statusCode = 408;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
