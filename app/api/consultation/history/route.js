import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Supabase Auth user의 email로 profiles 테이블에서 실제 profile 찾기
    const profile = await prisma.profile.findUnique({
      where: {
        email: user.email
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // 사용자의 상담 기록 조회
    const consultationResults = await prisma.consultationResult.findMany({
      where: {
        userId: profile.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        consultationType: true,
        consultationNote: true,
        isPaid: true,
        paidAt: true,
        createdAt: true,
        personalityType: true,
        birthDate: true,
        birthTime: true,
        dominantElement: true,
        yearStem: true,
        yearBranch: true,
        dayStem: true,
        dayBranch: true,
        woodCount: true,
        fireCount: true,
        earthCount: true,
        metalCount: true,
        waterCount: true,
        additionalData: true
      },
      take: 10
    });

    // 응답 데이터 포맷팅
    const formattedResults = consultationResults.map(result => {
      // additionalData에서 이름과 성별 추출
      const additionalData = result.additionalData || {};
      const name = additionalData.name || '';
      const gender = additionalData.gender || '';

      // 사주팔자 요약 생성
      const sajuInfo = result.yearStem && result.yearBranch ?
        `${result.yearStem}${result.yearBranch}년 ${result.dayStem}${result.dayBranch}일` : null;

      // 오행 분석 요약
      const elements = [
        { name: '목', count: result.woodCount },
        { name: '화', count: result.fireCount },
        { name: '토', count: result.earthCount },
        { name: '금', count: result.metalCount },
        { name: '수', count: result.waterCount }
      ].filter(e => e.count > 0);

      const elementSummary = elements.length > 0 ?
        elements.map(e => `${e.name}(${e.count})`).join(', ') : null;

      // 요약 텍스트 생성 (이름 포함)
      let summary = result.consultationNote || '';

      if (!summary) {
        const namePrefix = name ? `${name}님의 ` : '';
        if (sajuInfo) {
          summary = `${namePrefix}사주: ${sajuInfo}`;
        } else if (elementSummary) {
          summary = `${namePrefix}오행: ${elementSummary}`;
        } else if (result.dominantElement) {
          summary = `${namePrefix}주요 오행: ${result.dominantElement}`;
        } else {
          summary = name ? `${name}님과 토리의 깊은 상담` : '토리와의 깊은 상담이 진행되었습니다.';
        }
      }

      return {
        id: result.id,
        consultationType: result.consultationType || '사주 상담',
        summary: summary,
        question: result.consultationType || '사주 분석',
        createdAt: result.createdAt,
        isPaid: result.isPaid,
        paidAt: result.paidAt,
        personalityType: result.personalityType,
        birthDate: result.birthDate,
        birthTime: result.birthTime,
        dominantElement: result.dominantElement,
        sajuInfo: sajuInfo,
        elementSummary: elementSummary,
        name: name,
        gender: gender
      };
    });

    return NextResponse.json(formattedResults);

  } catch (error) {
    console.error('Failed to fetch consultation history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}