"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import PageWrapper from "@/components/PageWrapper";
// import TossPaymentWidget from "@/components/TossPaymentWidget";
import ChuseokEventModal from "@/components/ChuseokEventModal";

import Section1BasicInfo from "./components/Section1BasicInfo";
import Section2TenGods from "./components/Section2TenGods";
import Section3FiveElements from "./components/Section3FiveElements";
import Section4Personality from "./components/Section4Personality";
import Section5Fortune from "./components/Section5Fortune";
import Section6Advice from "./components/Section6Advice";
import Section7Conclusion from "./components/Section7Conclusion";

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
  const [showEventModal, setShowEventModal] = useState(false);

  // URL 파라미터에서 섹션 번호 가져오기
  useEffect(() => {
    const section = searchParams.get("section");
    if (section && section >= 1 && section <= 7) {
      setCurrentSection(parseInt(section));
    }
  }, [searchParams]);

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
      7: <Section7Conclusion consultation={consultation} />
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
      <div className="analyze-page">
        <main>
          <section id="analyzer">
            <div className="container">
              <div className="analyzer-layout">
                {/* 섹션 내용 렌더링 */}
                {renderSectionContent()}

                {/* 섹션 1에서 결제가 안됐을 때만 결제 버튼 표시 */}
                {currentSection === 1 && !consultation.isPaid && (
                  <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3 style={{ marginBottom: "15px", color: "#d4af37" }}>결제 정보</h3>
                    <p style={{ marginBottom: "15px", color: "#ccc" }}>
                      전체 상담 내용을 확인하려면 결제가 필요합니다.
                    </p>
                    <p style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "bold", color: "#d4af37" }}>
                      결제 금액: 10,000원
                    </p>
                    <button
                      onClick={() => setShowEventModal(true)}
                      style={{
                        width: "100%",
                        padding: "15px",
                        backgroundColor: "#d4af37",
                        color: "#000",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    >
                      결제하기
                    </button>
                  </div>
                )}

                {/* 추석 이벤트 모달 */}
                <ChuseokEventModal
                  isOpen={showEventModal}
                  onClose={() => setShowEventModal(false)}
                  consultationId={consultation.id}
                />

                {/* 기존 토스 페이먼츠 위젯 (임시 주석 처리) */}
                {/* {currentSection === 1 && !consultation.isPaid && (
                  <TossPaymentWidget
                    consultationId={consultation.id}
                    amount={10000}
                    orderName="플라자 상담 서비스"
                    onPaymentSuccess={() => {
                      // 결제 성공 시 데이터 다시 로드
                      window.location.reload();
                    }}
                  />
                )} */}

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
                    onClick={() => changeSection(currentSection - 1)}
                    disabled={currentSection === 1}
                    style={{
                      padding: "12px 24px",
                      backgroundColor:
                        currentSection === 1 ? "#333" : "#d4af37",
                      color: currentSection === 1 ? "#666" : "#000",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: currentSection === 1 ? "not-allowed" : "pointer",
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
                    이전 섹션
                  </button>

                  <button
                    onClick={() => changeSection(currentSection + 1)}
                    disabled={
                      currentSection === 7 ||
                      (currentSection === 1 && !consultation.isPaid)
                    }
                    style={{
                      padding: "12px 24px",
                      backgroundColor:
                        currentSection === 7 ||
                        (currentSection === 1 && !consultation.isPaid)
                          ? "#333"
                          : "#d4af37",
                      color:
                        currentSection === 7 ||
                        (currentSection === 1 && !consultation.isPaid)
                          ? "#666"
                          : "#000",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor:
                        currentSection === 7 ||
                        (currentSection === 1 && !consultation.isPaid)
                          ? "not-allowed"
                          : "pointer",
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
                      ? "결제 후 이용 가능"
                      : "다음 섹션"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PageWrapper>
  );
}
