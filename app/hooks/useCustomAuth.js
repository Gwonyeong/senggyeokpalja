"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUserClient, checkAdminAccess, logoutClient } from "@/lib/custom-auth-client";
import { toast } from "sonner";

export function useCustomAuth(requireAuth = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 인증 상태 확인 함수
  const checkAuthState = async () => {
    try {
      const currentUser = getCurrentUserClient();

      if (currentUser) {
        // 서버에서 최신 사용자 정보 가져오기
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setUser(data.user);
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          setUser(currentUser);
        }
      } else {
        // 로그아웃 중이면 Supabase 세션 확인 건너뛰기
        if (isLoggingOut) {
          setUser(null);
          return;
        }

        // 커스텀 auth 토큰이 없는 경우, Supabase 세션 확인 및 마이그레이션 시도
        try {
          const { createClient } = await import('@/lib/supabase');
          const supabase = createClient();
          const { data: { session }, error } = await supabase.auth.getSession();

          if (!error && session?.user) {
            // 자동 마이그레이션 실행
            const response = await fetch('/api/auth/migrate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                supabaseUser: session.user
              }),
              credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
              // 클라이언트에서도 쿠키 설정
              if (result.token) {
                const maxAge = 7 * 24 * 60 * 60; // 7일
                const secure = window.location.protocol === 'https:';
                document.cookie = `plaja_auth=${result.token}; max-age=${maxAge}; path=/; samesite=lax${secure ? '; secure' : ''}`;

                // 마이그레이션 후 다시 인증 상태 확인
                setTimeout(() => {
                  checkAuthState();
                }, 100);
                return;
              }
            }
          }
        } catch (error) {
          // Supabase 세션 확인 실패는 무시
        }

        setUser(null);
      }

      setLoading(false);

      // 인증이 필요한 페이지에서 로그인하지 않은 경우
      if (requireAuth && !currentUser) {
        if (pathname !== "/") {
          toast.error("로그인이 필요한 서비스입니다.");
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();
    // 주기적 인증 확인 제거 - 성능 최적화를 위해 필요시에만 확인
  }, [requireAuth, router, pathname]);

  const checkAuth = () => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);

      // 서버에 로그아웃 요청
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // 클라이언트 로그아웃
      logoutClient();

      // 상태 업데이트
      setUser(null);
      toast.success("로그아웃되었습니다.");

      // 라우터로 이동
      router.push("/");

      // 로그아웃 상태 해제 (재마이그레이션 방지용)
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);

    } catch (error) {
      console.error("Logout error:", error);
      // 에러가 발생해도 클라이언트에서 로그아웃 처리
      logoutClient();
      setUser(null);
      router.push("/");
      setIsLoggingOut(false);
    }
  };

  const refreshUser = () => {
    checkAuthState();
  };

  return {
    user,
    loading,
    showLoginModal,
    setShowLoginModal,
    checkAuth,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user ? checkAdminAccess(user) : false,
  };
}

// 보호된 라우트 래퍼 컴포넌트
export function ProtectedRoute({ children }) {
  const { user, loading, showLoginModal, setShowLoginModal } = useCustomAuth(true);
  const [LoginModal, setLoginModal] = useState(null);

  useEffect(() => {
    import("@/app/components/LoginModal").then((module) => {
      setLoginModal(() => module.default);
    });
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0a0a0a",
          color: "#FCA311",
        }}
      >
        로딩 중...
      </div>
    );
  }

  return (
    <>
      {children}
      {LoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </>
  );
}