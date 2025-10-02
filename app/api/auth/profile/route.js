import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { DEFAULT_TRANSACTION_OPTIONS } from '@/lib/db-config';

export async function POST() {
  try {
    // 서버 사이드용 Supabase 클라이언트 생성
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
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // 서버 컴포넌트에서는 쿠키 설정이 불가능할 수 있음
            }
          },
        },
      }
    );

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

    // 단일 트랜잭션으로 모든 작업 처리 (연결 풀 최적화)
    const profile = await prisma.$transaction(async (tx) => {
      // 먼저 ID로 조회
      let existingProfile = await tx.profile.findUnique({
        where: { id: user.id }
      });

      if (existingProfile) {
        // ID로 찾은 경우 업데이트
        return await tx.profile.update({
          where: { id: user.id },
          data: {
            displayName: profileData.displayName,
            photoUrl: profileData.photoUrl,
            provider: profileData.provider,
            emailVerified: profileData.emailVerified,
            lastSignInAt: profileData.lastSignInAt,
          }
        });
      }

      // ID로 못 찾으면 이메일로 조회
      const existingProfileByEmail = await tx.profile.findUnique({
        where: { email: profileData.email }
      });

      if (existingProfileByEmail) {
        // 이메일로 찾은 경우 - ID가 다르면 기존 삭제 후 새로 생성
        await tx.profile.delete({
          where: { email: profileData.email }
        });

        return await tx.profile.create({
          data: {
            ...profileData,
            createdAt: existingProfileByEmail.createdAt
          }
        });
      }

      // 완전히 새로운 사용자
      return await tx.profile.create({
        data: profileData
      });
    }, DEFAULT_TRANSACTION_OPTIONS);

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Exception in profile upsert:', error);

    // P2002 에러 (unique constraint) 재시도 로직
    if (error.code === 'P2002') {
      try {
        // 단순 조회 후 반환
        const existingProfile = await prisma.profile.findFirst({
          where: {
            OR: [
              { id: profileData.id },
              { email: profileData.email }
            ]
          }
        });

        if (existingProfile) {
          return NextResponse.json({
            success: true,
            profile: existingProfile
          });
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }

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