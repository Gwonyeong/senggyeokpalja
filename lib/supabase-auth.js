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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
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
  const supabase = createClient();

  // 현재 사용자 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("로그인된 사용자가 없습니다.");

  // 사용자 프로필 및 관련 데이터 삭제 (cascade delete 설정되어 있음)
  const { error: deleteError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (deleteError) throw deleteError;

  // Supabase Auth에서 계정 삭제
  // 주의: 이 작업은 서버사이드 또는 서비스 키를 사용해야 함
  // 클라이언트에서는 직접 삭제 불가

  // 로그아웃
  await signOut();

  return { success: true };
}

// 사용자 프로필 생성/업데이트
export async function upsertProfile(user) {
  const supabase = createClient();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name || user.email?.split("@")[0],
      photoURL: user.user_metadata?.avatar_url,
      provider: user.app_metadata?.provider || "email",
      emailVerified: user.email_verified_at !== null,
      lastSignInAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting profile:", error);
    return null;
  }

  return data;
}

// Naver 로그인
export async function signInWithNaver() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "naver",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// Kakao 로그인
export async function signInWithKakao() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}
