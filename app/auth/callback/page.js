"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "sonner";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();

      try {
        // URL에서 인증 코드 처리
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast.error("로그인 처리 중 오류가 발생했습니다.");
          router.push("/?error=callback_failed");
          return;
        }

        if (data.session) {
          // 자체 인증 시스템으로 마이그레이션
          const response = await fetch("/api/auth/migrate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              supabaseUser: data.session.user,
            }),
            credentials: "include",
          });

          const result = await response.json();

          if (result.success) {
            // 서버에서 쿠키 설정이 안된 경우를 대비해 클라이언트에서도 설정
            if (result.token) {
              const maxAge = 7 * 24 * 60 * 60; // 7일
              const secure = window.location.protocol === "https:";
              document.cookie = `plaja_auth=${
                result.token
              }; max-age=${maxAge}; path=/; samesite=lax${
                secure ? "; secure" : ""
              }`;
            }

            toast.success("로그인이 완료되었습니다!");
            // 페이지 강제 새로고침으로 쿠키 적용
            window.location.href = "/";
          } else {
            throw new Error(result.error || "Migration failed");
          }
        } else {
          toast.error("인증 세션을 찾을 수 없습니다.");
          router.push("/?error=no_session");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("로그인 처리 중 오류가 발생했습니다.");
        router.push("/?error=unexpected");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <PageWrapper>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <p>로그인 처리 중...</p>
      </div>
    </PageWrapper>
  );
}
