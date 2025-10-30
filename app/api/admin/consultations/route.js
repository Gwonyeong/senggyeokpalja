import { NextResponse } from 'next/server';
import { getCurrentUser, checkAdminAccess } from '@/lib/custom-auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!checkAdminAccess(user)) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter') || 'all'; // all, paid, unpaid
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where = {};
    if (filter === 'paid') {
      where.isPaid = true;
    } else if (filter === 'unpaid') {
      where.isPaid = false;
    }

    // 정렬 조건 구성
    let orderBy = {};

    if (sortBy === 'paidAt') {
      // 결제일 정렬: null 값은 항상 마지막에 배치
      if (order === 'desc') {
        // 최신순: 결제일이 있는 것들을 최신순으로, null은 마지막
        orderBy = [
          { paidAt: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' }
        ];
      } else {
        // 오래된순: 결제일이 있는 것들을 오래된순으로, null은 마지막
        orderBy = [
          { paidAt: { sort: 'asc', nulls: 'last' } },
          { createdAt: 'asc' }
        ];
      }
    } else if (sortBy === 'birthDate') {
      // 생년월일 정렬: null 값은 마지막에 배치
      orderBy = [
        { birthDate: order === 'desc' ? 'desc' : 'asc' },
        { createdAt: order === 'desc' ? 'desc' : 'asc' }
      ];
    } else {
      orderBy = { [sortBy]: order === 'desc' ? 'desc' : 'asc' };
    }

    // 상담 목록 조회
    const consultations = await prisma.consultationResult.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            email: true,
            displayName: true
          }
        }
      }
    });

    // 전체 상담 수
    const total = await prisma.consultationResult.count({ where });

    // 상담 통계
    const stats = {
      total: await prisma.consultationResult.count(),
      paid: await prisma.consultationResult.count({ where: { isPaid: true } }),
      unpaid: await prisma.consultationResult.count({ where: { isPaid: false } }),
      totalRevenue: await prisma.consultationResult.aggregate({
        _sum: { paymentAmount: true },
        where: { isPaid: true }
      })
    };

    // 오행 분포 통계
    const elementDistribution = await prisma.consultationResult.groupBy({
      by: ['dominantElement'],
      _count: {
        dominantElement: true
      },
      where: {
        dominantElement: {
          not: null
        }
      }
    });

    // 결제 방법 통계
    const paymentMethods = await prisma.consultationResult.groupBy({
      by: ['paymentMethod'],
      _count: {
        paymentMethod: true
      },
      where: {
        paymentMethod: {
          not: null
        }
      }
    });

    // 월별 매출 (최근 6개월)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const revenue = await prisma.consultationResult.aggregate({
        _sum: { paymentAmount: true },
        _count: { id: true },
        where: {
          isPaid: true,
          paidAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      monthlyRevenue.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        revenue: revenue._sum.paymentAmount || 0,
        count: revenue._count.id
      });
    }

    return NextResponse.json({
      success: true,
      consultations,
      stats: {
        ...stats,
        totalRevenue: stats.totalRevenue._sum.paymentAmount || 0,
        elementDistribution: elementDistribution.map(item => ({
          element: item.dominantElement,
          count: item._count.dominantElement
        })),
        paymentMethods: paymentMethods.map(item => ({
          method: item.paymentMethod,
          count: item._count.paymentMethod
        })),
        monthlyRevenue
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin consultations error:', error);
    return NextResponse.json(
      { success: false, error: '상담 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}