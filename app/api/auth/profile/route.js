import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { DEFAULT_TRANSACTION_OPTIONS } from '@/lib/db-config';
import { calculateSaju, determinePaljaType } from '@/lib/saju-utils';

// Supabase 클라이언트 생성 헬퍼 함수
async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

// GET 메서드: 프로필 정보 조회
export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        name: true,
        birthDate: true,
        birthTime: true,
        gender: true,
        mbti: true,
        calendar: true,
        isLeapMonth: true,
        personalityType: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT 메서드: 프로필 정보 업데이트
export async function PUT(request) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      birthDate,
      birthTime,
      gender,
      mbti,
      calendar,
      isLeapMonth,
      personalityType
    } = body;

    // 생년월일과 생시를 Date 객체로 변환
    let parsedBirthDate = null;
    let parsedBirthTime = null;
    let calculatedPersonalityType = personalityType;

    if (birthDate) {
      parsedBirthDate = new Date(birthDate);
    }

    if (birthTime) {
      // birthTime이 문자열인 경우 (예: "14:30") Date 객체로 변환
      if (typeof birthTime === 'string') {
        const [hours, minutes] = birthTime.split(':');
        const timeDate = new Date();
        timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        parsedBirthTime = timeDate;
      } else {
        parsedBirthTime = new Date(birthTime);
      }
    }

    // 생년월일, 생시, MBTI가 모두 있으면 팔자유형 자동 계산
    if (parsedBirthDate && parsedBirthTime && mbti) {
      try {
        const year = parsedBirthDate.getFullYear();
        const month = parsedBirthDate.getMonth() + 1;
        const day = parsedBirthDate.getDate();
        // 시간 인덱스 계산 (mypage의 생시 매핑과 동일한 로직)
        const hour = parsedBirthTime.getHours();
        const minute = parsedBirthTime.getMinutes();
        let timeIndex = 6; // 기본값 오시

        if (hour === 0 && minute >= 30) timeIndex = 0;
        else if (hour === 1 || (hour === 2 && minute < 30)) timeIndex = 0;
        else if ((hour === 2 && minute >= 30) || (hour === 3 && minute < 30)) timeIndex = 1;
        else if ((hour === 3 && minute >= 30) || (hour === 4 && minute < 30)) timeIndex = 1;
        else if ((hour === 4 && minute >= 30) || (hour === 5 && minute < 30)) timeIndex = 2;
        else if ((hour === 5 && minute >= 30) || (hour === 6 && minute < 30)) timeIndex = 2;
        else if ((hour === 6 && minute >= 30) || (hour === 7 && minute < 30)) timeIndex = 3;
        else if ((hour === 7 && minute >= 30) || (hour === 8 && minute < 30)) timeIndex = 3;
        else if ((hour === 8 && minute >= 30) || (hour === 9 && minute < 30)) timeIndex = 4;
        else if ((hour === 9 && minute >= 30) || (hour === 10 && minute < 30)) timeIndex = 4;
        else if ((hour === 10 && minute >= 30) || (hour === 11 && minute < 30)) timeIndex = 5;
        else if ((hour === 11 && minute >= 30) || (hour === 12 && minute < 30)) timeIndex = 5;
        else if ((hour === 12 && minute >= 30) || (hour === 13 && minute < 30)) timeIndex = 6;
        else if ((hour === 13 && minute >= 30) || (hour === 14 && minute < 30)) timeIndex = 6;
        else if ((hour === 14 && minute >= 30) || (hour === 15 && minute < 30)) timeIndex = 7;
        else if ((hour === 15 && minute >= 30) || (hour === 16 && minute < 30)) timeIndex = 7;
        else if ((hour === 16 && minute >= 30) || (hour === 17 && minute < 30)) timeIndex = 8;
        else if ((hour === 17 && minute >= 30) || (hour === 18 && minute < 30)) timeIndex = 8;
        else if ((hour === 18 && minute >= 30) || (hour === 19 && minute < 30)) timeIndex = 9;
        else if ((hour === 19 && minute >= 30) || (hour === 20 && minute < 30)) timeIndex = 9;
        else if ((hour === 20 && minute >= 30) || (hour === 21 && minute < 30)) timeIndex = 10;
        else if ((hour === 21 && minute >= 30) || (hour === 22 && minute < 30)) timeIndex = 10;
        else if ((hour === 22 && minute >= 30) || (hour === 23 && minute < 30)) timeIndex = 11;
        else if (hour === 23 && minute >= 30) timeIndex = 0;

        // 사주팔자 계산
        const sajuData = calculateSaju({
          year,
          month,
          day,
          hour: timeIndex.toString(),
          gender,
          calendar,
          isLeapMonth
        });

        if (sajuData && sajuData.success) {
          // 팔자유형 결정
          const paljaType = determinePaljaType(sajuData);

          // MBTI와 팔자유형 조합으로 최종 성격유형 결정
          calculatedPersonalityType = `${mbti.charAt(0)}${paljaType.charAt(1)}${mbti.charAt(2)}${paljaType.charAt(3)}`;
        }
      } catch (error) {
        console.error('Error calculating personality type:', error);
        // 계산 실패 시 기존 값 유지 또는 기본값 사용
      }
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        name,
        birthDate: parsedBirthDate,
        birthTime: parsedBirthTime,
        gender,
        mbti,
        calendar,
        isLeapMonth,
        personalityType: calculatedPersonalityType,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        name: true,
        birthDate: true,
        birthTime: true,
        gender: true,
        mbti: true,
        calendar: true,
        isLeapMonth: true,
        personalityType: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabase = await createSupabaseClient();

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