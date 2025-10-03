import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { QUICK_TRANSACTION_OPTIONS } from '@/lib/db-config';
import { withRetry, STANDARD_RETRY_OPTIONS } from '@/lib/db-retry';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const url = new URL(request.url);

    // 페이지네이션 파라미터
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50); // 최대 50개
    const offset = (page - 1) * limit;

    // 필터 파라미터
    const isPaid = url.searchParams.get('isPaid');
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const searchTerm = url.searchParams.get('search');

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

    // WHERE 조건 구성
    const whereConditions = {
      user: {
        email: user.email
      }
    };

    // 필터 조건 추가
    if (isPaid !== null && isPaid !== undefined) {
      whereConditions.isPaid = isPaid === 'true';
    }

    if (fromDate) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        gte: new Date(fromDate)
      };
    }

    if (toDate) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        lte: new Date(toDate)
      };
    }

    if (searchTerm) {
      whereConditions.OR = [
        {
          consultationType: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          consultationNote: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          additionalData: {
            path: ['name'],
            string_contains: searchTerm
          }
        }
      ];
    }

    // 재시도 가능한 데이터베이스 조회
    const [consultationResults, totalCount] = await withRetry(
      async () => {
        return await prisma.$transaction(async (tx) => {
          // 페이지네이션된 결과 조회
          const results = await tx.consultationResult.findMany({
            where: whereConditions,
            orderBy: [
              { isPaid: 'desc' }, // 유료 상담을 먼저
              { createdAt: 'desc' }
            ],
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
            skip: offset,
            take: limit
          });

          // 전체 개수 조회 (카운트 최적화)
          const count = await tx.consultationResult.count({
            where: whereConditions
          });

          return [results, count];
        }, QUICK_TRANSACTION_OPTIONS);
      },
      STANDARD_RETRY_OPTIONS
    );

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

    // 페이지네이션 메타데이터 계산
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: formattedResults,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
      filters: {
        isPaid: isPaid,
        fromDate: fromDate,
        toDate: toDate,
        search: searchTerm,
      }
    });

  } catch (error) {
    console.error('Failed to fetch consultation history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}