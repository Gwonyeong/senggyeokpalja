import { createClient } from "./supabase";

// 로컬스토리지 키
const AUTH_TOKEN_KEY = 'plaja_auth_token';
const USER_DATA_KEY = 'plaja_user_data';
const TOKEN_EXPIRY_KEY = 'plaja_token_expiry';

// 토큰 만료 시간 (24시간)
const TOKEN_EXPIRY_HOURS = 24;

/**
 * 로컬스토리지에서 토큰 가져오기
 */
export function getStoredToken() {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) return null;

    // 토큰 만료 확인
    if (new Date().getTime() > parseInt(expiry)) {
      clearStoredAuth();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
}

/**
 * 로컬스토리지에서 사용자 데이터 가져오기
 */
export function getStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    const token = getStoredToken();

    if (!userData || !token) return null;

    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
}

/**
 * 로컬스토리지에 토큰과 사용자 데이터 저장
 */
export function storeAuth(token, userData) {
  if (typeof window === 'undefined') return;

  try {
    const expiry = new Date().getTime() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  } catch (error) {
    console.error('Error storing auth:', error);
  }
}

/**
 * 로컬스토리지에서 인증 정보 삭제
 */
export function clearStoredAuth() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing stored auth:', error);
  }
}

/**
 * Supabase를 통한 최초 로그인 (토큰 생성)
 */
export async function performSupabaseLogin(provider = 'google') {
  try {
    const supabase = createClient();

    const redirectUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");

    let authResult;

    if (provider === 'google') {
      authResult = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectUrl}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
    } else if (provider === 'naver') {
      authResult = await supabase.auth.signInWithOAuth({
        provider: "naver",
        options: {
          redirectTo: `${redirectUrl}/auth/callback`,
        },
      });
    } else if (provider === 'kakao') {
      authResult = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${redirectUrl}/auth/callback`,
        },
      });
    }

    if (authResult?.error) throw authResult.error;
    return authResult;
  } catch (error) {
    console.error('Supabase login error:', error);
    throw error;
  }
}

/**
 * 콜백에서 Supabase 세션을 가져와 로컬 토큰으로 변환
 */
export async function handleAuthCallback() {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;
    if (!session) throw new Error('No session found');

    // 사용자 정보 추출
    const userData = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.user_metadata?.nickname ||
            session.user.email?.split('@')[0] ||
            '사용자',
      avatar_url: session.user.user_metadata?.avatar_url ||
                  session.user.user_metadata?.picture,
      provider: session.user.app_metadata?.provider || 'email',
      email_verified: session.user.email_verified_at !== null
    };

    // 로컬스토리지에 저장
    storeAuth(session.access_token, userData);

    // 프로필 생성/업데이트 API 호출
    await fetch('/api/auth/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    // Supabase 세션 정리 (선택사항)
    await supabase.auth.signOut();

    return userData;
  } catch (error) {
    console.error('Auth callback error:', error);
    throw error;
  }
}

/**
 * 토큰이 유효한지 확인
 */
export function isTokenValid() {
  const token = getStoredToken();
  return token !== null;
}

/**
 * 로그아웃
 */
export async function logout() {
  try {
    // 로컬 스토리지 정리
    clearStoredAuth();

    // 서버에 로그아웃 알림 (선택사항)
    const token = getStoredToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        // 로그아웃 API 호출 실패해도 로컬 정리는 완료
        console.warn('Logout API call failed:', error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    // 에러가 있어도 로컬 정리는 강제 실행
    clearStoredAuth();
    throw error;
  }
}

/**
 * 관리자 권한 확인 (로컬 데이터 기반)
 */
export function checkAdminAccess() {
  const user = getStoredUser();
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
 * API 요청용 헤더 생성
 */
export function getAuthHeaders() {
  const token = getStoredToken();
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * 인증이 필요한 API 요청 래퍼
 */
export async function authenticatedFetch(url, options = {}) {
  const token = getStoredToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // 401 에러시 토큰 무효화
  if (response.status === 401) {
    clearStoredAuth();
    throw new Error('Authentication token expired');
  }

  return response;
}