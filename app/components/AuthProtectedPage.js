"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChange } from "@/lib/supabase-auth";
import { toast } from "sonner";
import LoginModal from "./LoginModal";

export default function AuthProtectedPage({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);

      // 로그인하지 않은 경우
      if (!authUser) {
        // 메인 페이지로 리다이렉트하고 Toast 메시지 표시
        toast.error("로그인이 필요한 서비스입니다.", {
          duration: 3000,
        });
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#FCA311",
        fontSize: "18px",
      }}>
        인증 확인 중...
      </div>
    );
  }

  // 로그인하지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!user) {
    return null;
  }

  return (
    <>
      {children}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}