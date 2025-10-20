"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import styles from "./DailyFortune.module.css";
import { createClient } from "@/lib/supabase";

export default function DailyFortunePage() {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [fortune, setFortune] = useState(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [showBirthDateModal, setShowBirthDateModal] = useState(false);
  const [hasBirthDate, setHasBirthDate] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 프로필 정보 가져오기
          const response = await fetch("/api/auth/profile");
          const data = await response.json();

          if (data.success && data.profile) {
            // birthDate가 있는지 확인
            setHasBirthDate(!!data.profile.birthDate);
            setUserProfile(data.profile);
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

    checkUserProfile();

    // 오늘 이미 확인했는지 체크
    const today = new Date().toDateString();
    const lastViewedDate = localStorage.getItem("lastFortuneDate");

    if (lastViewedDate === today) {
      setHasViewed(true);
      const savedFortune = localStorage.getItem("todaysFortune");
      if (savedFortune) {
        setFortune(JSON.parse(savedFortune));
        setIsFlipped(true);
        setShowContent(true);
      }
    } else {
      // 새로운 날의 운세 생성
      const newFortune = generateDailyFortune();
      setFortune(newFortune);
    }
  }, []);

  const generateDailyFortune = () => {
    const fortunes = [
      {
        title: "대길(大吉)",
        description: "오늘은 당신에게 큰 행운이 찾아오는 날입니다.",
        general:
          "모든 일이 순조롭게 풀리는 하루입니다. 적극적인 태도로 임하세요.",
        love: "새로운 인연을 만날 수 있는 좋은 기회가 찾아옵니다. 마음을 열어보세요.",
        career: "업무에서 큰 성과를 거둘 수 있는 날입니다. 자신감을 가지세요.",
        wealth: "예상치 못한 재물운이 따를 것입니다. 투자에 신중을 기하세요.",
        health: "활력이 넘치는 하루입니다. 운동을 시작하기 좋은 시기입니다.",
        advice:
          "자신감을 가지고 적극적으로 행동하세요. 주변에 감사를 표현하는 것도 잊지 마세요.",
        luckyNumber: 7,
        luckyColor: "금색",
        luckyDirection: "남쪽",
      },
      {
        title: "중길(中吉)",
        description: "평온하고 안정적인 하루가 될 것입니다.",
        general: "차분하게 일상을 보내며 내면을 돌아보기 좋은 날입니다.",
        love: "기존 관계가 더욱 돈독해지는 시간입니다. 진심을 전하세요.",
        career: "꾸준한 노력이 인정받는 날입니다. 묵묵히 자신의 일을 하세요.",
        wealth:
          "절약하면 미래에 큰 도움이 될 것입니다. 계획적인 소비를 하세요.",
        health: "규칙적인 생활 리듬을 유지하세요. 충분한 휴식이 필요합니다.",
        advice: "차분한 마음으로 일상을 즐기세요. 작은 행복에 감사하세요.",
        luckyNumber: 3,
        luckyColor: "파란색",
        luckyDirection: "동쪽",
      },
      {
        title: "소길(小吉)",
        description: "작은 행운들이 모여 큰 기쁨을 만들어낼 것입니다.",
        general: "소소한 일상 속에서 의미를 찾는 하루가 될 것입니다.",
        love: "소소한 일상에서 행복을 찾을 수 있습니다. 함께하는 시간을 소중히 하세요.",
        career: "작은 성취가 쌓여 큰 결과로 이어집니다. 꾸준함이 중요합니다.",
        wealth:
          "충동구매를 자제하고 계획적으로 소비하세요. 저축의 중요성을 느끼게 됩니다.",
        health: "가벼운 산책이나 스트레칭으로 몸을 움직이세요.",
        advice:
          "작은 것에 감사하는 마음을 가지세요. 긍정적인 생각이 행운을 부릅니다.",
        luckyNumber: 5,
        luckyColor: "초록색",
        luckyDirection: "서쪽",
      },
    ];

    // 날짜 기반으로 운세 선택 (매일 다른 운세)
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );
    const fortuneIndex = dayOfYear % fortunes.length;

    return fortunes[fortuneIndex];
  };

  // 십신 의미 헬퍼 함수 (consultation과 동일)
  const getSibsinMeaning = (sibsinName) => {
    const meanings = {
      비견: "자아, 독립성, 경쟁심",
      겁재: "경쟁, 도전, 야망",
      식신: "재능, 표현력, 창조성",
      상관: "비판력, 개혁성, 독창성",
      편재: "투자, 사업, 모험",
      정재: "안정적 재물, 계획성",
      편관: "권력, 추진력, 결단력",
      정관: "명예, 권위, 책임감",
      편인: "특수재능, 종교성, 예술성",
      정인: "학문, 지혜, 인덕"
    };
    return meanings[sibsinName] || "운명의 길";
  };

  // 오행 분석 함수
  const analyzeOhaeng = (ohaeng) => {
    const ohaengNames = {
      "木": "목(木)",
      "火": "화(火)",
      "土": "토(土)",
      "金": "금(金)",
      "水": "수(水)"
    };

    const ohaengMeanings = {
      "木": "성장, 창조, 유연성",
      "火": "열정, 활력, 확산",
      "土": "안정, 신용, 중재",
      "金": "질서, 정의, 수렴",
      "水": "지혜, 적응, 유동"
    };

    // 총 개수 계산
    const total = Object.values(ohaeng).reduce((sum, count) => sum + count, 0);

    // 가장 많은 오행 찾기
    let maxCount = 0;
    let dominantOhaeng = null;

    for (const [element, count] of Object.entries(ohaeng)) {
      if (count > maxCount) {
        maxCount = count;
        dominantOhaeng = element;
      }
    }

    // 오행별 분포 계산
    const distribution = {};
    for (const [element, count] of Object.entries(ohaeng)) {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      distribution[element] = {
        count,
        percentage,
        name: ohaengNames[element] || element,
        meaning: ohaengMeanings[element] || "알 수 없음"
      };
    }

    return {
      total,
      dominantOhaeng: dominantOhaeng ? {
        element: dominantOhaeng,
        name: ohaengNames[dominantOhaeng],
        count: maxCount,
        percentage: total > 0 ? Math.round((maxCount / total) * 100) : 0,
        meaning: ohaengMeanings[dominantOhaeng]
      } : null,
      distribution
    };
  };

  // 사용자의 주된 십신 계산 함수
  const calculateUserPrimarySibsin = async () => {
    if (!userProfile || !userProfile.birthDate) {
      console.log("프로필 정보가 부족합니다:", {
        hasProfile: !!userProfile,
        hasBirthDate: !!userProfile?.birthDate,
        hasBirthTime: !!userProfile?.birthTime
      });
      return null;
    }

    try {
      const birthDate = new Date(userProfile.birthDate);

      // 생시를 시간 인덱스로 변환 (birthTime이 없으면 정오 12시로 처리)
      let hour = 12;  // 기본값: 정오
      let minute = 0;

      if (userProfile.birthTime) {
        const birthTime = new Date(userProfile.birthTime);
        hour = birthTime.getHours();
        minute = birthTime.getMinutes();
      }

      let timeIndex = 6; // 기본값 오시 (정오)

      if (hour === 0 && minute >= 30) timeIndex = 0;
      else if (hour === 1 || (hour === 2 && minute < 30)) timeIndex = 0;
      else if ((hour === 2 && minute >= 30) || (hour === 3 && minute < 30)) timeIndex = 1;
      else if ((hour === 3 && minute >= 30) || (hour === 4 && minute < 30)) timeIndex = 1;
      else if ((hour === 4 && minute >= 30) || (hour === 5 && minute < 30)) timeIndex = 2;
      else if ((hour === 5 && minute >= 30) || (hour === 6 && minute < 30)) timeIndex = 2;
      else if ((hour === 6 && minute >= 30) || (hour === 7 && minute < 30)) timeIndex = 3;
      else if ((hour === 7 && minute >= 30) || (hour === 8 && minute < 30)) timeIndex = 3;
      else if ((hour === 8 && minute >= 30) || (hour === 9 && minute < 30)) timeIndex = 4;
      else if ((hour === 9 && minute >= 30) || (hour === 10 && minute < 30)) timeIndex = 4;
      else if ((hour === 10 && minute >= 30) || (hour === 11 && minute < 30)) timeIndex = 5;
      else if ((hour === 11 && minute >= 30) || (hour === 12 && minute < 30)) timeIndex = 5;
      else if ((hour === 12 && minute >= 30) || (hour === 13 && minute < 30)) timeIndex = 6;
      else if ((hour === 13 && minute >= 30) || (hour === 14 && minute < 30)) timeIndex = 6;
      else if ((hour === 14 && minute >= 30) || (hour === 15 && minute < 30)) timeIndex = 7;
      else if ((hour === 15 && minute >= 30) || (hour === 16 && minute < 30)) timeIndex = 7;
      else if ((hour === 16 && minute >= 30) || (hour === 17 && minute < 30)) timeIndex = 8;
      else if ((hour === 17 && minute >= 30) || (hour === 18 && minute < 30)) timeIndex = 8;
      else if ((hour === 18 && minute >= 30) || (hour === 19 && minute < 30)) timeIndex = 9;
      else if ((hour === 19 && minute >= 30) || (hour === 20 && minute < 30)) timeIndex = 9;
      else if ((hour === 20 && minute >= 30) || (hour === 21 && minute < 30)) timeIndex = 10;
      else if ((hour === 21 && minute >= 30) || (hour === 22 && minute < 30)) timeIndex = 10;
      else if ((hour === 22 && minute >= 30) || (hour === 23 && minute < 30)) timeIndex = 11;
      else if (hour === 23 && minute >= 30) timeIndex = 0;

      // 서버 사주 계산 API 호출 (consultation과 동일한 로직)
      const response = await fetch('/api/saju/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          birthDate: birthDate.toISOString(),
          timeIndex: timeIndex,
          isLunar: userProfile.calendar === 'lunar'
        })
      });

      if (!response.ok) {
        throw new Error('사주 계산 API 호출 실패');
      }

      const apiResult = await response.json();

      if (apiResult.success && apiResult.data) {
        const sajuData = apiResult.data;

        // consultation과 동일한 방식: 단순히 개수가 가장 많은 십신 찾기
        const dominantGod = Object.entries(sajuData.sibsin).reduce(
          (max, [god, value]) => (value > (max.value || 0) ? { god, value } : max),
          {}
        );

        // consultation과 동일한 형태로 주된 십신 정보 구성
        const primarySibsin = dominantGod.god ? {
          name: dominantGod.god,
          count: dominantGod.value,
          meaning: getSibsinMeaning(dominantGod.god),
          description: `${dominantGod.god}(${getSibsinMeaning(dominantGod.god)}) - ${dominantGod.value}개`
        } : null;

        // 오행 분석 (서버에서 계산된 데이터 사용)
        const ohaengAnalysis = analyzeOhaeng(sajuData.ohaeng);

        if (primarySibsin) {
          console.log("🔮 사용자의 주된 십신:", primarySibsin);

          // 오행 정보 출력
          console.log("🌟 오행 분석 결과:");
          console.log("├─ 주된 오행:", ohaengAnalysis.dominantOhaeng);
          console.log("├─ 전체 분포:", ohaengAnalysis.distribution);
          console.log("└─ 총 개수:", ohaengAnalysis.total);

          // 각 오행별 상세 정보
          console.log("📊 오행별 상세:");
          Object.entries(ohaengAnalysis.distribution).forEach(([element, info]) => {
            if (info.count > 0) {
              console.log(`   ${info.name}: ${info.count}개 (${info.percentage}%) - ${info.meaning}`);
            }
          });

          return { primarySibsin, ohaengAnalysis };
        }
      }

      return null;
    } catch (error) {
      console.error("십신 계산 중 오류:", error);
      return null;
    }
  };

  const handleCardClick = async () => {
    if (!isFlipped && !hasViewed) {
      // 생년월일이 없으면 모달 표시 (생시는 선택사항이므로 체크하지 않음)
      if (!hasBirthDate) {
        setShowBirthDateModal(true);
        return;
      }

      // 사용자의 주된 십신 및 오행 계산 및 콘솔 출력
      const result = await calculateUserPrimarySibsin();
      if (result && result.primarySibsin) {
        console.log("=" .repeat(50));
        console.log("🎯 사주팔자 분석 결과");
        console.log("=" .repeat(50));
      }

      // 카드 뒤집기 시작
      setIsFlipped(true);
      setShowGif(true);

      // GIF 애니메이션 재생 시간 (약 2초)
      setTimeout(() => {
        setShowGif(false);
        setShowContent(true);

        // 오늘 확인했음을 저장
        const today = new Date().toDateString();
        localStorage.setItem("lastFortuneDate", today);
        localStorage.setItem("todaysFortune", JSON.stringify(fortune));
        setHasViewed(true);
      }, 800);
    }
  };

  const resetFortune = () => {
    setIsFlipped(false);
    setShowGif(false);
    setShowContent(false);
    setHasViewed(false);
    localStorage.removeItem("lastFortuneDate");
    localStorage.removeItem("todaysFortune");
    // 새로운 운세 생성
    const newFortune = generateDailyFortune();
    setFortune(newFortune);
  };

  return (
    <PageWrapper>
      <div className={styles["daily-fortune-page"]}>
        <main>
          <section id="daily-fortune">
            <div className={styles["container"]}>
              <div className={styles["page-header"]}>
                <h1 className={styles["page-title"]}>오늘의 운세</h1>
              </div>

              <div className={styles["date-display"]}>
                <p>
                  {new Date().toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </p>
              </div>

              <div className={styles["card-wrapper"]}>
                {!isFlipped ? (
                  // 카드 뒷면
                  <div
                    className={styles["card-back"]}
                    onClick={handleCardClick}
                  >
                    <Image
                      src="/assets/images/오늘의운세/카드 뒷면.png"
                      alt="운세 카드 뒷면"
                      width={300}
                      height={450}
                      className={styles["card-image"]}
                      priority
                    />
                    <p className={styles["card-instruction"]}>
                      카드를 터치하여 오늘의 운세를 확인하세요
                    </p>
                  </div>
                ) : showGif ? (
                  // GIF 애니메이션
                  <div className={styles["gif-container"]}>
                    <Image
                      src="/assets/images/오늘의운세/카드뒤집기.gif"
                      alt="카드 뒤집기 애니메이션"
                      width={300}
                      height={450}
                      className={styles["gif-image"]}
                      unoptimized
                    />
                  </div>
                ) : showContent ? (
                  // 운세 내용
                  <div className={`card ${styles["daily-fortune-card"]}`}>
                    <div className={styles["card-header"]}>
                      <h2 className={styles["fortune-title"]}>
                        {fortune?.title}
                      </h2>
                      <p className={styles["fortune-description"]}>
                        {fortune?.description}
                      </p>
                    </div>

                    <div className={styles["fortune-content"]}>
                      <div className={styles["fortune-sections"]}>
                        <div className={styles["info-card"]}>
                          <h3>총운</h3>
                          <p>{fortune?.general}</p>
                        </div>

                        <div className={styles["info-card"]}>
                          <h3>애정운</h3>
                          <p>{fortune?.love}</p>
                        </div>

                        <div className={styles["info-card"]}>
                          <h3>직업운</h3>
                          <p>{fortune?.career}</p>
                        </div>

                        <div className={styles["info-card"]}>
                          <h3>금전운</h3>
                          <p>{fortune?.wealth}</p>
                        </div>

                        <div className={styles["info-card"]}>
                          <h3>건강운</h3>
                          <p>{fortune?.health}</p>
                        </div>
                      </div>

                      <div
                        className={`${styles["info-card"]} ${styles["luck-card"]}`}
                      >
                        <h3>오늘의 행운</h3>
                        <div className={styles["luck-grid"]}>
                          <div className={styles["luck-item"]}>
                            <span className={styles["luck-label"]}>
                              행운의 숫자
                            </span>
                            <span className={styles["luck-value"]}>
                              {fortune?.luckyNumber}
                            </span>
                          </div>
                          <div className={styles["luck-item"]}>
                            <span className={styles["luck-label"]}>
                              행운의 색
                            </span>
                            <span className={styles["luck-value"]}>
                              {fortune?.luckyColor}
                            </span>
                          </div>
                          <div className={styles["luck-item"]}>
                            <span className={styles["luck-label"]}>
                              행운의 방향
                            </span>
                            <span className={styles["luck-value"]}>
                              {fortune?.luckyDirection}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles["advice-section"]}>
                        <h3>오늘의 조언</h3>
                        <p className={styles["advice-text"]}>
                          {fortune?.advice}
                        </p>
                      </div>

                      {hasViewed && (
                        <p className={styles["viewed-message"]}>
                          오늘의 운세를 이미 확인하셨습니다
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className={styles["bottom-actions"]}>
                <button
                  className={styles["share-button"]}
                  onClick={() => {
                    if (navigator.share && fortune) {
                      navigator.share({
                        title: "오늘의 운세",
                        text: `오늘의 운세: ${fortune.title}\n${fortune.description}`,
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  공유하기
                </button>

                {process.env.NODE_ENV === "development" && (
                  <button
                    className={styles["reset-button"]}
                    onClick={resetFortune}
                  >
                    초기화 (개발용)
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* 생년월일 입력 요청 모달 */}
      {showBirthDateModal && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => setShowBirthDateModal(false)}
        >
          <div className={styles["modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["modal-title"]}>알림</h2>
            <p className={styles["modal-text"]}>
              마이페이지에서 생년월일을 입력해주세요!
            </p>
            <div className={styles["modal-buttons"]}>
              <button
                className={styles["modal-button-cancel"]}
                onClick={() => setShowBirthDateModal(false)}
              >
                닫기
              </button>
              <button
                className={styles["modal-button-primary"]}
                onClick={() => router.push("/mypage")}
              >
                마이페이지로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
