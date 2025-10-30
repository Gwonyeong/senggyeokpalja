import { NextResponse } from 'next/server';
import { getCurrentUser, checkAdminAccess } from '@/lib/custom-auth-server';

/**
 * 자체 인증 시스템 기반 미들웨어
 */
export async function authenticateUser(request, options = {}) {
  const {
    requireAuth = true,
    requireAdmin = false,
    includeProfile = false
  } = options;

  try {
    // 인증이 필요하지 않은 경우
    if (!requireAuth) {
      return { user: null, error: null, response: null };
    }

    // 현재 사용자 가져오기
    const user = await getCurrentUser();

    if (!user) {
      return {
        user: null,
        error: 'Authentication required',
        response: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    // 관리자 권한 확인
    if (requireAdmin && !checkAdminAccess(user)) {
      return {
        user,
        error: 'Admin access required',
        response: NextResponse.json(
          { success: false, error: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      };
    }

    return {
      user,
      error: null,
      response: null
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      user: null,
      error: 'Authentication system error',
      response: NextResponse.json(
        { success: false, error: 'Authentication system error' },
        { status: 500 }
      )
    };
  }
}

/**
 * HOC: API 라우트 핸들러를 자체 인증으로 래핑
 */
export function withCustomAuth(handler, options = {}) {
  return async function wrappedHandler(request, context) {
    const authResult = await authenticateUser(request, options);

    if (authResult.response) {
      return authResult.response;
    }

    // 원래 핸들러에 인증 정보 추가하여 호출
    return handler(request, context, authResult);
  };
}