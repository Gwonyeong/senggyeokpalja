import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth-middleware-v2";

export async function POST(request) {
  try {
    // 자체 인증 확인 (로그인하지 않은 사용자도 허용)
    const authResult = await authenticateUser(request, {
      requireAuth: false
    });

    // 로그인하지 않은 사용자는 저장하지 않음
    if (!authResult.user) {
      return NextResponse.json({
        success: true,
        message: "Not logged in, result not saved",
      });
    }

    const { user } = authResult;

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
        userId: user.id,
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
