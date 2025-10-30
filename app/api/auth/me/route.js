import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/custom-auth-server';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}