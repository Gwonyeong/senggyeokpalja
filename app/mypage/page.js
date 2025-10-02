"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChange,
  getCurrentUser,
  signOut,
  deleteAccount,
} from "../../lib/supabase-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageWrapper from "@/components/PageWrapper";

export default function MyPage() {
  const [savedResults, setSavedResults] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [consultationResults, setConsultationResults] = useState([]);
  const [consultationPage, setConsultationPage] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 생시 매핑 함수
  const getBirthTimeDisplay = (birthTime) => {
    if (!birthTime) return null;

    const time = new Date(birthTime);
    const hour = time.getUTCHours();
    const minute = time.getUTCMinutes();

    const timeMap = {
      0: { emoji: "🐭", name: "자시" }, // 23:30 ~ 01:29
      1: { emoji: "🐮", name: "축시" }, // 01:30 ~ 03:29
      2: { emoji: "🐯", name: "인시" }, // 03:30 ~ 05:29
      3: { emoji: "🐰", name: "묘시" }, // 05:30 ~ 07:29
      4: { emoji: "🐲", name: "진시" }, // 07:30 ~ 09:29
      5: { emoji: "🐍", name: "사시" }, // 09:30 ~ 11:29
      6: { emoji: "🐴", name: "오시" }, // 11:30 ~ 13:29
      7: { emoji: "🐑", name: "미시" }, // 13:30 ~ 15:29
      8: { emoji: "🐵", name: "신시" }, // 15:30 ~ 17:29
      9: { emoji: "🐔", name: "유시" }, // 17:30 ~ 19:29
      10: { emoji: "🐶", name: "술시" }, // 19:30 ~ 21:29
      11: { emoji: "🐷", name: "해시" }, // 21:30 ~ 23:29
    };

    // 시간 인덱스 계산 (analyze 페이지와 동일한 로직)
    let timeIndex = 6; // 기본값 오시

    if (hour === 0 && minute >= 30) timeIndex = 0;
    else if (hour === 1 || (hour === 2 && minute < 30)) timeIndex = 0;
    else if ((hour === 2 && minute >= 30) || (hour === 3 && minute < 30))
      timeIndex = 1;
    else if ((hour === 3 && minute >= 30) || (hour === 4 && minute < 30))
      timeIndex = 1;
    else if ((hour === 4 && minute >= 30) || (hour === 5 && minute < 30))
      timeIndex = 2;
    else if ((hour === 5 && minute >= 30) || (hour === 6 && minute < 30))
      timeIndex = 2;
    else if ((hour === 6 && minute >= 30) || (hour === 7 && minute < 30))
      timeIndex = 3;
    else if ((hour === 7 && minute >= 30) || (hour === 8 && minute < 30))
      timeIndex = 3;
    else if ((hour === 8 && minute >= 30) || (hour === 9 && minute < 30))
      timeIndex = 4;
    else if ((hour === 9 && minute >= 30) || (hour === 10 && minute < 30))
      timeIndex = 4;
    else if ((hour === 10 && minute >= 30) || (hour === 11 && minute < 30))
      timeIndex = 5;
    else if ((hour === 11 && minute >= 30) || (hour === 12 && minute < 30))
      timeIndex = 5;
    else if ((hour === 12 && minute >= 30) || (hour === 13 && minute < 30))
      timeIndex = 6;
    else if ((hour === 13 && minute >= 30) || (hour === 14 && minute < 30))
      timeIndex = 6;
    else if ((hour === 14 && minute >= 30) || (hour === 15 && minute < 30))
      timeIndex = 7;
    else if ((hour === 15 && minute >= 30) || (hour === 16 && minute < 30))
      timeIndex = 7;
    else if ((hour === 16 && minute >= 30) || (hour === 17 && minute < 30))
      timeIndex = 8;
    else if ((hour === 17 && minute >= 30) || (hour === 18 && minute < 30))
      timeIndex = 8;
    else if ((hour === 18 && minute >= 30) || (hour === 19 && minute < 30))
      timeIndex = 9;
    else if ((hour === 19 && minute >= 30) || (hour === 20 && minute < 30))
      timeIndex = 9;
    else if ((hour === 20 && minute >= 30) || (hour === 21 && minute < 30))
      timeIndex = 10;
    else if ((hour === 21 && minute >= 30) || (hour === 22 && minute < 30))
      timeIndex = 10;
    else if ((hour === 22 && minute >= 30) || (hour === 23 && minute < 30))
      timeIndex = 11;
    else if (hour === 23 && minute >= 30) timeIndex = 0;

    const timeInfo = timeMap[timeIndex];
    return timeInfo ? `${timeInfo.emoji} ${timeInfo.name}` : null;
  };

  useEffect(() => {
    // Supabase 인증 상태 감시
    const {
      data: { subscription },
    } = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser({
          name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "Unknown",
          email: authUser.email,
          photoURL: authUser.user_metadata?.avatar_url || "",
          joinDate: authUser.created_at,
        });

        // 사용자별 저장된 결과 불러오기
        const userResults = JSON.parse(
          localStorage.getItem(`sajuResults_${authUser.id}`) || "[]"
        );
        setSavedResults(userResults);

        // 데이터베이스에서 분석 결과 불러오기
        fetchAnalysisHistory();

        // 상담 결과 불러오기
        fetchConsultationHistory();

        setLoading(false);
      } else {
        // 로그인하지 않은 경우 로그인 페이지로 리디렉트
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch("/api/analysis/history");
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
      }
    } catch (error) {
      console.error("Failed to fetch analysis history:", error);
    }
  };

  const fetchConsultationHistory = async () => {
    try {
      const response = await fetch("/api/consultation/history");
      if (response.ok) {
        const data = await response.json();
        setConsultationResults(data);
      }
    } catch (error) {
      console.error("Failed to fetch consultation history:", error);
    }
  };

  const deleteResult = (index) => {
    if (confirm("이 결과를 삭제하시겠습니까?")) {
      const updatedResults = savedResults.filter((_, i) => i !== index);
      setSavedResults(updatedResults);

      // Supabase 사용자 ID로 저장
      getCurrentUser().then((currentUser) => {
        if (currentUser) {
          localStorage.setItem(
            `sajuResults_${currentUser.id}`,
            JSON.stringify(updatedResults)
          );
        }
      });
    }
  };

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      try {
        await signOut();
        router.push("/");
      } catch (error) {
        console.error("로그아웃 실패:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    // 2단계 확인
    const firstConfirm = confirm(
      "⚠️ 경고: 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.\n\n삭제될 데이터:\n- 프로필 정보\n- 분석 결과 히스토리\n- 모든 저장된 데이터\n\n정말로 계정을 삭제하시겠습니까?"
    );

    if (!firstConfirm) return;

    const secondConfirm = confirm(
      "마지막 확인입니다.\n\n계정 삭제는 되돌릴 수 없습니다.\n정말로 진행하시겠습니까?"
    );

    if (!secondConfirm) return;

    try {
      // 로딩 표시
      const originalText = document.querySelector(".btn-danger").textContent;
      document.querySelector(".btn-danger").textContent = "삭제 중...";
      document.querySelector(".btn-danger").disabled = true;

      await deleteAccount();

      // 성공 메시지 표시
      alert("계정이 성공적으로 삭제되었습니다. 이용해 주셔서 감사합니다.");

      // 홈페이지로 리디렉트
      router.push("/");
    } catch (error) {
      console.error("계정 삭제 실패:", error);

      // 버튼 상태 복원
      document.querySelector(".btn-danger").textContent = originalText;
      document.querySelector(".btn-danger").disabled = false;

      if (error.message.includes("최근에 로그인")) {
        alert(error.message);
        // 재로그인을 위해 로그아웃
        try {
          await signOutUser();
          router.push("/");
        } catch (logoutError) {
          console.error("로그아웃 실패:", logoutError);
        }
      } else {
        alert(`계정 삭제 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="analyze-page">
        <div className="container">
          <div className="analyze-header">
            <h1>👤 마이페이지</h1>
            <p style={{ textAlign: "center", marginTop: "50px" }}>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="analyze-page">
        <div className="container">
          <div className="mypage-welcome">
            <div className="card welcome-card">
              <div className="card-header">
                <h2 className="card-title sage-title">
                  <span className="sage-subtitle">
                    토리의 찻집에 오신 것을 환영합니다
                  </span>
                </h2>
                <p className="sage-description">
                  로그인하시면 당신만의 팔자 분석 결과를 저장하고 관리할 수
                  있습니다.
                </p>
              </div>

              <div className="welcome-content">
                <div className="welcome-features">
                  <div className="feature-item">
                    <div className="feature-icon">📊</div>
                    <h3>분석 결과 저장</h3>
                    <p>당신의 팔자 분석과 시너지 결과를 안전하게 저장하세요</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">📈</div>
                    <h3>히스토리 관리</h3>
                    <p>시간에 따른 분석 결과 변화를 추적하고 비교해보세요</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🔐</div>
                    <h3>개인 맞춤 서비스</h3>
                    <p>개인화된 추천과 맞춤형 조언을 받아보세요</p>
                  </div>
                </div>

                <div className="welcome-actions">
                  <button
                    className="cta-button ink-brush-effect"
                    onClick={() => router.push("/")}
                  >
                    로그인하러 가기
                  </button>
                  <p className="welcome-note">
                    Google 또는 Kakao 계정으로 간편하게 로그인하세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="analyze-page" style={{ paddingTop: "120px" }}>
        <div className="container">
          {/* 사용자 정보 카드 */}
          <div
            className="card user-info-card"
            style={{
              marginBottom: "30px",
              background: "var(--card-bg-color)",
              padding: "25px",
              borderRadius: "12px",
            }}
          >
            <div
              className="user-profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              {user.photoURL ? (
                <div
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "80px",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={user.photoURL}
                    alt="프로필 사진"
                    width={100}
                    height={100}
                    className="profile-photo"
                    style={{
                      borderRadius: "50%",
                      border: "3px solid var(--accent-color)",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "3px solid var(--accent-color)",
                    background:
                      "linear-gradient(135deg, var(--starlight-orange) 0%, var(--accent-color) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    color: "white",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
                </div>
              )}
              <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{ color: "var(--accent-color)", marginBottom: "4px" }}
                >
                  {user.name}
                </h3>
                <p
                  style={{
                    color: "var(--text-muted-color)",
                    marginBottom: "5px",
                    wordBreak: "break-word",
                  }}
                >
                  {user.email}
                </p>
                <p
                  style={{ color: "var(--text-muted-color)", fontSize: "14px" }}
                >
                  가입일: {new Date(user.joinDate).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </div>

          {/* 메인 그리드 */}
          <div
            className="mypage-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "30px",
              marginBottom: "40px",
            }}
          >
            {/* 토리와 상담 카드 */}
            <div
              className="card consultation-card"
              style={{
                background: "var(--card-bg-color)",
                padding: "25px",
                borderRadius: "12px",
              }}
            >
              <div className="card-header" style={{ marginBottom: "20px" }}>
                <h3
                  className="card-title sage-title"
                  style={{
                    color: "var(--starlight-orange)",
                    marginBottom: "8px",
                  }}
                >
                  🔮 인생 스포일러
                </h3>
              </div>
              <div id="consultation-history">
                {consultationResults.length === 0 ? (
                  <p
                    className="no-data"
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted-color)",
                      padding: "20px",
                    }}
                  >
                    아직 상담 기록이 없습니다.{" "}
                    <a
                      href="/consultation"
                      style={{ color: "var(--accent-color)" }}
                    >
                      지금 상담해보세요!
                    </a>
                  </p>
                ) : (
                  <>
                    <div
                      style={{
                        maxHeight: "350px",
                        overflowY: "auto",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {consultationResults
                        .slice(consultationPage * 5, (consultationPage + 1) * 5)
                        .map((result) => (
                          <div
                            key={result.id}
                            style={{
                              padding: "15px",
                              borderBottom: "1px solid var(--border-color)",
                              border: "1px solid transparent",
                              borderRadius: "6px",
                              margin: "8px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              backgroundColor: "var(--card-bg-color)",
                            }}
                            onMouseEnter={(e) => {
                              const card = e.currentTarget;
                              card.style.border =
                                "1px solid var(--accent-color)";
                              card.style.backgroundColor =
                                "rgba(212, 175, 55, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                              const card = e.currentTarget;
                              card.style.border = "1px solid transparent";
                              card.style.backgroundColor =
                                "var(--card-bg-color)";
                            }}
                            onClick={() => {
                              router.push(`/consultation/result/${result.id}`);
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "8px",
                              }}
                            >
                              <h4
                                style={{
                                  color: "var(--accent-color)",
                                  fontSize: "14px",
                                  marginBottom: "0",
                                }}
                              >
                                {result.name || "이름 없음"}
                              </h4>
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: result.isPaid ? "#fff" : "#000",
                                  background: result.isPaid
                                    ? "#28a745"
                                    : "#ffc107",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "bold",
                                }}
                              >
                                {result.isPaid ? "결제 완료!" : "무료"}
                              </span>
                            </div>
                            {result.birthDate && (
                              <p
                                style={{
                                  color: "var(--text-color)",
                                  fontSize: "13px",
                                  marginBottom: "5px",
                                }}
                              >
                                생년월일:{" "}
                                {new Date(result.birthDate).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            )}
                            {getBirthTimeDisplay(result.birthTime) && (
                              <p
                                style={{
                                  color: "var(--text-color)",
                                  fontSize: "13px",
                                  marginBottom: "5px",
                                }}
                              >
                                생시: {getBirthTimeDisplay(result.birthTime)}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                            >
                              <p
                                style={{
                                  color: "var(--text-muted-color)",
                                  fontSize: "12px",
                                  marginBottom: "0",
                                }}
                              >
                                상담일:{" "}
                                {new Date(result.createdAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* 페이지네이션 */}
                    {consultationResults.length > 5 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "15px",
                          paddingTop: "15px",
                          borderTop: "1px solid var(--border-color)",
                        }}
                      >
                        <button
                          onClick={() =>
                            setConsultationPage(
                              Math.max(0, consultationPage - 1)
                            )
                          }
                          disabled={consultationPage === 0}
                          style={{
                            padding: "5px 10px",
                            background:
                              consultationPage === 0
                                ? "var(--border-color)"
                                : "var(--accent-color)",
                            color:
                              consultationPage === 0
                                ? "var(--text-muted-color)"
                                : "var(--ink-black)",
                            border: "none",
                            borderRadius: "4px",
                            cursor:
                              consultationPage === 0
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "12px",
                          }}
                        >
                          이전
                        </button>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted-color)",
                          }}
                        >
                          {consultationPage + 1} /{" "}
                          {Math.ceil(consultationResults.length / 5)}
                        </span>
                        <button
                          onClick={() =>
                            setConsultationPage(
                              Math.min(
                                Math.ceil(consultationResults.length / 5) - 1,
                                consultationPage + 1
                              )
                            )
                          }
                          disabled={
                            consultationPage >=
                            Math.ceil(consultationResults.length / 5) - 1
                          }
                          style={{
                            padding: "5px 10px",
                            background:
                              consultationPage >=
                              Math.ceil(consultationResults.length / 5) - 1
                                ? "var(--border-color)"
                                : "var(--accent-color)",
                            color:
                              consultationPage >=
                              Math.ceil(consultationResults.length / 5) - 1
                                ? "var(--text-muted-color)"
                                : "var(--ink-black)",
                            border: "none",
                            borderRadius: "4px",
                            cursor:
                              consultationPage >=
                              Math.ceil(consultationResults.length / 5) - 1
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "12px",
                          }}
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 토리와의 대화록 카드 */}
            <div
              className="card analysis-card"
              style={{
                background: "var(--card-bg-color)",
                padding: "25px",
                borderRadius: "12px",
              }}
            >
              <div className="card-header" style={{ marginBottom: "20px" }}>
                <h3
                  className="card-title sage-title"
                  style={{
                    color: "var(--starlight-orange)",
                    marginBottom: "8px",
                  }}
                >
                  📜 토리와의 대화록
                </h3>
              </div>
              <div id="analysis-history">
                {analysisResults.length === 0 ? (
                  <p
                    className="no-data"
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted-color)",
                      padding: "20px",
                    }}
                  >
                    아직 분석 결과가 없습니다.{" "}
                    <a href="/analyze" style={{ color: "var(--accent-color)" }}>
                      지금 분석해보세요!
                    </a>
                  </p>
                ) : (
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {analysisResults.slice(0, 3).map((result) => (
                      <div
                        key={result.id}
                        style={{
                          padding: "15px",
                          borderBottom: "1px solid var(--border-color)",
                          border: "1px solid transparent",
                          borderRadius: "6px",
                          margin: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          backgroundColor: "var(--card-bg-color)",
                        }}
                        onMouseEnter={(e) => {
                          const card = e.currentTarget;
                          card.style.border = "1px solid var(--accent-color)";
                          card.style.backgroundColor =
                            "rgba(212, 175, 55, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          const card = e.currentTarget;
                          card.style.border = "1px solid transparent";
                          card.style.backgroundColor = "var(--card-bg-color)";
                        }}
                        onClick={() => {
                          router.push(`/analyze?type=${result.personalityType}`);
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: "8px" }}>
                              <h4
                                style={{
                                  color: "var(--accent-color)",
                                  fontSize: "14px",
                                  marginBottom: "0",
                                }}
                              >
                                {result.personalityType || "Unknown"}
                              </h4>
                            </div>
                            <p
                              style={{
                                color: "var(--text-color)",
                                fontSize: "13px",
                                marginBottom: "5px",
                              }}
                            >
                              이름: {result.name || "이름 없음"}
                            </p>
                            {result.birthDate && (
                              <p
                                style={{
                                  color: "var(--text-color)",
                                  fontSize: "13px",
                                  marginBottom: "5px",
                                }}
                              >
                                생년월일:{" "}
                                {new Date(result.birthDate).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                            >
                              <p
                                style={{
                                  color: "var(--text-muted-color)",
                                  fontSize: "12px",
                                  marginBottom: "0",
                                }}
                              >
                                검사일:{" "}
                                {new Date(result.createdAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            </div>
                          </div>
                          {result.personalityType && (
                            <div
                              style={{
                                width: "70px",
                                height: "70px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "2px solid var(--accent-color)",
                                flexShrink: 0,
                                marginLeft: "15px",
                              }}
                            >
                              <Image
                                src={`/assets/images/${result.personalityType}.png`}
                                alt={result.personalityType}
                                width={70}
                                height={70}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 찻집 관리 카드 */}
            <div
              className="card account-card"
              style={{
                background: "var(--card-bg-color)",
                padding: "25px",
                borderRadius: "12px",
              }}
            >
              <div className="card-header" style={{ marginBottom: "20px" }}>
                <h3
                  className="card-title sage-title"
                  style={{
                    color: "var(--starlight-orange)",
                    marginBottom: "8px",
                  }}
                >
                  ⚙️ 찻집 관리
                </h3>
                <p
                  className="card-description"
                  style={{ color: "var(--text-muted-color)", fontSize: "14px" }}
                >
                  계정 설정과 데이터 관리
                </p>
              </div>
              <div
                className="account-actions"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <button
                  className="secondary-btn"
                  style={{ width: "100%" }}
                  onClick={handleLogout}
                >
                  🚪 로그아웃
                </button>
                <button
                  className="btn btn-danger"
                  style={{
                    width: "100%",
                    background: "#dc3545",
                    color: "white",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={handleDeleteAccount}
                  onMouseOver={(e) => (e.target.style.background = "#c82333")}
                  onMouseOut={(e) => (e.target.style.background = "#dc3545")}
                >
                  🗑️ 계정 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
