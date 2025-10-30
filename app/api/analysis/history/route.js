import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/custom-auth-server';

export async function GET() {
  try {
    // 현재 로그인한 사용자 확인
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 단일 쿼리로 조인하여 profile 조회와 analysis 조회를 동시에 처리
    const analysisResults = await prisma.analysisResult.findMany({
      where: {
        user: {
          email: user.email
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        personalityType: true,
        mbtiType: true,
        paljaType: true,
        birthDate: true,
        birthTime: true,
        lunarCalendar: true,
        analysisData: true,
        createdAt: true
      },
      take: 10
    });

    // 응답 데이터 포맷팅
    const formattedResults = analysisResults.map(result => {
      // analysisData에서 이름 추출
      const analysisData = result.analysisData || {};
      const name = analysisData.name || '';

      return {
        id: result.id,
        personalityType: result.personalityType,
        mbtiType: result.mbtiType,
        paljaType: result.paljaType,
        birthDate: result.birthDate,
        birthTime: result.birthTime,
        lunarCalendar: result.lunarCalendar,
        createdAt: result.createdAt,
        name: name
      };
    });

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}