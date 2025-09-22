import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Supabase Auth user의 email로 profiles 테이블에서 실제 profile 찾기
    const profile = await prisma.profile.findUnique({
      where: {
        email: user.email
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // profiles의 id를 사용해서 AnalysisResult 조회
    const analysisResults = await prisma.analysisResult.findMany({
      where: {
        userId: profile.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return NextResponse.json(analysisResults);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}