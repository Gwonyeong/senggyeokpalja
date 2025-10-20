import { NextResponse } from "next/server";
import { calculateSajuForServer } from "@/lib/saju-utils-server";

export async function POST(request) {
  try {
    const { birthDate, timeIndex, isLunar } = await request.json();

    if (!birthDate || timeIndex === undefined) {
      return NextResponse.json(
        { error: "birthDate와 timeIndex는 필수입니다." },
        { status: 400 }
      );
    }

    // Date 객체로 변환
    const parsedBirthDate = new Date(birthDate);

    if (isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json(
        { error: "유효하지 않은 날짜입니다." },
        { status: 400 }
      );
    }

    // 서버용 사주 계산 함수 호출
    const sajuData = calculateSajuForServer(parsedBirthDate, timeIndex, isLunar || false);

    return NextResponse.json({
      success: true,
      data: sajuData
    });

  } catch (error) {
    console.error("사주 계산 오류:", error);
    return NextResponse.json(
      { error: "사주 계산 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}