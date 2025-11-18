"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { calculateSajuWithManseryeok } from "../../lib/saju-utils-manseryeok"; // 서버에서 계산하므로 불필요
import { useCustomAuth } from "../hooks/useCustomAuth";
import {
  saveUserFormData,
  loadUserFormData,
} from "../../lib/localStorage-utils";
import PageWrapper from "@/components/PageWrapper";
import AuthProtectedPage from "../components/AuthProtectedPage";

export default function ConsultationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useCustomAuth();
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

  // 인증 상태 체크
  useEffect(() => {
    setCheckingAuth(authLoading);
  }, [authLoading]);

  // localStorage에서 데이터 로드 (로그인한 사용자인 경우)
  useEffect(() => {
    if (user) {
      const savedData = loadUserFormData();
      if (savedData) {
        setFormData((prev) => ({
          ...prev,
          name: savedData.name || prev.name,
          year: savedData.year || prev.year,
          month: savedData.month || prev.month,
          day: savedData.day || prev.day,
          hour: savedData.hour || prev.hour,
          gender: savedData.gender || prev.gender,
          mbti: savedData.mbti || prev.mbti,
          calendar: savedData.calendar || prev.calendar,
          isLeapMonth: savedData.isLeapMonth || prev.isLeapMonth,
        }));
      }
    }
    setCheckingAuth(authLoading);
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 로그인 체크
    if (!user) {
      alert("상담 신청을 위해서는 로그인이 필요합니다.");
      router.push("/");
      return;
    }

    setLoading(true);

    try {
      // 서버에서 manseryeok 라이브러리로 사주팔자를 계산하므로 클라이언트에서는 계산 불필요

      // 상담 의뢰 데이터를 서버에 저장 (서버에서 manseryeok으로 재계산)
      const consultationData = {
        birthInfo: {
          name: formData.name,
          year: formData.year,
          month: formData.month,
          day: formData.day,
          hour: formData.hour,
          gender: formData.gender,
          mbti: formData.mbti,
          calendar: formData.calendar,
          isLeapMonth: formData.isLeapMonth,
        },
      };

      // API로 데이터 전송
      const response = await fetch("/api/consultation/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationData),
      });

      const result = await response.json();

      if (response.ok) {
        // localStorage에 폼 데이터 저장
        saveUserFormData(formData);

        // 상담 결과 페이지로 이동
        router.push(`/consultation/result/${result.consultationId}?section=1`);
      } else {
        if (response.status === 401) {
          alert("로그인이 필요합니다.");
          router.push("/");
        } else {
          alert(result.error || "상담 신청 중 오류가 발생했습니다.");
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
    <AuthProtectedPage>
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
                        <div
                          className="info-card"
                          style={{
                            marginTop: "15px",
                            padding: "10px",
                            backgroundColor: "#2a2a2a",
                            borderRadius: "8px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#d4af37",
                              textAlign: "center",
                            }}
                          >
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
                                setFormData({
                                  ...formData,
                                  year: e.target.value,
                                })
                              }
                              required
                              autoComplete="bday-year"
                            >
                              <option value="">년</option>
                              {Array.from(
                                { length: 124 },
                                (_, i) => 2024 - i
                              ).map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                            <select
                              id="birth-month"
                              value={formData.month}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  month: e.target.value,
                                })
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
                                setFormData({
                                  ...formData,
                                  day: e.target.value,
                                })
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
                          <label htmlFor="mbti">성격유형</label>
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
                          * 제출하신 개인정보는 상담 목적으로만 사용되며, 상담
                          종료 후 안전하게 폐기됩니다.
                        </p>
                      </div>

                      <div className="form-footer">
                        <div className="sage-advice">
                          <div>&ldquo;그대의 고민,</div>
                          <div>토리가 차 한 잔과 함께 들어보겠네.&rdquo;</div>
                        </div>
                        <button
                          type="submit"
                          className="cta-button ink-brush-effect"
                          disabled={loading}
                        >
                          {loading ? "접수 중..." : "상담 신청하기"}
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
    </AuthProtectedPage>
  );
}
