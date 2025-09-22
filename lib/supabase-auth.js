import { createClient } from "./supabase";

// 관리자 이메일 목록
export const ADMIN_USERS = [
  "jaehxxn7@naver.com",
  "tnalsqkr1234@gmail.com",
  "regend0726@gmail.com",
];

// Google 로그인
export async function signInWithGoogle() {
  const supabase = createClient();

  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw error;
  return data;
}

// 이메일/패스워드 로그인
export async function signInWithEmail(email, password) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// 이메일/패스워드 회원가입
export async function signUpWithEmail(email, password) {
  const supabase = createClient();

  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${redirectUrl}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// 로그아웃
export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 현재 사용자 가져오기
export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// 세션 가져오기
export async function getSession() {
  const supabase = createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// 인증 상태 변경 리스너
export function onAuthStateChange(callback) {
  const supabase = createClient();

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}

// 관리자 권한 확인
export function checkAdminAccess(user) {
  if (!user || !user.email) return false;
  return ADMIN_USERS.includes(user.email.toLowerCase());
}

// 계정 삭제
export async function deleteAccount() {
  try {
    // API를 통해 프로필 데이터 삭제
    const response = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete account');
    }

    // Supabase Auth에서 계정 삭제
    // 주의: 이 작업은 서버사이드 또는 서비스 키를 사용해야 함
    // 클라이언트에서는 직접 삭제 불가

    // 로그아웃
    await signOut();

    return { success: true };
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    throw error;
  }
}

// 사용자 프로필 생성/업데이트 (클라이언트에서 API 호출)
export async function upsertProfile() {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Profile upsert failed:', result.error);
      return null;
    }

    return result.profile;
  } catch (err) {
    console.error("Exception in upsertProfile:", err);
    return null;
  }
}

// Naver 로그인
export async function signInWithNaver() {
  const supabase = createClient();

  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "naver",
    options: {
      redirectTo: `${redirectUrl}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// Kakao 로그인
export async function signInWithKakao() {
  const supabase = createClient();

  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${redirectUrl}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}
