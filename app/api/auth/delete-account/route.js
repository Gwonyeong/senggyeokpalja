import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    // Supabase 클라이언트 생성 및 인증 확인
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 사용자 프로필 및 관련 데이터 삭제 (cascade delete 설정되어 있음)
    await prisma.profile.delete({
      where: { id: user.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete account',
        details: error.message
      },
      { status: 500 }
    );
  }
}