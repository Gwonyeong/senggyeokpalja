"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChange } from "@/lib/supabase-auth";
import { toast } from "sonner";

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (authUser) => {
      setUser(authUser);
      setLoading(false);

      // 새 사용자 프로필 자동 생성
      if (authUser) {
        try {
          const { upsertProfile } = await import("../../lib/supabase-auth");
          const profile = await upsertProfile();
          console.log('useAuth: Profile auto-created/updated:', profile);
        } catch (error) {
          console.error('useAuth: Failed to auto-create profile:', error);
          // 프로필 생성 실패는 로그만 남기고 계속 진행
        }
      }

      // 인증이 필요한 페이지에서 로그인하지 않은 경우
      if (requireAuth && !authUser) {
        // 메인 페이지가 아닌 경우에만 리다이렉트
        if (pathname !== "/") {
          toast.error("로그인이 필요한 서비스입니다.");
          router.push("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAuth, router, pathname]);

  const checkAuth = () => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  return {
    user,
    loading,
    showLoginModal,
    setShowLoginModal,
    checkAuth,
    isAuthenticated: !!user,
  };
}

// 보호된 라우트 래퍼 컴포넌트
export function ProtectedRoute({ children }) {
  const { user, loading, showLoginModal, setShowLoginModal } = useAuth(true);
  // LoginModal 컴포넌트를 동적으로 import
  const [LoginModal, setLoginModal] = useState(null);

  useEffect(() => {
    import("@/app/components/LoginModal").then((module) => {
      setLoginModal(() => module.default);
    });
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#FCA311",
      }}>
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