import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { optimizedAuth } from "@/lib/optimized-auth";

// 한국 시간대(KST) 기준으로 오늘 날짜를 가져오는 함수
function getKSTToday() {
  const now = new Date();
  const kstOffset = 9 * 60; // 9시간을 분으로 변환
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstTime = new Date(utc + (kstOffset * 60000));

  return new Date(kstTime.getFullYear(), kstTime.getMonth(), kstTime.getDate());
}

export async function GET(request) {
  try {
    const authResult = await optimizedAuth(request, {
      requireAuth: true,
      skipCache: false // 캐시 사용으로 성능 향상
    });

    if (authResult.response) {
      return authResult.response;
    }

    const { user } = authResult;

    const today = getKSTToday();

    const dailyFortune = await prisma.dailyFortune.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (dailyFortune) {
      return NextResponse.json({
        success: true,
        data: dailyFortune,
      });
    }

    return NextResponse.json({
      success: false,
      message: "No fortune found for today",
    });
  } catch (error) {
    console.error("Error fetching daily fortune:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily fortune" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await optimizedAuth(request, {
      requireAuth: true,
      skipCache: false // 캐시 사용으로 성능 향상
    });

    if (authResult.response) {
      return authResult.response;
    }

    const { user } = authResult;

    const body = await request.json();
    const {
      sibsinName,
      score,
      fortuneData,
      primarySibsin,
      ohaengAnalysis,
    } = body;

    const today = getKSTToday();

    const dailyFortune = await prisma.dailyFortune.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        sibsinName,
        score,
        fortuneData,
        primarySibsin,
        ohaengAnalysis,
      },
      create: {
        userId: user.id,
        date: today,
        sibsinName,
        score,
        fortuneData,
        primarySibsin,
        ohaengAnalysis,
      },
    });

    return NextResponse.json({
      success: true,
      data: dailyFortune,
    });
  } catch (error) {
    console.error("Error saving daily fortune:", error);
    return NextResponse.json(
      { error: "Failed to save daily fortune" },
      { status: 500 }
    );
  }
}