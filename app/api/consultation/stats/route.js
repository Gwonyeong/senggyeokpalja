import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 결제된 상담 수 조회
    const paidCount = await prisma.consultationResult.count({
      where: {
        isPaid: true
      }
    });

    return NextResponse.json({
      success: true,
      paidCount
    });
  } catch (error) {
    console.error('Consultation stats error:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}