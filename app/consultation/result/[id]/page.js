"use client";

import { useState, useEffect, use } from "react";
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
            currentSection === 1 && !consultation.isPaid ? "200px" : "0",
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
                    <div
                      style={{
                        padding: "30px",
                        background: "rgba(212, 175, 55, 0.05)",
                        border: "2px solid #FCA311",
                        borderRadius: "20px",
                        marginBottom: "30px",
                        boxShadow: "0 8px 24px rgba(252, 163, 17, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                        marginTop: "100px",
                      }}
                    >
                      {/* 오행 장식 효과 */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-5px",
                          left: "-5px",
                          right: "-5px",
                          bottom: "-5px",
                          // background: "linear-gradient(45deg, #22c55e, #ef4444, #3b82f6, #e5e7eb, #eab308)",
                          opacity: "0.1",
                          borderRadius: "20px",
                          zIndex: "0",
                        }}
                      ></div>

                      <div style={{ position: "relative", zIndex: "1" }}>
                        <h3
                          style={{
                            marginBottom: "20px",
                            color: "#FCA311",
                            fontSize: "24px",
                            fontFamily: "'Noto Serif KR', serif",
                            textAlign: "center",
                            letterSpacing: "2px",
                          }}
                        >
                          토리와 상담
                        </h3>

                        <p
                          style={{
                            marginBottom: "15px",
                            color: "#fff",
                            fontSize: "16px",
                            lineHeight: "1.8",
                            textAlign: "center",
                            fontFamily: "'Noto Serif KR', serif",
                          }}
                        >
                          &ldquo;그대의 운명이 담긴 두루마리,
                          <br />
                          다음 장을 펼치려면 약간의{" "}
                          <span
                            style={{ color: "#FCA311", fontWeight: "bold" }}
                          >
                            복채
                          </span>
                          가 필요하다네.&rdquo;
                        </p>

                        <p
                          style={{
                            marginBottom: "15px",
                            fontSize: "14px",
                            color: "#999",
                            textAlign: "center",
                          }}
                        >
                          운명의 오행이 그대를 기다리고 있다네
                        </p>

                        {/* 성격팔자 이미지 */}
                        <div
                          style={{
                            maxWidth: "300px",
                            margin: "0 auto 25px auto",
                            borderRadius: "10px",
                            overflow: "hidden",
                            boxShadow: "0 6px 16px rgba(252, 163, 17, 0.3)",
                            border: "2px solid rgba(212, 175, 55, 0.4)",
                          }}
                        >
                          <Image
                            src="/assets/images/성격팔자.png"
                            alt="인생 스포일러 목차"
                            width={300}
                            height={450}
                            style={{
                              width: "100%",
                              height: "auto",
                              display: "block",
                            }}
                            priority
                          />
                        </div>
                        {/* 리포트 구매 안내 문구 */}
                        <p
                          style={{
                            marginTop: "15px",
                            fontSize: "14px",
                            color: "#999",
                            textAlign: "center",
                            fontFamily: "'Noto Serif KR', serif",
                          }}
                        >
                          리포트를 구매하면 모든 내용을 확인할 수 있습니다.
                        </p>
                      </div>
                    </div>

                    {/* for_purchase 이미지들 표시 */}
                    <div
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0",
                        alignItems: "center",
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <div
                          key={num}
                          style={{
                            width: "100%",
                            maxWidth: "400px",
                            margin: "0",
                          }}
                        >
                          <Image
                            src={`/assets/images/consultation/for_purchase/${num}.png`}
                            alt={`구매 안내 이미지 ${num}`}
                            width={400}
                            height={600}
                            style={{
                              width: "100%",
                              height: "auto",
                              display: "block",
                            }}
                            priority={num <= 2}
                          />
                        </div>
                      ))}
                    </div>
                  </>
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
                    consultationId={consultation.id}
                    amount={9900}
                    orderName="성격팔자 상세리포트"
                    onPaymentSuccess={() => {
                      // 결제 성공 시 데이터 다시 로드
                      window.location.reload();
                    }}
                  />
                )}

                {/* 네비게이션 버튼 */}
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
              left: "0",
              right: "0",
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              borderTop: "2px solid #FCA311",
              padding: "10px",
              zIndex: "1000",
              boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div
              style={{
                maxWidth: "600px",
                margin: "0 auto",
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
                {/* 남은 수량 */}
                <p
                  style={{
                    fontSize: "14px",
                    color: "#FF6B35",
                    fontFamily: "'Noto Serif KR', serif",
                    margin: "0",
                    fontWeight: "500",
                  }}
                >
                  남은 수량: {Math.max(0, 100 - soldCount)}개
                </p>

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
                    정가 29,000원
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
                    특가 9,900원
                  </span>
                </div>
              </div>

              {/* 토리와 상담받기 버튼 */}

              <button
                onClick={(e) => {
                  // TossPaymentWidget의 버튼을 찾아서 클릭
                  const paymentButtons = document.querySelectorAll("button");
                  const paymentButton = Array.from(paymentButtons).find(
                    (btn) =>
                      btn.textContent === "토리와 상담받기" &&
                      btn !== e.currentTarget
                  );
                  if (paymentButton) {
                    paymentButton.click();
                  } else {
                    // 버튼을 찾지 못한 경우 페이지 상단의 결제 섹션으로 스크롤
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "16px 24px",
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
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#e8940f";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#FCA311";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                토리와 상담받기
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
