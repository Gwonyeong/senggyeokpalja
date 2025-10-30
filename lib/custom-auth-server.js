import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// JWT 시크릿 키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'plaja-auth-secret-key-change-in-production';
const COOKIE_NAME = 'plaja_auth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7일

// 관리자 이메일 목록
const ADMIN_USERS = [
  "jaehxxn7@naver.com",
  "tnalsqkr1234@gmail.com",
  "regend0726@gmail.com",
  "rnjsdud980@gmail.com",
];

/**
 * JWT 토큰 생성
 */
export function createAuthToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name || user.displayName,
    provider: user.provider,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE
  };

  return jwt.sign(payload, JWT_SECRET);
}

/**
 * JWT 토큰 검증
 */
export function verifyAuthToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * 쿠키에서 인증 토큰 추출 (서버사이드)
 */
export async function getAuthTokenFromCookies() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);
    return token?.value || null;
  } catch (error) {
    console.error('Error getting auth token from cookies:', error);
    return null;
  }
}

/**
 * 쿠키 설정 (서버사이드)
 */
export async function setAuthCookie(token) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: false,  // 클라이언트에서 읽을 수 있도록 설정
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    });
    return true;
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return false;
  }
}

/**
 * 쿠키 삭제 (서버사이드)
 */
export async function clearAuthCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return true;
  } catch (error) {
    console.error('Error clearing auth cookie:', error);
    return false;
  }
}

/**
 * 현재 사용자 정보 가져오기 (서버사이드)
 */
export async function getCurrentUser() {
  try {
    const token = await getAuthTokenFromCookies();
    if (!token) return null;

    const decoded = verifyAuthToken(token);
    if (!decoded) return null;

    // DB에서 사용자 정보 조회
    const user = await prisma.profile.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        name: true,
        provider: true,
        emailVerified: true,
        birthDate: true,
        birthTime: true,
        gender: true,
        mbti: true,
        calendar: true,
        isLeapMonth: true,
        personalityType: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * 관리자 권한 확인
 */
export function checkAdminAccess(user) {
  if (!user || !user.email) return false;
  return ADMIN_USERS.includes(user.email.toLowerCase());
}

/**
 * Supabase 사용자를 자체 인증으로 마이그레이션
 */
export async function migrateSupabaseUser(supabaseUser) {
  try {
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

    // 쿠키 설정
    await setAuthCookie(token);

    return profile;
  } catch (error) {
    console.error('Error migrating Supabase user:', error);
    throw error;
  }
}

/**
 * 로그아웃
 */
export async function logout() {
  try {
    await clearAuthCookie();
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
}