"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { calculateSaju, determinePaljaType } from "../../lib/saju-utils";
import { createClient } from "../../lib/supabase";
import Head from "next/head";
import Image from "next/image";
import PageWrapper from "@/components/PageWrapper";
import AuthProtectedPage from "../components/AuthProtectedPage";
import Link from "next/link";

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [user, setUser] = useState(null);
  const [savedToDb, setSavedToDb] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [isQueryMode, setIsQueryMode] = useState(false);
  const invitationRef = useRef(null);

  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // 인증 상태 변경 감지
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Query parameter에서 팔자 유형 확인 및 자동 결과 표시
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && type.length === 4) {
      // 유효한 팔자 유형인지 확인
      const validTypes = [
        'WSIJ', 'WSIY', 'WSHJ', 'WSHY',
        'WGIJ', 'WGIY', 'WGHJ', 'WGHY',
        'NSIJ', 'NSIY', 'NSHJ', 'NSHY',
        'NGIJ', 'NGIY', 'NGHJ', 'NGHY'
      ];

      if (validTypes.includes(type.toUpperCase())) {
        setIsQueryMode(true);
        loadTypeFromQuery(type.toUpperCase());
      }
    } else {
      setIsQueryMode(false);
    }
  }, [searchParams]);

  // Query parameter로부터 팔자 유형 로드
  const loadTypeFromQuery = async (typeCode) => {
    try {
      setLoading(true);

      // 데이터베이스 로드
      const response = await fetch("/database.json");
      const database = await response.json();

      const typeData = database[typeCode];
      if (typeData) {
        const mockResult = {
          personalityType: typeCode,
          typeData: typeData,
          database: database
        };

        setResult(mockResult);
        setFormData(prev => ({ ...prev, name: "미리보기" }));
      }
    } catch (error) {
      console.error("Query 타입 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };


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
      W: "<strong>W(외강형)</strong> <br /> 에너지가 넘치고 자기 주도적인 성향이에요.",
      N: "<strong>N(내유형)</strong> <br /> 신중하고 주변과의 조화를 중시하는 성향이에요.",
      S: "<strong>S(실리형)</strong> <br /> 현실 감각이 뛰어나고 구체적인 성과를 중요하게 생각해요.",
      G: "<strong>G(관념형)</strong> <br /> 정신적인 가치와 의미를 탐구하는 것을 좋아해요.",
      I: "<strong>I(이성형)</strong> <br /> 객관적인 원칙과 논리에 따라 판단하는 편이에요.",
      H: "<strong>H(화합형)</strong> <br /> 사람들과의 관계와 조화를 우선적으로 생각해요.",
      J: "<strong>J(정주형)</strong> <br /> 계획적이고 안정적인 삶의 리듬을 가지고 있어요.",
      Y: "<strong>Y(유랑형)</strong> <br /> 변화무쌍하고 자율적인 삶의 리듬을 가지고 있어요.",
    };

    let legendHTML = "";
    typeCode.split("").forEach((code) => {
      legendHTML += legendData[code] + "<br> <br>";
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

      let birthDate;

      // 음력인 경우 양력으로 변환
      if (formData.calendar === "lunar") {
        const lunIl = formData.isLeapMonth ? "1" : "0";
        const convertResponse = await fetch(
          `/api/calendar/convert?lunYear=${formData.year}&lunMonth=${formData.month}&lunDay=${formData.day}&lunIl=${lunIl}`
        );

        if (!convertResponse.ok) {
          const errorData = await convertResponse.json();
          throw new Error(
            errorData.error || "음력 변환 중 오류가 발생했습니다."
          );
        }

        const convertResult = await convertResponse.json();

        // 변환된 양력 날짜로 Date 객체 생성
        birthDate = new Date(
          parseInt(convertResult.solarYear),
          parseInt(convertResult.solarMonth) - 1,
          parseInt(convertResult.solarDay)
        );

        console.log(
          `음력 ${formData.year}.${formData.month}.${formData.day} → 양력 ${convertResult.solarYear}.${convertResult.solarMonth}.${convertResult.solarDay}`
        );
      } else {
        // 양력인 경우 그대로 사용
        birthDate = new Date(
          parseInt(formData.year),
          parseInt(formData.month) - 1,
          parseInt(formData.day)
        );
      }

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
      setSavedToDb(false);
      // 새로운 결과가 나올 때마다 모달 상태 초기화
      setModalShown(false);
      setShowConsultationModal(false);

      // 로컬 스토리지에 결과 저장
      const savedResults = JSON.parse(
        localStorage.getItem("sajuResults") || "[]"
      );
      savedResults.unshift(resultData);
      localStorage.setItem("sajuResults", JSON.stringify(savedResults));

      // 로그인한 사용자의 경우에만 데이터베이스에 저장
      if (user) {
        try {
          const saveResponse = await fetch("/api/analysis/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              personalityType,
              birthInfo: {
                name: formData.name || null,
                year: formData.year,
                month: formData.month,
                day: formData.day,
                hour: formData.hour,
                gender: formData.gender,
                calendar: formData.calendar,
                isLeapMonth: formData.isLeapMonth,
              },
              sajuData,
              analysisDate: new Date().toISOString(),
            }),
          });

          const saveResult = await saveResponse.json();
          if (saveResult.success && saveResult.resultId) {
            console.log(
              "Analysis result saved to database:",
              saveResult.resultId
            );
            setSavedToDb(true);
          }
        } catch (saveError) {
          // 저장 실패는 조용히 처리 (사용자 경험에 영향 없음)
          console.error("Failed to save analysis result:", saveError);
        }
      }
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
      alert("분석 중 오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 공유하기 기능
  const handleShare = async () => {
    try {
      // 서버에 공유 데이터 저장 요청
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: result.personalityType,
        }),
      });

      if (!response.ok) {
        throw new Error("공유 데이터 생성 실패");
      }

      const { shareId } = await response.json();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const shareUrl = siteUrl;

      if (navigator.share) {
        const userName = formData.name || "나";
        navigator.share({
          title: `${userName}님의 팔자유형은 ${result.personalityType}(${result.typeData.alias}) 입니다 - 성격팔자`,
          text: `${userName}님의 팔자유형은 ${result.personalityType}(${result.typeData.alias}) 입니다.\n\n나의 코드 해석\n${result.typeData.description}`,
          url: shareUrl,
        });
      } else {
        // Web Share API를 지원하지 않는 브라우저에서는 클립보드 복사
        const userName = formData.name || "나";
        const shareText = `${userName}님의 팔자유형은 ${result.personalityType}(${result.typeData.alias}) 입니다.

나의 코드 해석
${result.typeData.description}

성격팔자 링크
${shareUrl}`;
        navigator.clipboard.writeText(shareText).then(() => {
          alert("공유 링크가 클립보드에 복사되었습니다!");
        });
      }
    } catch (error) {
      console.error("공유 실패:", error);
      alert("공유 기능에 오류가 발생했습니다.");
    }
  };

  // 페이지 제목만 업데이트 (메타데이터는 서버사이드에서 처리)
  useEffect(() => {
    if (result) {
      document.title = `나는 ${result.typeData.alias}! - 성격팔자`;
    }
  }, [result]);

  // 스크롤 감지 기능
  useEffect(() => {
    if (!result || !invitationRef.current || modalShown) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !modalShown) {
            setShowConsultationModal(true);
            setModalShown(true);
          }
        });
      },
      {
        threshold: 0.5, // 50% 이상 보일 때 트리거
        rootMargin: "0px 0px -100px 0px", // 하단 100px 여유
      }
    );

    const currentRef = invitationRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [result, modalShown]);

  return (
    <AuthProtectedPage>
      <PageWrapper>
        <div className="analyze-page">
          <main>
            <section id="analyzer">
              <div className="container">
                <div className="analyzer-layout">
                  {!isQueryMode && (
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
                      </div>

                      <div className="form-footer">
                        <div className="sage-advice">
                          <div>&ldquo;그대의 이야기,</div>
                          <div>토리가 차 한 잔과 함께 들어보겠네.&rdquo;</div>
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
                  )}

                  {result && (
                    <div
                      id="result-section"
                      className="card result-card"
                      style={{ display: "block", opacity: 1 }}
                    >
                      <Image
                        id="result-image"
                        className="main-result-image"
                        src={result.typeData.imageUrl}
                        alt="팔자유형 이미지"
                        width={300}
                        height={300}
                      />
                      <p className="result-type-code">
                        {result.personalityType}
                      </p>
                      <h2
                        id="result-alias"
                        className="card-title text-center"
                        style={{ textAlign: "center" }}
                      >
                        {result.typeData.alias}
                      </h2>
                      <p id="result-description">
                        {result.typeData.description}
                      </p>

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
                      <div className="compatibility-section">
                        <h3 className="compatibility-title">
                          [나의 인연 스포일러]
                        </h3>
                        <div className="compatibility-grid">
                          <div className="compatibility-item">
                            <p className="compatibility-item-title">
                              최고의 궁합
                            </p>
                            <Image
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
                              width={120}
                              height={120}
                            />
                            <p
                              id="soulmate-alias"
                              className="compatibility-name"
                            >
                              {
                                getCompatibilityData(result.personalityType)
                                  .soulmateName
                              }
                            </p>
                            <p
                              id="soulmate-code"
                              className="compatibility-type"
                            >
                              {
                                getCompatibilityData(result.personalityType)
                                  .soulmateCode
                              }
                            </p>
                          </div>
                          <div className="compatibility-item">
                            <p className="compatibility-item-title">
                              성장의 파트너
                            </p>
                            <Image
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
                              width={120}
                              height={120}
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
                          상세한 궁합 풀이는 <strong>[기능 준비중]</strong>
                          입니다!
                        </p>
                      </div>
                      <div className="share-card">
                        <h3>내 팔자 유형 자랑하기</h3>
                        <p>친구들에게 나의 특별한 팔자 유형을 공유해보세요!</p>
                        <button
                          id="openShareModalBtn"
                          className="share-toggle-btn"
                          onClick={handleShare}
                        >
                          공유하기
                        </button>
                      </div>

                      {/* 저장 상태 알림 */}

                      <div className="synergy-card" ref={invitationRef}>
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

                      <div className="cta-card">
                        <h3>업데이트 소식이 궁금하다면?</h3>
                        <p>
                          가장 먼저 &lsquo;성격팔자&rsquo;의 소식을 받고
                          <br />
                          다양한 혜택을 놓치지 마세요!
                        </p>
                        <div
                          className="social-buttons"
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: "20px",
                            marginTop: "20px",
                          }}
                        >
                          <a
                            id="kakao-channel-button"
                            href="http://pf.kakao.com/_BxnBxmn/friend"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              transition: "transform 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.transform = "scale(1.1)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.transform = "scale(1)")
                            }
                          >
                            <Image
                              src="/assets/images/kakao_symbol.png"
                              alt="카카오톡 채널 추가"
                              width={40}
                              height={40}
                            />
                          </a>
                          <a
                            id="instagram-button"
                            href="https://www.instagram.com/palja_tory/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              transition: "transform 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.transform = "scale(1.1)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.transform = "scale(1)")
                            }
                          >
                            <Image
                              src="/assets/images/instagram_symbol.png"
                              alt="인스타그램 보러가기"
                              width={40}
                              height={40}
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>

          {/* Consultation 유도 모달 */}
          {showConsultationModal && (
            <div
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{
                background: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(2px)",
                zIndex: 999999
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowConsultationModal(false);
                }
              }}
            >
              <div
                className="max-w-md w-full mx-4 relative"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(252, 163, 17, 0.12) 0%, rgba(184, 134, 11, 0.08) 100%)",
                  borderRadius: "16px",
                  border: "2px solid rgba(252, 163, 17, 0.4)",
                  padding: "32px 24px",
                  backdropFilter: "blur(8px)",
                  boxShadow:
                    "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(252, 163, 17, 0.2)",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >
                <button
                  onClick={() => setShowConsultationModal(false)}
                  className="absolute top-4 right-4 text-[#FCA311] hover:text-white text-2xl transition-colors"
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "rgba(252, 163, 17, 0.1)",
                    border: "1px solid rgba(252, 163, 17, 0.3)",
                    minHeight: "44px",
                    minWidth: "44px",
                    touchAction: "manipulation"
                  }}
                >
                  ×
                </button>
                <div className="text-center">
                  <div
                    className="mb-6"
                    style={{
                      background: "linear-gradient(135deg, #FCA311, #d4af37)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <h3 className="text-2xl font-bold">
                      잠깐,<br />
                      숨겨진 찻잎의 맛이 궁금하지 않으신가?
                    </h3>
                  </div>
                  <p className="text-white mb-6 leading-relaxed text-base">
                    그대가 방금 맛본 것은,<br />
                    가장 기본적인 '오늘의 차'일 뿐이라네.<br />
                    <br />
                    내 서재에는, 아주 귀한 손님에게만<br />
                    내어주는 '비밀 찻잎'이 있지.
                  </p>
                  <div className="space-y-4">
                    <Link
                      href="/consultation"
                      className="block w-full text-black font-bold transition-all duration-300 hover:transform hover:scale-105"
                      onClick={() => setShowConsultationModal(false)}
                      style={{
                        background: "linear-gradient(135deg, #FCA311, #d4af37)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(252, 163, 17, 0.3)",
                        padding: "20px 24px",
                        minHeight: "44px",
                        touchAction: "manipulation"
                      }}
                    >
                      토리의 시그니처, 맛보기
                    </Link>
                    <button
                      onClick={() => setShowConsultationModal(false)}
                      className="block w-full transition-all duration-300 hover:transform hover:scale-105"
                      style={{
                        background: "rgba(252, 163, 17, 0.1)",
                        border: "2px solid rgba(252, 163, 17, 0.5)",
                        color: "#FCA311",
                        borderRadius: "12px",
                        backdropFilter: "blur(4px)",
                        padding: "20px 24px",
                        minHeight: "44px",
                        touchAction: "manipulation"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(252, 163, 17, 0.2)";
                        e.target.style.borderColor = "#FCA311";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(252, 163, 17, 0.1)";
                        e.target.style.borderColor = "rgba(252, 163, 17, 0.5)";
                      }}
                    >
                      오늘은 이만..
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </AuthProtectedPage>
  );
}
