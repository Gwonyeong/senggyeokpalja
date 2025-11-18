"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import PageWrapper from "@/components/PageWrapper";
import TossPaymentWidget from "@/components/TossPaymentWidget";
// import ChuseokEventModal from "@/components/ChuseokEventModal";

import Section1BasicInfo from "./components/Section1BasicInfo";
import Section2TenGods from "./components/Section2TenGods";
import Section3FiveElements from "./components/Section3FiveElements";
import Section4Personality from "./components/Section4Personality";
import Section5Fortune from "./components/Section5Fortune";
import Section6Advice from "./components/Section6Advice";
import Section7Conclusion from "./components/Section7Conclusion";

import Image from "next/image";

export default function ConsultationResultPage({ params }) {
  // Next.js 15에서 params는 Promise이므로 use()로 unwrap
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [soldCount, setSoldCount] = useState(0);
  // const [showEventModal, setShowEventModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const paymentWidgetRef = useRef(null);

  // 어드민 사용자 목록
  const ADMIN_USERS = [
    "jaehxxn7@naver.com",
    "tnalsqkr1234@gmail.com",
    "regend0726@gmail.com",
    "rnjsdud980@gmail.com",
  ];

  // URL 파라미터에서 섹션 번호 가져오기
  useEffect(() => {
    const section = searchParams.get("section");
    if (section && section >= 1 && section <= 7) {
      setCurrentSection(parseInt(section));
    }
  }, [searchParams]);

  // 모바일 화면 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // 인증 및 데이터 로드
  useEffect(() => {
    const loadConsultationData = async () => {
      try {
        // 사용자 인증 확인
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          alert("로그인이 필요합니다.");
          router.push("/");
          return;
        }
        setUser(user);

        // 상담 결과 데이터 가져오기
        const consultationId = resolvedParams.id;
        const response = await fetch(`/api/consultation/${consultationId}`);
        const result = await response.json();

        if (response.ok) {
          setConsultation(result.consultation);

          // 판매된 상세리포트 수 가져오기
          try {
            const statsResponse = await fetch("/api/consultation/stats");
            if (statsResponse.ok) {
              const statsResult = await statsResponse.json();
              setSoldCount(statsResult.paidCount || 0);
            }
          } catch (error) {
            console.log("Stats loading failed, using default value");
            setSoldCount(0);
          }
        } else {
          if (response.status === 401) {
            alert("로그인이 필요합니다.");
            router.push("/");
          } else if (response.status === 404) {
            alert("상담 결과를 찾을 수 없습니다.");
            router.push("/consultation");
          } else {
            alert(result.error || "데이터를 불러오는 중 오류가 발생했습니다.");
          }
        }
      } catch (error) {
        console.error("Data loading error:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadConsultationData();
  }, [resolvedParams, router, supabase]);

  // 어드민 사용자 체크
  const isAdminUser = (userEmail) => {
    return ADMIN_USERS.includes(userEmail);
  };

  // 어드민 결제 처리 함수
  const handleAdminPayment = async () => {
    try {
      const response = await fetch(
        `/api/consultation/${consultation.id}/admin-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("어드민 결제 처리가 완료되었습니다.");
        setShowAdminModal(false);
        // 페이지 새로고침하여 결제 상태 업데이트
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`결제 처리 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error("어드민 결제 처리 중 오류:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    }
  };

  // 결제 버튼 클릭 핸들러
  const handlePaymentButtonClick = () => {
    if (user && isAdminUser(user.email)) {
      // 어드민 사용자인 경우 모달 표시
      setShowAdminModal(true);
    } else {
      // 일반 사용자인 경우 기존 플로우
      if (paymentWidgetRef.current) {
        paymentWidgetRef.current.openPayment();
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // 섹션 제목 매핑
  const getSectionTitle = (section) => {
    const titles = {
      1: "사주팔자 기본 정보",
      2: "십신 분석",
      3: "오행 균형",
      4: "성격 분석",
      5: "운세 해석",
      6: "조언 및 가이드",
      7: "종합 결론",
    };
    return titles[section] || "알 수 없는 섹션";
  };

  // 스크롤을 최상단으로 이동하는 함수
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 섹션 변경 함수
  const changeSection = (newSection) => {
    // 섹션 1이 아닌데 결제가 안됐다면 접근 불가
    if (newSection > 1 && !consultation?.isPaid) {
      alert("전체 상담 내용을 보려면 결제가 필요합니다.");
      return;
    }

    if (newSection >= 1 && newSection <= 7) {
      setCurrentSection(newSection);
      const newUrl = `/consultation/result/${resolvedParams.id}?section=${newSection}`;
      router.push(newUrl, { scroll: false });

      // 스크롤을 최상단으로 이동
      scrollToTop();
    }
  };

  // 버튼 클릭 핸들러 (disabled 상태에서도 스크롤 수행)
  const handlePreviousClick = () => {
    if (currentSection === 1) {
      // 첫 번째 섹션에서는 섹션 변경 없이 스크롤만
      scrollToTop();
    } else {
      changeSection(currentSection - 1);
    }
  };

  const handleNextClick = () => {
    if (currentSection === 7) {
      // 마지막 섹션에서는 섹션 변경 없이 스크롤만
      scrollToTop();
    } else if (currentSection === 1 && !consultation.isPaid) {
      // 결제가 안된 상태에서는 스크롤만
      scrollToTop();
    } else {
      changeSection(currentSection + 1);
    }
  };

  // 현재 섹션에 따른 컴포넌트 렌더링
  const renderSectionContent = () => {
    const sectionComponents = {
      1: <Section1BasicInfo consultation={consultation} />,
      2: <Section2TenGods consultation={consultation} />,
      3: <Section3FiveElements consultation={consultation} />,
      4: <Section4Personality consultation={consultation} />,
      5: <Section5Fortune consultation={consultation} />,
      6: <Section6Advice consultation={consultation} />,
      7: <Section7Conclusion consultation={consultation} />,
    };

    return sectionComponents[currentSection] || null;
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="analyze-page">
        <main>
          <section id="analyzer">
            <div className="container">
              <div className="analyzer-layout">
                <div className="card analyzer-card">
                  <div className="card-header">
                    <h2 className="card-title sage-title">
                      <span className="sage-subtitle">로딩 중...</span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!consultation) {
    return (
      <div className="analyze-page">
        <main>
          <section id="analyzer">
            <div className="container">
              <div className="analyzer-layout">
                <div className="card analyzer-card">
                  <div className="card-header">
                    <h2 className="card-title sage-title">
                      <span className="sage-subtitle">
                        데이터를 찾을 수 없습니다
                      </span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div
        className="analyze-page"
        style={{
          paddingBottom:
            currentSection === 1 && !consultation.isPaid ? "0" : "0",
        }}
      >
        <main>
          <section id="analyzer">
            <div className="container">
              <div className="analyzer-layout">
                {/* 섹션 내용 렌더링 */}
                {renderSectionContent()}

                {/* 섹션 1에서 결제가 안됐을 때만 웹툰 퍼널과 결제 버튼 표시 */}
                {currentSection === 1 && !consultation.isPaid && (
                  <>
                    {/* 웹툰 퍼널 */}

                    {/* 결제 박스 */}
                  </>
                )}

                {/* 어드민 결제 선택 모달 */}
                {showAdminModal && (
                  <div
                    style={{
                      position: "fixed",
                      top: "0",
                      left: "0",
                      right: "0",
                      bottom: "0",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: "10000",
                      padding: "20px",
                    }}
                    onClick={() => setShowAdminModal(false)}
                  >
                    <div
                      style={{
                        backgroundColor: "#1a1a1a",
                        borderRadius: "12px",
                        padding: "30px",
                        maxWidth: "400px",
                        width: "100%",
                        border: "2px solid #FCA311",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3
                        style={{
                          color: "#FCA311",
                          fontSize: "20px",
                          fontFamily: "'Noto Serif KR', serif",
                          marginBottom: "20px",
                          textAlign: "center",
                          letterSpacing: "1px",
                        }}
                      >
                        어드민 계정입니다
                      </h3>

                      <p
                        style={{
                          color: "#ccc",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          marginBottom: "25px",
                          textAlign: "center",
                        }}
                      >
                        결제 방식을 선택해주세요.
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {/* 결제 진행 (일반 플로우) 버튼 */}
                        <button
                          onClick={() => {
                            setShowAdminModal(false);
                            // 일반 결제 플로우 실행
                            if (paymentWidgetRef.current) {
                              paymentWidgetRef.current.openPayment();
                            } else {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          style={{
                            padding: "14px 20px",
                            backgroundColor: "#4a5568",
                            color: "#fff",
                            border: "1px solid #666",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontFamily: "'Noto Serif KR', serif",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#5a6478";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#4a5568";
                          }}
                        >
                          1. 결제 진행 (일반 플로우)
                        </button>

                        {/* 임의로 결제 처리 (어드민만 가능) 버튼 */}
                        <button
                          onClick={handleAdminPayment}
                          style={{
                            padding: "14px 20px",
                            backgroundColor: "#FCA311",
                            color: "#000",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontFamily: "'Noto Serif KR', serif",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#e8940f";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#FCA311";
                          }}
                        >
                          2. 임의로 결제 처리 (어드민만 가능)
                        </button>

                        {/* 취소 버튼 */}
                        <button
                          onClick={() => setShowAdminModal(false)}
                          style={{
                            padding: "12px 20px",
                            backgroundColor: "transparent",
                            color: "#999",
                            border: "1px solid #444",
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            marginTop: "8px",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color = "#ccc";
                            e.target.style.borderColor = "#666";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = "#999";
                            e.target.style.borderColor = "#444";
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 추석 이벤트 모달 */}
                {/* <ChuseokEventModal
                  isOpen={showEventModal}
                  onClose={() => setShowEventModal(false)}
                  consultationId={consultation.id}
                /> */}

                {/* 토스 페이먼츠 결제 위젯 */}
                {currentSection === 1 && !consultation.isPaid && (
                  <TossPaymentWidget
                    ref={paymentWidgetRef}
                    consultationId={consultation.id}
                    amount={9900}
                    orderName="성격팔자 상세리포트"
                    onPaymentSuccess={() => {
                      // 결제 성공 시 데이터 다시 로드
                      window.location.reload();
                    }}
                  />
                )}

                {/* 네비게이션 버튼 - 구매하지 않은 섹션 1에서는 숨김 */}
                {!(currentSection === 1 && !consultation.isPaid) && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "30px",
                      padding: "20px 0",
                      gap: "10px",
                      flexWrap: "wrap",
                      maxWidth: "100%",
                    }}
                  >
                    <button
                      onClick={handlePreviousClick}
                      style={{
                        padding: "12px 24px",
                        backgroundColor:
                          currentSection === 1 ? "#666" : "#d4af37",
                        color: currentSection === 1 ? "#999" : "#000",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        flex: "1",
                        minWidth: "0",
                        maxWidth: "calc(50% - 5px)",
                        boxSizing: "border-box",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {currentSection === 1 ? "맨 위로" : "이전 섹션"}
                    </button>

                    <button
                      onClick={handleNextClick}
                      style={{
                        padding: "12px 24px",
                        backgroundColor:
                          currentSection === 7 ||
                          (currentSection === 1 && !consultation.isPaid)
                            ? "#666"
                            : "#d4af37",
                        color:
                          currentSection === 7 ||
                          (currentSection === 1 && !consultation.isPaid)
                            ? "#999"
                            : "#000",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        flex: "1",
                        minWidth: "0",
                        maxWidth: "calc(50% - 5px)",
                        boxSizing: "border-box",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {currentSection === 1 && !consultation.isPaid
                        ? "맨 위로"
                        : currentSection === 7
                        ? "맨 위로"
                        : "다음 섹션"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* 고정 하단 버튼 및 정보 - 결제하지 않은 섹션 1에서만 표시 */}
        {currentSection === 1 && !consultation.isPaid && (
          <div
            style={{
              position: "fixed",
              bottom: "0",
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: "600px",
              width: "100%",
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              borderTop: "2px solid #FCA311",

              padding: "10px",
              zIndex: "1000",
              boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                alignItems: "center",
              }}
            >
              {/* 남은 수량 및 가격 정보 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* 가격 정보 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      textDecoration: "line-through",
                      fontFamily: "'Noto Serif KR', serif",
                    }}
                  >
                    29,000
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    →
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#FCA311",
                      fontFamily: "'Noto Serif KR', serif",
                    }}
                  >
                    9,900원
                  </span>
                </div>
              </div>

              {/* 토리와 상담받기 버튼 */}

              <button
                onClick={handlePaymentButtonClick}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "12px 18px",
                  backgroundColor: "#FCA311",
                  color: "#000",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  fontFamily: "'Noto Serif KR', serif",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 16px rgba(252, 163, 17, 0.4)",
                  letterSpacing: "1px",
                }}
              >
                지금 정통사주 받아보기
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
