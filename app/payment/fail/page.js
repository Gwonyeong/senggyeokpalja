"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState({
    code: "",
    message: "",
    orderId: ""
  });

  useEffect(() => {
    setErrorInfo({
      code: searchParams.get("code") || "UNKNOWN_ERROR",
      message: searchParams.get("message") || "결제에 실패했습니다",
      orderId: searchParams.get("orderId") || ""
    });
  }, [searchParams]);

  const handleRetry = () => {
    router.back();
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <PageWrapper>
      <div className="analyze-page">
        <main>
          <section id="analyzer">
            <div className="container">
              <div className="analyzer-layout">
                <div className="card analyzer-card">
                  <div className="card-header">
                    <h2 className="card-title sage-title">
                      <span className="sage-subtitle">결제 실패</span>
                    </h2>
                  </div>
                  <div className="card-body">
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: "48px", color: "#ff4444", marginBottom: "20px" }}>
                        ❌
                      </div>
                      <h3 style={{ color: "#ff4444", marginBottom: "15px" }}>
                        결제에 실패했습니다
                      </h3>
                      <p style={{ color: "#ccc", marginBottom: "10px", lineHeight: "1.5" }}>
                        {errorInfo.message}
                      </p>
                      {errorInfo.code && (
                        <p style={{ color: "#666", fontSize: "14px", marginBottom: "30px" }}>
                          오류 코드: {errorInfo.code}
                        </p>
                      )}

                      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                        <button
                          onClick={handleRetry}
                          style={{
                            padding: "12px 24px",
                            backgroundColor: "#d4af37",
                            color: "#000",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                        >
                          다시 시도
                        </button>
                        <button
                          onClick={handleHome}
                          style={{
                            padding: "12px 24px",
                            backgroundColor: "#333",
                            color: "#ccc",
                            border: "1px solid #555",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                        >
                          홈으로
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PageWrapper>
  );
}