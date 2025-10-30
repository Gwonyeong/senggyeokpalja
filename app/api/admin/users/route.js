import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, checkAdminAccess } from '@/lib/custom-auth-server';

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
        { success: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const provider = searchParams.get('provider') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (provider) {
      where.provider = provider;
    }

    // 병렬로 사용자 목록과 전체 수 조회
    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order
        },
        include: {
          _count: {
            select: {
              analysisResults: true,
              synergyAnalysis: true,
              consultationResults: true,
              savedResults: true
            }
          },
          // 유료 상담 여부를 한 번에 조회
          consultationResults: {
            where: { isPaid: true },
            take: 1,
            select: { id: true }
          }
        }
      }),
      prisma.profile.count({ where })
    ]);

    // 각 사용자의 추가 정보 처리 (DB 쿼리 없이)
    const enrichedUsers = users.map((user) => {
      const { consultationResults, ...userData } = user;
      return {
        ...userData,
        hasPaidConsultation: consultationResults.length > 0
      };
    });

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { success: false, error: '사용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}