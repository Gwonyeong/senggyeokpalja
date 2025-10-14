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

    // 사용자 목록 조회
    const users = await prisma.profile.findMany({
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
        }
      }
    });

    // 전체 사용자 수
    const total = await prisma.profile.count({ where });

    // 각 사용자의 추가 정보 조회
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      // 마지막 분석 날짜
      const lastAnalysis = await prisma.analysisResult.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      // 유료 상담 여부
      const hasPaidConsultation = await prisma.consultationResult.count({
        where: {
          userId: user.id,
          isPaid: true
        }
      });

      return {
        ...user,
        lastAnalysis: lastAnalysis?.createdAt || null,
        hasPaidConsultation: hasPaidConsultation > 0
      };
    }));

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