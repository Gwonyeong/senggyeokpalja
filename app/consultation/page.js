"use client";

import { useState } from "react";

export default function ConsultationPage() {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "unknown",
    gender: "male",
    calendar: "solar",
    isLeapMonth: false,
    email: "",
    phone: "",
    consultationType: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("의뢰 제출:", formData);
      alert("상담 의뢰가 접수되었습니다. 토리가 곧 연락드리겠습니다.");
    } catch (error) {
      console.error("제출 중 오류:", error);
      alert("의뢰 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
                  </div>

                  <div className="form-section">
                    <div className="form-row">
                      <div className="input-group">
                        <label htmlFor="email">이메일 *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="example@email.com"
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="phone">연락처</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="010-0000-0000"
                        />
                      </div>
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
  );
}
