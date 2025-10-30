import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuthToken } from '@/lib/custom-auth-server';

const COOKIE_NAME = 'plaja_auth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7일

export async function POST(request) {
  try {
    const body = await request.json();
    const { supabaseUser } = body;

    if (!supabaseUser) {
      return NextResponse.json(
        { success: false, error: 'Supabase user data required' },
        { status: 400 }
      );
    }

    // 사용자 이름 결정
    let displayName = supabaseUser.user_metadata?.full_name ||
                      supabaseUser.user_metadata?.name ||
                      supabaseUser.user_metadata?.nickname;

    if (!displayName && supabaseUser.email) {
      displayName = supabaseUser.email.split("@")[0];
    }

    if (!displayName) {
      displayName = "사용자";
    }

    // 프로필 생성/업데이트
    const profile = await prisma.profile.upsert({
      where: { id: supabaseUser.id },
      update: {
        email: supabaseUser.email || `temp_${supabaseUser.id}@temp.local`,
        displayName: displayName,
        photoUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
        provider: supabaseUser.app_metadata?.provider || "email",
        emailVerified: supabaseUser.email_verified_at !== null,
        lastSignInAt: new Date(),
      },
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email || `temp_${supabaseUser.id}@temp.local`,
        displayName: displayName,
        photoUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
        provider: supabaseUser.app_metadata?.provider || "email",
        emailVerified: supabaseUser.email_verified_at !== null,
        lastSignInAt: new Date(),
      }
    });

    // JWT 토큰 생성
    const token = createAuthToken(profile);

    // Response 객체 생성
    const response = NextResponse.json({
      success: true,
      user: profile,
      token: token, // 클라이언트에서 쿠키를 설정할 수 있도록 토큰 포함
      message: 'User migrated successfully'
    });

    // 쿠키 직접 설정 (HttpOnly 제거하여 클라이언트 접근 가능)
    const cookieOptions = {
      httpOnly: false,  // 클라이언트에서 읽을 수 있도록 설정
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    };

    // 방법 1: Next.js cookies API 사용
    response.cookies.set(COOKIE_NAME, token, cookieOptions);

    // 방법 2: Set-Cookie 헤더 직접 설정 (백업)
    const isSecure = process.env.NODE_ENV === 'production';
    const cookieValue = `${COOKIE_NAME}=${token}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=lax${isSecure ? '; Secure' : ''}`;
    response.headers.set('Set-Cookie', cookieValue);

    return response;

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}