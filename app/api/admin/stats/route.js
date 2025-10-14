import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { checkAdminAccess } from '@/lib/supabase-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !checkAdminAccess(user)) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // 이번 주 시작 (월요일 기준)
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const daysToMonday = (currentDay + 6) % 7; // 월요일까지의 일수 계산
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 사용자 통계
    const totalUsers = await prisma.profile.count();
    const todayUsers = await prisma.profile.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    });
    const weekUsers = await prisma.profile.count({
      where: {
        createdAt: {
          gte: weekStart
        }
      }
    });

    // 분석 통계
    const totalAnalyses = await prisma.analysisResult.count();
    const todayAnalyses = await prisma.analysisResult.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    });
    const weekAnalyses = await prisma.analysisResult.count({
      where: {
        createdAt: {
          gte: weekStart
        }
      }
    });
    const monthAnalyses = await prisma.analysisResult.count({
      where: {
        createdAt: {
          gte: monthStart
        }
      }
    });

    // 상담 통계
    const totalConsultations = await prisma.consultationResult.count();
    const todayConsultations = await prisma.consultationResult.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    });
    const paidConsultations = await prisma.consultationResult.count({
      where: {
        isPaid: true
      }
    });

    // 매출 통계
    const totalRevenue = await prisma.consultationResult.aggregate({
      _sum: {
        paymentAmount: true
      },
      where: {
        isPaid: true
      }
    });

    const todayRevenue = await prisma.consultationResult.aggregate({
      _sum: {
        paymentAmount: true
      },
      where: {
        isPaid: true,
        paidAt: {
          gte: todayStart
        }
      }
    });

    // 인기 성격 유형 TOP 5
    const popularTypes = await prisma.analysisResult.groupBy({
      by: ['personalityType'],
      _count: {
        personalityType: true
      },
      orderBy: {
        _count: {
          personalityType: 'desc'
        }
      },
      take: 5
    });

    // 가입 경로 분포
    const providers = await prisma.profile.groupBy({
      by: ['provider'],
      _count: {
        provider: true
      }
    });

    // 최근 7일간 일별 가입자 수
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const count = await prisma.profile.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      last7Days.push({
        date: dayStart.toISOString().split('T')[0],
        count
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          today: todayUsers,
          week: weekUsers
        },
        analyses: {
          total: totalAnalyses,
          today: todayAnalyses,
          week: weekAnalyses,
          month: monthAnalyses
        },
        consultations: {
          total: totalConsultations,
          today: todayConsultations,
          paid: paidConsultations
        },
        revenue: {
          total: totalRevenue._sum.paymentAmount || 0,
          today: todayRevenue._sum.paymentAmount || 0
        },
        charts: {
          popularTypes: popularTypes.map(item => ({
            type: item.personalityType,
            count: item._count.personalityType
          })),
          providers: providers.map(item => ({
            provider: item.provider || 'unknown',
            count: item._count.provider
          })),
          userGrowth: last7Days
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}