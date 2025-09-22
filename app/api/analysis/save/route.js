import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    // 서버 사이드용 Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // 서버 컴포넌트에서는 쿠키 설정이 불가능할 수 있음
            }
          },
        },
      }
    );

    // 1. Supabase 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('Supabase authenticated user:', user?.email);

    // 로그인하지 않은 사용자는 저장하지 않음
    if (!user || !user.email) {
      return NextResponse.json({
        success: true,
        message: "Not logged in, result not saved",
      });
    }

    // 2. Supabase user email로 Prisma Profile 테이블 조회
    const profile = await prisma.profile.findUnique({
      where: {
        email: user.email
      }
    });

    console.log('Found profile:', profile?.id, profile?.email);

    // Profile이 없으면 저장하지 않음
    if (!profile) {
      return NextResponse.json({
        success: false,
        error: "Profile not found",
        message: "User profile not found in database"
      });
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const { personalityType, birthInfo, sajuData, analysisDate } = body;

    // 생년월일 파싱
    const birthDate = new Date(
      parseInt(birthInfo.year),
      parseInt(birthInfo.month) - 1,
      parseInt(birthInfo.day)
    );

    // 시간 파싱 (시간을 모르는 경우 null)
    let birthTime = null;
    if (birthInfo.hour !== "unknown") {
      const hourMap = {
        0: "00:30", // 자시
        1: "02:30", // 축시
        2: "04:30", // 인시
        3: "06:30", // 묘시
        4: "08:30", // 진시
        5: "10:30", // 사시
        6: "12:30", // 오시
        7: "14:30", // 미시
        8: "16:30", // 신시
        9: "18:30", // 유시
        10: "20:30", // 술시
        11: "22:30", // 해시
      };
      const timeStr = hourMap[parseInt(birthInfo.hour)];
      if (timeStr) {
        birthTime = new Date(`1970-01-01T${timeStr}:00`);
      }
    }

    // 분석 데이터 구성
    const analysisData = {
      name: birthInfo.name || null,
      gender: birthInfo.gender,
      calendar: birthInfo.calendar,
      isLeapMonth: birthInfo.isLeapMonth || false,
      yearPillar: sajuData?.yearPillar,
      monthPillar: sajuData?.monthPillar,
      dayPillar: sajuData?.dayPillar,
      timePillar: sajuData?.timePillar,
      elements: sajuData?.elements,
      analysisDate: analysisDate || new Date().toISOString(),
    };

    // 3. Profile 정보를 이용해 데이터베이스에 저장
    const savedResult = await prisma.analysisResult.create({
      data: {
        userId: profile.id,
        personalityType: personalityType,
        paljaType: personalityType, // 팔자유형과 동일
        birthDate: birthDate,
        birthTime: birthTime,
        lunarCalendar: birthInfo.calendar === "lunar",
        analysisData: analysisData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Analysis result saved successfully",
      resultId: savedResult.id,
    });
  } catch (error) {
    console.error("Error saving analysis result:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save analysis result",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
