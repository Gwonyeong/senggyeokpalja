import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

    console.log('Creating profile with data:', profileData);

    // 1. 먼저 현재 사용자 ID로 프로필 찾기
    let profile = await prisma.profile.findUnique({
      where: { id: user.id }
    });

    if (profile) {
      // 기존 프로필이 있으면 업데이트
      profile = await prisma.profile.update({
        where: { id: user.id },
        data: {
          displayName: profileData.displayName,
          photoUrl: profileData.photoUrl,
          provider: profileData.provider,
          emailVerified: profileData.emailVerified,
          lastSignInAt: profileData.lastSignInAt,
        }
      });
      console.log('Profile updated by ID:', profile);
    } else {
      // 2. 사용자 ID로 찾을 수 없으면 이메일로 기존 프로필 찾기
      const existingProfileByEmail = await prisma.profile.findUnique({
        where: { email: profileData.email }
      });

      if (existingProfileByEmail) {
        // 이메일로 기존 프로필을 찾은 경우 - 기존 프로필의 ID가 다르면 마이그레이션 처리
        console.log('Found existing profile by email:', existingProfileByEmail);

        if (existingProfileByEmail.id !== user.id) {
          console.log('Profile ID mismatch - migrating profile');

          // 트랜잭션을 사용해서 안전하게 프로필 마이그레이션
          profile = await prisma.$transaction(async (tx) => {
            // 1. 기존 프로필 삭제
            await tx.profile.delete({
              where: { email: profileData.email }
            });

            // 2. 새 ID로 프로필 생성
            return await tx.profile.create({
              data: {
                ...profileData,
                // 기존 프로필의 생성일 유지
                createdAt: existingProfileByEmail.createdAt
              }
            });
          });

          console.log('Profile migrated with new ID:', profile);
        } else {
          // ID가 같으면 단순 업데이트
          profile = await prisma.profile.update({
            where: { email: profileData.email },
            data: {
              displayName: profileData.displayName,
              photoUrl: profileData.photoUrl,
              provider: profileData.provider,
              emailVerified: profileData.emailVerified,
              lastSignInAt: profileData.lastSignInAt,
            }
          });
          console.log('Profile updated by email:', profile);
        }
      } else {
        // 3. 완전히 새로운 사용자 - 새 프로필 생성
        try {
          profile = await prisma.profile.create({
            data: profileData
          });
          console.log('New profile created:', profile);
        } catch (createError) {
          if (createError.code === 'P2002') {
            // 동시성 이슈로 인한 중복 생성 시도 - 다시 조회
            console.log('Concurrent creation detected, fetching existing profile');
            profile = await prisma.profile.findUnique({
              where: { email: profileData.email }
            });

            if (profile) {
              if (profile.id !== user.id) {
                // ID가 다르면 마이그레이션 필요
                profile = await prisma.$transaction(async (tx) => {
                  await tx.profile.delete({
                    where: { email: profileData.email }
                  });
                  return await tx.profile.create({
                    data: {
                      ...profileData,
                      createdAt: profile.createdAt
                    }
                  });
                });
              } else {
                // ID가 같으면 단순 업데이트
                profile = await prisma.profile.update({
                  where: { email: profileData.email },
                  data: {
                    displayName: profileData.displayName,
                    photoUrl: profileData.photoUrl,
                    provider: profileData.provider,
                    emailVerified: profileData.emailVerified,
                    lastSignInAt: profileData.lastSignInAt,
                  }
                });
              }
            }
          } else {
            throw createError;
          }
        }
      }
    }

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