import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sibsinName,
      score,
      fortuneData,
      primarySibsin,
      ohaengAnalysis,
    } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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