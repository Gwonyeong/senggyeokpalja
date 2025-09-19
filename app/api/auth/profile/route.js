import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function POST() {
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

    // 사용자 이름 결정
    let displayName = user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      user.user_metadata?.nickname;

    if (!displayName && user.email) {
      displayName = user.email.split("@")[0];
    }

    if (!displayName) {
      displayName = "사용자";
    }

    const profileData = {
      id: user.id,
      email: user.email || `temp_${user.id}@temp.local`,
      displayName: displayName,
      photoUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      provider: user.app_metadata?.provider || "email",
      emailVerified: user.email_verified_at !== null,
      lastSignInAt: new Date(),
    };

    console.log('Creating profile with data:', profileData);

    const profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        displayName: profileData.displayName,
        photoUrl: profileData.photoUrl,
        provider: profileData.provider,
        emailVerified: profileData.emailVerified,
        lastSignInAt: profileData.lastSignInAt,
      },
      create: profileData,
    });

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Exception in profile upsert:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create/update profile',
        details: error.message
      },
      { status: 500 }
    );
  }
}