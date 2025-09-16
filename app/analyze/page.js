"use client";

import { useState } from "react";
import { calculateSaju, determinePaljaType } from "../../lib/saju-utils";

export default function AnalyzePage() {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "unknown",
    gender: "male",
    calendar: "solar",
    isLeapMonth: false,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 궁합 데이터
  const compatibilityData = {
    WSIJ: { best: "NSHJ", growth: "NGHY" },
    WSIY: { best: "NSHY", growth: "NGHJ" },
    WSHJ: { best: "NSIJ", growth: "NGIY" },
    WSHY: { best: "NSIY", growth: "NGIJ" },
    WGIJ: { best: "NGHJ", growth: "NSHY" },
    WGIY: { best: "NGHJ", growth: "NSHJ" },
    WGHJ: { best: "NGIJ", growth: "NSIY" },
    WGHY: { best: "NGIY", growth: "NSIJ" },
    NSIJ: { best: "WSHJ", growth: "WGHY" },
    NSIY: { best: "WSHY", growth: "WGHJ" },
    NSHJ: { best: "WSIJ", growth: "WGIY" },
    NSHY: { best: "WSIY", growth: "WGIJ" },
    NGIJ: { best: "WGHJ", growth: "WSHY" },
    NGIY: { best: "WGHY", growth: "WSHJ" },
    NGHJ: { best: "WGIJ", growth: "WSIY" },
    NGHY: { best: "WSIJ", growth: "WSHJ" },
  };

  // 코드 해석 함수
  const getCodeLegend = (typeCode) => {
    const legendData = {
      W: "<strong>W(외강형):</strong> 에너지가 넘치고 자기 주도적인 성향이에요.",
      N: "<strong>N(내유형):</strong> 신중하고 주변과의 조화를 중시하는 성향이에요.",
      S: "<strong>S(실리형):</strong> 현실 감각이 뛰어나고 구체적인 성과를 중요하게 생각해요.",
      G: "<strong>G(관념형):</strong> 정신적인 가치와 의미를 탐구하는 것을 좋아해요.",
      I: "<strong>I(이성형):</strong> 객관적인 원칙과 논리에 따라 판단하는 편이에요.",
      H: "<strong>H(화합형):</strong> 사람들과의 관계와 조화를 우선적으로 생각해요.",
      J: "<strong>J(정주형):</strong> 계획적이고 안정적인 삶의 리듬을 가지고 있어요.",
      Y: "<strong>Y(유랑형):</strong> 변화무쌍하고 자율적인 삶의 리듬을 가지고 있어요.",
    };

    let legendHTML = "";
    typeCode.split("").forEach((code) => {
      legendHTML += legendData[code] + "<br>";
    });
    return legendHTML;
  };

  // 궁합 데이터 가져오기 함수
  const getCompatibilityData = (typeCode) => {
    if (!result || !result.database) {
      return {
        soulmateImage: "",
        soulmateName: "",
        soulmateCode: "",
        growthImage: "",
        growthName: "",
        growthCode: "",
      };
    }

    const matches = compatibilityData[typeCode];
    if (!matches) {
      return {
        soulmateImage: "",
        soulmateName: "",
        soulmateCode: "",
        growthImage: "",
        growthName: "",
        growthCode: "",
      };
    }

    const soulmateData = result.database[matches.best];
    const growthData = result.database[matches.growth];

    return {
      soulmateImage: soulmateData?.imageUrl || "",
      soulmateName: soulmateData?.alias || "",
      soulmateCode: matches.best || "",
      growthImage: growthData?.imageUrl || "",
      growthName: growthData?.alias || "",
      growthCode: matches.growth || "",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 데이터베이스 로드
      const response = await fetch("/database.json");
      const database = await response.json();

      // 날짜 객체 생성
      const birthDate = new Date(
        parseInt(formData.year),
        parseInt(formData.month) - 1,
        parseInt(formData.day)
      );

      // 시간 인덱스 변환
      let timeIndex = 6; // 기본값 (오시)
      if (formData.hour !== "unknown") {
        timeIndex = parseInt(formData.hour);
      }

      // 사주팔자 계산
      const sajuData = calculateSaju(birthDate, timeIndex);

      // 성격 유형 결정
      const personalityType = determinePaljaType(sajuData);

      // 데이터베이스에서 결과 가져오기
      const typeData = database[personalityType];
      if (!typeData) {
        throw new Error(`팔자유형 ${personalityType}을 찾을 수 없습니다.`);
      }

      const resultData = {
        sajuData,
        personalityType,
        typeData,
        database,
        date: new Date().toISOString(),
        birthInfo: {
          name: formData.name,
          year: formData.year,
          month: formData.month,
          day: formData.day,
          hour: formData.hour,
          gender: formData.gender,
          calendar: formData.calendar,
        },
      };

      setResult(resultData);

      // 로컬 스토리지에 결과 저장
      const savedResults = JSON.parse(
        localStorage.getItem("sajuResults") || "[]"
      );
      savedResults.unshift(resultData);
      localStorage.setItem("sajuResults", JSON.stringify(savedResults));
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
      alert("분석 중 오류가 발생했습니다: " + error.message);
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
                    <span className="sage-subtitle">
                      그대의 이야기를 듣고자 하네.
                    </span>
                  </h2>
                  <p className="sage-description">
                    차 한 잔의 여유로 그대의 운명을 살펴보자.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="analyzer-form"
                  id="saju-form"
                >
                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="name">이름 (선택)</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="토리가 부를 이름을 알려주게"
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

                  <div className="form-footer">
                    <div className="sage-advice">
                      <div>"그대의 이야기,</div>
                      <div>토리가 차 한 잔과 함께 들어보겠네."</div>
                    </div>
                    <button
                      type="submit"
                      className="cta-button ink-brush-effect"
                      disabled={loading}
                    >
                      {loading ? "🔮 해석 중..." : "나의 길, 묻기"}
                    </button>
                  </div>
                </form>
              </div>

              {result && (
                <div
                  id="result-section"
                  className="card result-card"
                  style={{ display: "block", opacity: 1 }}
                >
                  <img
                    id="result-image"
                    className="main-result-image"
                    src={result.typeData.imageUrl}
                    alt="팔자유형 이미지"
                  />
                  <p className="result-type-code">{result.personalityType}</p>
                  <h2 id="result-alias" className="card-title">
                    {result.typeData.alias}
                  </h2>
                  <p id="result-description">{result.typeData.description}</p>

                  <p
                    className="teaser-text"
                    style={{ marginTop: "25px", marginBottom: "10px" }}
                  >
                    MBTI+사주 기반 상세 리포트, 팔자유형 심층 분석은{" "}
                    <strong>[기능 준비중]</strong>입니다!
                  </p>

                  <div className="info-card">
                    <h3>[토리가 건네는 응원]</h3>
                    <p id="result-advice">{result.typeData.advice}</p>
                  </div>

                  <div className="info-card">
                    <h3>[나의 코드 해석]</h3>
                    <p
                      id="result-legend"
                      dangerouslySetInnerHTML={{
                        __html: getCodeLegend(result.personalityType),
                      }}
                    />
                  </div>

                  <div className="interview-cta">
                    <h3>토리가 건네는 특별한 초대장</h3>
                    <p>
                      당신의 이야기는 '성격팔자'를 완성하는 마지막 조각입니다.
                      <br />
                      지금 1:1 면담에 참여하고, 정식 출시의 'VVIP'가 되어주세요.
                    </p>
                    <a
                      href="https://smore.im/form/2RQBeyh8f3"
                      target="_blank"
                      className="cta-button"
                      rel="noopener noreferrer"
                    >
                      1:1 면담 시작하기 💌
                    </a>
                  </div>

                  <div className="compatibility-section">
                    <h3 className="compatibility-title">
                      [나의 인연 스포일러]
                    </h3>
                    <div className="compatibility-grid">
                      <div className="compatibility-item">
                        <p className="compatibility-item-title">최고의 궁합</p>
                        <img
                          id="soulmate-image"
                          className="compatibility-image"
                          src={
                            getCompatibilityData(result.personalityType)
                              .soulmateImage
                          }
                          alt={
                            getCompatibilityData(result.personalityType)
                              .soulmateName
                          }
                        />
                        <p id="soulmate-alias" className="compatibility-name">
                          {
                            getCompatibilityData(result.personalityType)
                              .soulmateName
                          }
                        </p>
                        <p id="soulmate-code" className="compatibility-type">
                          {
                            getCompatibilityData(result.personalityType)
                              .soulmateCode
                          }
                        </p>
                      </div>
                      <div className="compatibility-item">
                        <p className="compatibility-item-title">성장의 파트너</p>
                        <img
                          id="growth-image"
                          className="compatibility-image"
                          src={
                            getCompatibilityData(result.personalityType)
                              .growthImage
                          }
                          alt={
                            getCompatibilityData(result.personalityType)
                              .growthName
                          }
                        />
                        <p id="growth-alias" className="compatibility-name">
                          {
                            getCompatibilityData(result.personalityType)
                              .growthName
                          }
                        </p>
                        <p id="growth-code" className="compatibility-type">
                          {
                            getCompatibilityData(result.personalityType)
                              .growthCode
                          }
                        </p>
                      </div>
                    </div>
                    <p className="teaser-text">
                      상세한 궁합 풀이는 <strong>[기능 준비중]</strong>입니다!
                    </p>
                  </div>

                  <div className="share-card">
                    <h3>내 팔자 유형 자랑하기</h3>
                    <p>친구들에게 나의 특별한 팔자 유형을 공유해보세요!</p>
                    <button id="openShareModalBtn" className="share-toggle-btn">
                      공유하기
                    </button>
                  </div>

                  <div className="synergy-card">
                    <h3>🔮 MBTI × 팔자 시너지 분석</h3>
                    <p>
                      당신의 MBTI와 팔자유형이 만나면
                      <br />
                      어떤 특별한 시너지가 생길까요?
                    </p>
                    <a href="/synergy" className="btn btn-accent">
                      시너지 분석하러 가기
                    </a>
                  </div>

                  <div className="save-to-mypage-card">
                    <h3>📝 나의 결과 저장하기</h3>
                    <p>
                      이 소중한 분석 결과를
                      <br />
                      마이페이지에 저장하고 언제든지
                      <br />
                      다시 확인해보세요!
                    </p>
                    <button id="save-to-mypage-btn" className="btn btn-primary">
                      마이페이지에 저장하기
                    </button>
                  </div>

                  <div className="cta-card">
                    <h3>업데이트 소식이 궁금하다면?</h3>
                    <p>
                      가장 먼저 '성격팔자'의 소식을 받고
                      <br />
                      다양한 혜택을 놓치지 마세요!
                    </p>
                    <div className="social-buttons">
                      <a
                        id="kakao-channel-button"
                        className="social-button"
                        href="http://pf.kakao.com/_BxnBxmn/friend"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>카카오톡 채널 추가</span>
                      </a>
                      <a
                        id="instagram-button"
                        className="social-button"
                        href="https://www.instagram.com/palja_tory/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>인스타그램 보러가기</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
