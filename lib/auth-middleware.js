import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/lib/prisma';

/**
 * Authorization 헤더에서 Bearer 토큰 추출
 */
function extractBearerToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // "Bearer " 제거
}

/**
 * Supabase JWT 토큰 검증
 */
async function verifySupabaseToken(token) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: false,
        },
        cookies: {
          getAll() { return []; },
          setAll() {}
        }
      }
    );

    // 토큰으로 사용자 정보 가져오기
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Invalid token');
    }

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * 사용자 프로필 조회 (DB에서)
 */
async function getUserProfile(userId) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        name: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * 관리자 권한 확인
 */
function checkAdminAccess(user) {
  if (!user || !user.email) return false;

  const ADMIN_USERS = [
    "jaehxxn7@naver.com",
    "tnalsqkr1234@gmail.com",
    "regend0726@gmail.com",
    "rnjsdud980@gmail.com",
  ];

  return ADMIN_USERS.includes(user.email.toLowerCase());
}

/**
 * API 라우트 인증 미들웨어
 * @param {Request} request - Next.js Request 객체
 * @param {Object} options - 옵션 설정
 * @param {boolean} options.requireAuth - 인증 필수 여부 (기본: true)
 * @param {boolean} options.requireAdmin - 관리자 권한 필수 여부 (기본: false)
 * @param {boolean} options.includeProfile - 프로필 정보 포함 여부 (기본: false)
 * @returns {Object} { user, profile, error, response }
 */
export async function authenticateRequest(request, options = {}) {
  const {
    requireAuth = true,
    requireAdmin = false,
    includeProfile = false
  } = options;

  // 인증이 필요하지 않은 경우
  if (!requireAuth) {
    return { user: null, profile: null, error: null, response: null };
  }

  // 토큰 추출
  const token = extractBearerToken(request);
  if (!token) {
    return {
      user: null,
      profile: null,
      error: 'Missing authentication token',
      response: NextResponse.json(
        { success: false, error: 'Authentication token required' },
        { status: 401 }
      )
    };
  }

  // 토큰 검증
  const user = await verifySupabaseToken(token);
  if (!user) {
    return {
      user: null,
      profile: null,
      error: 'Invalid authentication token',
      response: NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    };
  }

  // 관리자 권한 확인
  if (requireAdmin && !checkAdminAccess(user)) {
    return {
      user,
      profile: null,
      error: 'Admin access required',
      response: NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    };
  }

  // 프로필 정보 조회
  let profile = null;
  if (includeProfile) {
    profile = await getUserProfile(user.id);
    if (!profile) {
      return {
        user,
        profile: null,
        error: 'User profile not found',
        response: NextResponse.json(
          { success: false, error: 'User profile not found' },
          { status: 404 }
        )
      };
    }
  }

  return {
    user,
    profile,
    error: null,
    response: null
  };
}

/**
 * HOC: API 라우트 핸들러를 인증으로 래핑
 */
export function withAuth(handler, options = {}) {
  return async function wrappedHandler(request, context) {
    const authResult = await authenticateRequest(request, options);

    if (authResult.response) {
      return authResult.response;
    }

    // 원래 핸들러에 인증 정보 추가하여 호출
    return handler(request, context, authResult);
  };
}

/**
 * 간단한 인증 확인 함수 (기존 API와 호환성을 위한)
 */
export async function getAuthenticatedUser(request) {
  const authResult = await authenticateRequest(request, {
    requireAuth: true,
    includeProfile: true
  });

  if (authResult.error) {
    throw new Error(authResult.error);
  }

  return {
    user: authResult.user,
    profile: authResult.profile
  };
}

/**
 * 관리자 인증 확인 함수
 */
export async function getAuthenticatedAdmin(request) {
  const authResult = await authenticateRequest(request, {
    requireAuth: true,
    requireAdmin: true,
    includeProfile: true
  });

  if (authResult.error) {
    throw new Error(authResult.error);
  }

  return {
    user: authResult.user,
    profile: authResult.profile
  };
}