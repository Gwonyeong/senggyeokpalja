"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import WebtoonPanel from "../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../lib/consultation-content-generator";
import PageWrapper from "@/components/PageWrapper";

export default function ConsultationResultPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(1);

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
        const consultationId = (await params).id;
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
  }, [params, router, supabase]);

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
    if (newSection >= 1 && newSection <= 7) {
      setCurrentSection(newSection);
      const newUrl = `/consultation/result/${params.id}?section=${newSection}`;
      router.push(newUrl, { scroll: false });
    }
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
              {/* 헤더 */}

              {/* 섹션 내용 */}
              <div className="card result-card">
                <div className="card-header">
                  <h3 className="card-title">섹션 {currentSection} 내용</h3>
                </div>

                {/* 웹툰 패널 */}
                <div style={{ marginBottom: "20px" }}>
                  <WebtoonPanel
                    sectionNumber={currentSection}
                    {...generateSectionContent(consultation, currentSection)}
                    panelStyle={{
                      minHeight: "600px",

                      background: "transparent",
                      border: "none",
                      borderRadius: "0",
                    }}
                  />
                </div>

                {/* 네비게이션 버튼 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "30px",
                    padding: "20px 0",
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
                    }}
                  >
                    이전 섹션
                  </button>

                  <button
                    onClick={() => changeSection(currentSection + 1)}
                    disabled={currentSection === 7}
                    style={{
                      padding: "12px 24px",
                      backgroundColor:
                        currentSection === 7 ? "#333" : "#d4af37",
                      color: currentSection === 7 ? "#666" : "#000",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: currentSection === 7 ? "not-allowed" : "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    다음 섹션
                  </button>
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
