import { NextResponse } from 'next/server';
import { logout } from '@/lib/custom-auth-server';

export async function POST() {
  try {
    await logout();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}