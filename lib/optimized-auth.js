import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

// 관리자 이메일 목록
const ADMIN_USERS = [
  "jaehxxn7@naver.com",
  "tnalsqkr1234@gmail.com",
  "regend0726@gmail.com",
  "rnjsdud980@gmail.com",
];

// 메모리 캐시 (프로덕션에서는 Redis 권장)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * 쿠키에서 직접 JWT 토큰 추출 및 검증
 */
function extractJWTFromCookies(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    // Supabase 쿠키에서 access_token 추출
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = decodeURIComponent(value);
      return acc;
    }, {});

    // 일반적인 Supabase 쿠키 이름들
    const possibleTokenKeys = [
      'sb-access-token',
      'supabase-auth-token',
      'sb-auth-token'
    ];

    for (const key of possibleTokenKeys) {
      if (cookies[key]) {
        try {
          // JWT 페이로드 디코딩 (간단한 검증)
          const [header, payload, signature] = cookies[key].split('.');
          if (header && payload && signature) {
            const decodedPayload = JSON.parse(atob(payload));

            // 토큰 만료 확인
            if (decodedPayload.exp && decodedPayload.exp * 1000 > Date.now()) {
              return {
                token: cookies[key],
                payload: decodedPayload,
                userId: decodedPayload.sub,
                email: decodedPayload.email
              };
            }
          }
        } catch (e) {
          continue;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('JWT extraction error:', error);
    return null;
  }
}

/**
 * 캐시에서 사용자 정보 조회
 */
function getCachedUser(userId) {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  return null;
}

/**
 * 사용자 정보 캐시에 저장
 */
function setCachedUser(userId, user) {
  userCache.set(userId, {
    user,
    timestamp: Date.now()
  });
}

/**
 * 관리자 권한 확인
 */
function checkAdminAccess(user) {
  if (!user || !user.email) return false;
  return ADMIN_USERS.includes(user.email.toLowerCase());
}

/**
 * 최적화된 인증 확인 함수
 * 1. 쿠키에서 JWT 직접 파싱 (Supabase 호출 없이)
 * 2. 캐시 확인
 * 3. 필요시에만 Supabase 호출
 */
export async function optimizedAuth(request, options = {}) {
  const {
    requireAuth = true,
    requireAdmin = false,
    includeProfile = false,
    skipCache = false
  } = options;

  try {
    // 1. 인증이 불필요한 경우
    if (!requireAuth) {
      return { user: null, profile: null, error: null, response: null };
    }

    // 2. 쿠키에서 JWT 직접 추출
    const jwtData = extractJWTFromCookies(request);
    if (!jwtData) {
      return {
        user: null,
        profile: null,
        error: 'No valid authentication token',
        response: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    // 3. 캐시 확인 (skipCache가 false인 경우에만)
    let user = null;
    if (!skipCache) {
      user = getCachedUser(jwtData.userId);
    }

    // 4. 캐시에 없거나 skipCache인 경우 Supabase 호출
    if (!user) {
      const supabase = await createClient();
      const { data: { user: authUser }, error } = await supabase.auth.getUser();

      if (error || !authUser) {
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

      user = authUser;

      // 캐시에 저장
      if (!skipCache) {
        setCachedUser(jwtData.userId, user);
      }
    }

    // 5. 관리자 권한 확인
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

    // 6. 프로필 정보 조회 (필요한 경우)
    let profile = null;
    if (includeProfile) {
      profile = await prisma.profile.findUnique({
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
          phone: true,
          provider: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

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

  } catch (error) {
    console.error('Optimized auth error:', error);
    return {
      user: null,
      profile: null,
      error: 'Authentication system error',
      response: NextResponse.json(
        { success: false, error: 'Authentication system error' },
        { status: 500 }
      )
    };
  }
}

/**
 * HOC: API 라우트 핸들러를 최적화된 인증으로 래핑
 */
export function withOptimizedAuth(handler, options = {}) {
  return async function wrappedHandler(request, context) {
    const authResult = await optimizedAuth(request, options);

    if (authResult.response) {
      return authResult.response;
    }

    // 원래 핸들러에 인증 정보 추가하여 호출
    return handler(request, context, authResult);
  };
}

/**
 * 캐시 정리 함수 (메모리 누수 방지)
 */
export function clearExpiredCache() {
  const now = Date.now();
  for (const [userId, cached] of userCache.entries()) {
    if (now - cached.timestamp >= CACHE_TTL) {
      userCache.delete(userId);
    }
  }
}

/**
 * 특정 사용자 캐시 무효화
 */
export function invalidateUserCache(userId) {
  userCache.delete(userId);
}

/**
 * 전체 캐시 무효화
 */
export function clearAllCache() {
  userCache.clear();
}

// 주기적 캐시 정리 (10분마다)
setInterval(clearExpiredCache, 10 * 60 * 1000);