import { NextResponse } from 'next/server';
import { logout } from '@/lib/custom-auth-server';
import { createClient } from '@/lib/supabase';

const COOKIE_NAME = 'plaja_auth';

export async function POST(request) {
  try {
    // 커스텀 auth 로그아웃
    await logout();

    // Supabase 세션도 함께 삭제
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (supabaseError) {
      console.log('Supabase logout failed (expected):', supabaseError.message);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // 커스텀 auth 쿠키 삭제
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/'
    });

    // Supabase 관련 쿠키들도 삭제
    const supabaseCookiePatterns = [
      'sb-zstwgwszakivdnhwbuei-auth-token',
      'sb-zstwgwszakivdnhwbuei-auth-token-code-verifier'
    ];

    supabaseCookiePatterns.forEach(pattern => {
      response.cookies.set(pattern, '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        expires: new Date(0),
        path: '/'
      });
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}