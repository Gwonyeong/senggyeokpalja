import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { checkAdminAccess } from '@/lib/supabase-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !checkAdminAccess(user)) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    let response = {};

    switch (type) {
      case 'overview': {
        // 전체 분석 통계
        const totalAnalyses = await prisma.analysisResult.count();
        const totalSynergies = await prisma.synergyAnalysis.count();

        // MBTI 분포
        const mbtiDistribution = await prisma.analysisResult.groupBy({
          by: ['mbtiType'],
          _count: {
            mbtiType: true
          },
          where: {
            mbtiType: {
              not: null
            }
          },
          orderBy: {
            _count: {
              mbtiType: 'desc'
            }
          }
        });

        // 팔자 유형 분포
        const paljaDistribution = await prisma.analysisResult.groupBy({
          by: ['paljaType'],
          _count: {
            paljaType: true
          },
          where: {
            paljaType: {
              not: null
            }
          },
          orderBy: {
            _count: {
              paljaType: 'desc'
            }
          }
        });

        // 음력/양력 사용 비율
        const calendarDistribution = await prisma.analysisResult.groupBy({
          by: ['lunarCalendar'],
          _count: {
            lunarCalendar: true
          }
        });

        // 시간대별 분석 패턴 (최근 30일)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentAnalyses = await prisma.analysisResult.findMany({
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          },
          select: {
            createdAt: true
          }
        });

        // 시간대별 그룹화
        const hourlyPattern = new Array(24).fill(0);
        recentAnalyses.forEach(analysis => {
          const hour = new Date(analysis.createdAt).getHours();
          hourlyPattern[hour]++;
        });

        response = {
          totalAnalyses,
          totalSynergies,
          mbtiDistribution: mbtiDistribution.map(item => ({
            type: item.mbtiType,
            count: item._count.mbtiType
          })),
          paljaDistribution: paljaDistribution.map(item => ({
            type: item.paljaType,
            count: item._count.paljaType
          })),
          calendarDistribution: calendarDistribution.map(item => ({
            type: item.lunarCalendar ? '음력' : '양력',
            count: item._count.lunarCalendar
          })),
          hourlyPattern: hourlyPattern.map((count, hour) => ({
            hour: `${hour}시`,
            count
          }))
        };
        break;
      }

      case 'synergy': {
        // 궁합 분석 통계
        const totalSynergies = await prisma.synergyAnalysis.count();

        // 평균 궁합 점수
        const avgScore = await prisma.synergyAnalysis.aggregate({
          _avg: {
            compatibilityScore: true
          }
        });

        // 점수 분포
        const scoreRanges = await Promise.all([
          { range: '0-20', min: 0, max: 20 },
          { range: '21-40', min: 21, max: 40 },
          { range: '41-60', min: 41, max: 60 },
          { range: '61-80', min: 61, max: 80 },
          { range: '81-100', min: 81, max: 100 }
        ].map(async (range) => {
          const count = await prisma.synergyAnalysis.count({
            where: {
              compatibilityScore: {
                gte: range.min,
                lte: range.max
              }
            }
          });
          return {
            range: range.range,
            count
          };
        }));

        // 인기 조합 TOP 10
        const popularCombinations = await prisma.synergyAnalysis.groupBy({
          by: ['userType', 'partnerType'],
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          },
          take: 10
        });

        response = {
          total: totalSynergies,
          averageScore: avgScore._avg.compatibilityScore || 0,
          scoreDistribution: scoreRanges,
          popularCombinations: popularCombinations.map(item => ({
            userType: item.userType,
            partnerType: item.partnerType,
            count: item._count.id
          }))
        };
        break;
      }

      case 'recent': {
        // 최근 분석 목록
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const analyses = await prisma.analysisResult.findMany({
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                email: true,
                displayName: true
              }
            }
          }
        });

        const total = await prisma.analysisResult.count();

        response = {
          analyses,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: '잘못된 요청 타입입니다.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Admin analyses error:', error);
    return NextResponse.json(
      { success: false, error: '분석 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}