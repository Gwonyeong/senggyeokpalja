// 클라이언트 사이드 전용 인증 함수들

// JWT 시크릿 키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'plaja-auth-secret-key-change-in-production';
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
 * JWT 토큰 디코딩 (검증 없이 페이로드만 추출)
 */
export function decodeToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;

    const decodedPayload = JSON.parse(atob(payload));

    // 토큰 만료 확인
    if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

/**
 * 쿠키에서 인증 토큰 추출 (클라이언트사이드)
 */
export function getAuthTokenFromDocument() {
  if (typeof document === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie =>
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );

    if (authCookie) {
      const token = authCookie.split('=')[1];
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token from document:', error);
    return null;
  }
}

/**
 * 쿠키 설정 (클라이언트사이드)
 */
export function setAuthCookieClient(token) {
  if (typeof document === 'undefined') return false;

  try {
    const secure = window.location.protocol === 'https:';
    document.cookie = `${COOKIE_NAME}=${token}; max-age=${COOKIE_MAX_AGE}; path=/; samesite=lax${secure ? '; secure' : ''}`;
    return true;
  } catch (error) {
    console.error('Error setting auth cookie on client:', error);
    return false;
  }
}

/**
 * 쿠키 삭제 (클라이언트사이드)
 */
export function clearAuthCookieClient() {
  if (typeof document === 'undefined') return false;

  try {
    // 현재 도메인에서 쿠키 삭제
    const domain = window.location.hostname;

    // 여러 방법으로 쿠키 삭제 시도
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=lax;`;
    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=lax;`;

    // localhost인 경우 domain 지정 안함
    if (domain !== 'localhost') {
      document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; SameSite=lax;`;
    }

    // 쿠키가 실제로 삭제되었는지 확인
    const remainingCookie = getAuthTokenFromDocument();
    if (remainingCookie) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing auth cookie on client:', error);
    return false;
  }
}

/**
 * 현재 사용자 정보 가져오기 (클라이언트사이드)
 */
export function getCurrentUserClient() {
  try {
    const token = getAuthTokenFromDocument();
    if (!token) return null;

    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      provider: decoded.provider
    };
  } catch (error) {
    console.error('Error getting current user on client:', error);
    return null;
  }
}

/**
 * 관리자 권한 확인 (클라이언트)
 */
export function checkAdminAccess(user) {
  if (!user || !user.email) return false;
  return ADMIN_USERS.includes(user.email.toLowerCase());
}

/**
 * 클라이언트 로그아웃
 */
export function logoutClient() {
  try {
    clearAuthCookieClient();
    return { success: true };
  } catch (error) {
    console.error('Error during client logout:', error);
    throw error;
  }
}