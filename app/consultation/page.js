"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateSaju } from "../../lib/saju-utils";
import { createClient } from "../../lib/supabase";
import PageWrapper from "@/components/PageWrapper";

export default function ConsultationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "unknown",
    gender: "male",
    mbti: "",
    calendar: "solar",
    isLeapMonth: false,
  });

  const [loading, setLoading] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUser();

    // Auth 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 로그인 체크
    if (!user) {
      alert('상담 신청을 위해서는 로그인이 필요합니다.');
      router.push('/');
      return;
    }

    setLoading(true);

    try {
      // 날짜 객체 생성
      const birthDate = new Date(
        parseInt(formData.year),
        parseInt(formData.month) - 1,
        parseInt(formData.day)
      );

      // 시간 인덱스 변환 (unknown인 경우 오시(6) 기본값)
      let timeIndex = 6;
      if (formData.hour !== "unknown") {
        timeIndex = parseInt(formData.hour);
      }

      // 사주팔자 계산
      const sajuData = calculateSaju(birthDate, timeIndex);

      // 지지만을 이용한 십신 계산
      const calculateJijiSibsin = (palja, ilgan) => {
        const jiInfo = {
          "子": { ohaeng: "水", eumYang: "陽" },
          "丑": { ohaeng: "土", eumYang: "陰" },
          "寅": { ohaeng: "木", eumYang: "陽" },
          "卯": { ohaeng: "木", eumYang: "陰" },
          "辰": { ohaeng: "土", eumYang: "陽" },
          "巳": { ohaeng: "火", eumYang: "陽" },
          "午": { ohaeng: "火", eumYang: "陰" },
          "未": { ohaeng: "土", eumYang: "陰" },
          "申": { ohaeng: "金", eumYang: "陽" },
          "酉": { ohaeng: "金", eumYang: "陰" },
          "戌": { ohaeng: "土", eumYang: "陽" },
          "亥": { ohaeng: "水", eumYang: "陰" }
        };

        const ohaengSaeng = { '水': '木', '木': '火', '火': '土', '土': '金', '金': '水' };
        const ohaengGeuk = { '水': '火', '火': '金', '金': '木', '木': '土', '土': '水' };

        const sibsinCount = {};
        const ilganOhaeng = ilgan.ohaeng;
        const ilganEumYang = ilgan.eumYang;

        // 4개의 지지 (연지, 월지, 일지, 시지)에서 십신 계산
        const jijiList = [
          palja.yunju?.ji,
          palja.wolju?.ji,
          palja.ilju?.ji,
          palja.siju?.ji
        ].filter(ji => ji && ji.han);

        jijiList.forEach(ji => {
          const jiOhaeng = jiInfo[ji.han]?.ohaeng;
          const jiEumYang = jiInfo[ji.han]?.eumYang;

          if (!jiOhaeng) return;

          let sibsinType = null;

          // 일간과의 관계로 십신 결정
          if (jiOhaeng === ilganOhaeng) {
            // 같은 오행
            sibsinType = (jiEumYang === ilganEumYang) ? "비견" : "겁재";
          } else if (ohaengSaeng[ilganOhaeng] === jiOhaeng) {
            // 일간이 생하는 오행 (생출)
            sibsinType = (jiEumYang === ilganEumYang) ? "식신" : "상관";
          } else if (ohaengGeuk[ilganOhaeng] === jiOhaeng) {
            // 일간이 극하는 오행 (극출)
            sibsinType = (jiEumYang === ilganEumYang) ? "편재" : "정재";
          } else if (ohaengGeuk[jiOhaeng] === ilganOhaeng) {
            // 일간을 극하는 오행 (극입)
            sibsinType = (jiEumYang === ilganEumYang) ? "편관" : "정관";
          } else if (ohaengSaeng[jiOhaeng] === ilganOhaeng) {
            // 일간을 생하는 오행 (생입)
            sibsinType = (jiEumYang === ilganEumYang) ? "편인" : "정인";
          }

          if (sibsinType) {
            sibsinCount[sibsinType] = (sibsinCount[sibsinType] || 0) + 1;
          }
        });

        return sibsinCount;
      };

      // 지지 기반 십신 계산
      const jijiSibsinInfo = calculateJijiSibsin(sajuData.palja, sajuData.ilgan);

      // 가장 관련 깊은 십신 찾기
      const findPrimarySibsin = (sibsin, ohaeng, ilgan) => {
        // 십신의 의미와 중요도 정의
        const sibsinMeaning = {
          "비견": { priority: 5, meaning: "자아, 독립성, 경쟁심", element: "동일" },
          "겁재": { priority: 5, meaning: "경쟁, 도전, 야망", element: "동일" },
          "식신": { priority: 3, meaning: "재능, 표현력, 창조성", element: "생출" },
          "상관": { priority: 3, meaning: "비판력, 개혁성, 독창성", element: "생출" },
          "정재": { priority: 2, meaning: "안정적 재물, 계획성", element: "극출" },
          "편재": { priority: 2, meaning: "투자, 사업, 모험", element: "극출" },
          "정관": { priority: 1, meaning: "명예, 권위, 책임감", element: "극입" },
          "편관": { priority: 1, meaning: "권력, 추진력, 결단력", element: "극입" },
          "정인": { priority: 4, meaning: "학문, 지혜, 인덕", element: "생입" },
          "편인": { priority: 4, meaning: "특수재능, 종교성, 예술성", element: "생입" }
        };

        // 1. 가장 많은 십신 찾기
        let maxCount = 0;
        let primarySibsin = null;

        for (const [key, value] of Object.entries(sibsin)) {
          if (value > maxCount) {
            maxCount = value;
            primarySibsin = key;
          } else if (value === maxCount && primarySibsin) {
            // 같은 수라면 우선순위로 결정
            if (sibsinMeaning[key].priority < sibsinMeaning[primarySibsin].priority) {
              primarySibsin = key;
            }
          }
        }

        // 2. 만약 모든 십신이 0이거나 없으면 일간의 오행을 기반으로 기본 십신 설정
        if (!primarySibsin || maxCount === 0) {
          // 오행의 강약을 보고 결정
          const ohaengTotal = Object.values(ohaeng).reduce((sum, val) => sum + val, 0);
          const ilganOhaeng = ilgan.ohaeng;
          const ilganOhaengCount = ohaeng[ilganOhaeng] || 0;

          // 일간 오행이 강하면 식신/상관, 약하면 정인/편인 추천
          if (ilganOhaengCount > ohaengTotal / 5) {
            primarySibsin = ilgan.eumYang === "陽" ? "식신" : "상관";
          } else {
            primarySibsin = ilgan.eumYang === "陽" ? "정인" : "편인";
          }
        }

        return {
          name: primarySibsin,
          count: sibsin[primarySibsin] || 0,
          meaning: sibsinMeaning[primarySibsin]?.meaning || "운명의 길",
          description: `${primarySibsin}(${sibsinMeaning[primarySibsin]?.meaning || ""})이 당신의 핵심 성향입니다.`
        };
      };

      // 지지 기반 십신으로 주요 십신 찾기
      const primarySibsin = findPrimarySibsin(jijiSibsinInfo, sajuData.ohaeng, sajuData.ilgan);

      // 십신 상세 정보 로드
      const loadSibsinDetails = async (sibsinName) => {
        try {
          const fileNames = [
            `${sibsinName}_성격_완성.json`,
            `${sibsinName}_총운_완성.json`,
            `${sibsinName}_연애운_완성.json`,
            `${sibsinName}_재물운_완성.json`,
            `${sibsinName}_커리어_완성.json`,
            `${sibsinName}_건강운_완성.json`,
            `${sibsinName}_가족운_완성.json`,
            `${sibsinName}_조언가이드_완성.json`
          ];

          const results = {};

          for (const fileName of fileNames) {
            try {
              const response = await fetch(`/documents/십신/${sibsinName}/${fileName}`);
              if (response.ok) {
                const data = await response.json();
                const category = fileName.split('_')[1]; // 성격, 총운, 연애운 등 추출
                results[category] = data;
              }
            } catch (error) {
              console.log(`Failed to load ${fileName}:`, error);
            }
          }

          return results;
        } catch (error) {
          console.error("십신 상세 정보 로딩 실패:", error);
          return {};
        }
      };

      console.log("사주팔자 계산 결과:", sajuData);
      console.log("지지 기반 십신 정보:", jijiSibsinInfo);
      console.log("주요 십신:", primarySibsin);

      // 상담 의뢰 데이터를 서버에 저장
      const consultationData = {
        sajuData: sajuData,
        sibsin: jijiSibsinInfo,
        primarySibsin: primarySibsin,
        birthInfo: {
          name: formData.name,
          year: formData.year,
          month: formData.month,
          day: formData.day,
          hour: formData.hour,
          gender: formData.gender,
          mbti: formData.mbti,
          calendar: formData.calendar,
        }
      };

      // API로 데이터 전송
      const response = await fetch('/api/consultation/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData),
      });

      const result = await response.json();

      if (response.ok) {
        // 상담 결과 페이지로 이동
        router.push(`/consultation/result/${result.consultationId}?section=1`);
      } else {
        if (response.status === 401) {
          alert('로그인이 필요합니다.');
          router.push('/');
        } else {
          alert(result.error || '상담 신청 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error("제출 중 오류:", error);
      alert("의뢰 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 로딩 중일 때 표시
  if (checkingAuth) {
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
                    <span className="sage-subtitle">토리와 상담하기</span>
                  </h2>
                  <p className="sage-description">
                    그대의 이야기를 들려주시게. 토리가 정성껏 답변드리겠네.
                  </p>
                  {!user && (
                    <div className="info-card" style={{ marginTop: "15px", padding: "10px", backgroundColor: "#2a2a2a", borderRadius: "8px" }}>
                      <p style={{ fontSize: "14px", color: "#d4af37", textAlign: "center" }}>
                        ⚠️ 상담 신청을 위해서는 로그인이 필요합니다
                      </p>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="analyzer-form"
                  id="consultation-form"
                >
                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="name">이름 *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="토리가 부를 이름을 알려주게"
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="birth-year">생년월일</label>
                      <div className="date-picker-container">
                        <select
                          id="birth-year"
                          value={formData.year}
                          onChange={(e) =>
                            setFormData({ ...formData, year: e.target.value })
                          }
                          required
                          autoComplete="bday-year"
                        >
                          <option value="">년</option>
                          {Array.from({ length: 124 }, (_, i) => 2024 - i).map(
                            (year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            )
                          )}
                        </select>
                        <select
                          id="birth-month"
                          value={formData.month}
                          onChange={(e) =>
                            setFormData({ ...formData, month: e.target.value })
                          }
                          required
                          autoComplete="bday-month"
                        >
                          <option value="">월</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <option key={month} value={month}>
                                {month}
                              </option>
                            )
                          )}
                        </select>
                        <select
                          id="birth-day"
                          value={formData.day}
                          onChange={(e) =>
                            setFormData({ ...formData, day: e.target.value })
                          }
                          required
                          autoComplete="bday-day"
                        >
                          <option value="">일</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="birthtime">태어난 시간</label>
                      <select
                        id="birthtime"
                        name="birthtime"
                        value={formData.hour}
                        onChange={(e) =>
                          setFormData({ ...formData, hour: e.target.value })
                        }
                      >
                        <option value="unknown">⏰ 시간을 몰라요</option>
                        <option value="0">🐭 23:30 ~ 01:29 (자시)</option>
                        <option value="1">🐮 01:30 ~ 03:29 (축시)</option>
                        <option value="2">🐯 03:30 ~ 05:29 (인시)</option>
                        <option value="3">🐰 05:30 ~ 07:29 (묘시)</option>
                        <option value="4">🐲 07:30 ~ 09:29 (진시)</option>
                        <option value="5">🐍 09:30 ~ 11:29 (사시)</option>
                        <option value="6">🐴 11:30 ~ 13:29 (오시)</option>
                        <option value="7">🐑 13:30 ~ 15:29 (미시)</option>
                        <option value="8">🐵 15:30 ~ 17:29 (신시)</option>
                        <option value="9">🐔 17:30 ~ 19:29 (유시)</option>
                        <option value="10">🐶 19:30 ~ 21:29 (술시)</option>
                        <option value="11">🐷 21:30 ~ 23:29 (해시)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="form-row">
                      <div className="input-group">
                        <label>성별</label>
                        <div className="radio-group">
                          <input
                            type="radio"
                            id="male"
                            name="gender"
                            value="male"
                            checked={formData.gender === "male"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            autoComplete="sex"
                          />
                          <label htmlFor="male">남자</label>
                          <input
                            type="radio"
                            id="female"
                            name="gender"
                            value="female"
                            checked={formData.gender === "female"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            autoComplete="sex"
                          />
                          <label htmlFor="female">여자</label>
                        </div>
                      </div>
                      <div className="input-group">
                        <label>양력/음력</label>
                        <div className="radio-group">
                          <input
                            type="radio"
                            id="solar"
                            name="calendar"
                            value="solar"
                            checked={formData.calendar === "solar"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                calendar: e.target.value,
                              })
                            }
                          />
                          <label htmlFor="solar">양력</label>
                          <input
                            type="radio"
                            id="lunar"
                            name="calendar"
                            value="lunar"
                            checked={formData.calendar === "lunar"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                calendar: e.target.value,
                              })
                            }
                          />
                          <label htmlFor="lunar">음력</label>
                          {formData.calendar === "lunar" && (
                            <>
                              <input
                                type="checkbox"
                                id="isLeapMonth"
                                checked={formData.isLeapMonth}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    isLeapMonth: e.target.checked,
                                  })
                                }
                                style={{ marginLeft: "10px" }}
                              />
                              <label htmlFor="isLeapMonth">윤달</label>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="input-group">
                      <label htmlFor="mbti">MBTI 성격유형</label>
                      <select
                        id="mbti"
                        name="mbti"
                        value={formData.mbti}
                        onChange={(e) =>
                          setFormData({ ...formData, mbti: e.target.value })
                        }
                      >
                        <option value="">모르겠어요</option>
                        <option value="INTJ">INTJ - 전략가</option>
                        <option value="INTP">INTP - 논리술사</option>
                        <option value="ENTJ">ENTJ - 통솔자</option>
                        <option value="ENTP">ENTP - 변론가</option>
                        <option value="INFJ">INFJ - 옹호자</option>
                        <option value="INFP">INFP - 중재자</option>
                        <option value="ENFJ">ENFJ - 선도자</option>
                        <option value="ENFP">ENFP - 활동가</option>
                        <option value="ISTJ">ISTJ - 현실주의자</option>
                        <option value="ISFJ">ISFJ - 수호자</option>
                        <option value="ESTJ">ESTJ - 경영자</option>
                        <option value="ESFJ">ESFJ - 집정관</option>
                        <option value="ISTP">ISTP - 장인</option>
                        <option value="ISFP">ISFP - 모험가</option>
                        <option value="ESTP">ESTP - 사업가</option>
                        <option value="ESFP">ESFP - 연예인</option>
                      </select>
                    </div>
                  </div>

                  <div
                    className="info-card"
                    style={{ marginTop: "20px", marginBottom: "20px" }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "#a8956d",
                      }}
                    >
                      * 제출하신 개인정보는 상담 목적으로만 사용되며, 상담 종료
                      후 안전하게 폐기됩니다.
                    </p>
                  </div>

                  <div className="form-footer">
                    <div className="sage-advice">
                      <div>"그대의 고민,</div>
                      <div>토리가 차 한 잔과 함께 들어보겠네."</div>
                    </div>
                    <button
                      type="submit"
                      className="cta-button ink-brush-effect"
                      disabled={loading}
                    >
                      {loading ? "🔮 접수 중..." : "상담 신청하기"}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>
      </div>
    </PageWrapper>
  );
}
