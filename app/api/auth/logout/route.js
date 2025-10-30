import { NextResponse } from 'next/server';
import { logout } from '@/lib/custom-auth-server';

export async function POST() {
  try {
    await logout();

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // 브라우저에 쿠키 삭제 지시
    response.cookies.set('plaja_auth', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/'
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