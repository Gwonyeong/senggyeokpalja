"use client";

import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";
import { formatTextToJSX } from "../../../../../lib/text-utils";
import { useState, useEffect } from "react";

export default function Section5Fortune({ consultation }) {
  const [fortuneData, setFortuneData] = useState(null);

  // 가장 강한 십신 계산
  const getDominantTenGod = (consultation) => {
    if (!consultation?.tenGods) return null;

    const tenGodsData = consultation.tenGods;
    const dominantGod = Object.entries(tenGodsData).reduce(
      (max, [god, value]) => (value > (max.value || 0) ? { god, value } : max),
      {}
    );

    return dominantGod.value > 0 ? dominantGod.god : null;
  };

  // 현재 나이 계산
  const getCurrentAge = (consultation) => {
    if (!consultation?.birthDate) return null;

    const birthDate = new Date(consultation.birthDate);
    const currentDate = new Date();

    // 만나이 계산
    let age = currentDate.getFullYear() - birthDate.getFullYear();

    // 생일이 지났는지 확인
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age + 1; // 한국식 나이 (만나이 + 1)
  };

  // 현재 대운 연령대 계산
  const getCurrentDaeunPeriod = (age) => {
    if (age <= 20) return "11-20";
    if (age <= 30) return "21-30";
    if (age <= 40) return "31-40";
    if (age <= 50) return "41-50";
    if (age <= 60) return "51-60";
    return "61+";
  };

  // 대운, 세운 데이터 로드
  useEffect(() => {
    const loadFortuneData = async () => {
      if (!consultation) return;

      try {
        const dominantGod = getDominantTenGod(consultation);
        if (!dominantGod) {
          setFortuneData({
            daeun: {
              title: "대운 분석",
              allPeriods: {},
              currentPeriod: null,
              age: null,
            },
            sewun: {
              title: "세운 분석",
              content: "십성 데이터를 찾을 수 없습니다.",
            },
          });
          return;
        }

        // 대운 데이터 로드
        const daeunResponse = await fetch(
          `/documents/대운-세운/${dominantGod}_대운전용_완성.json`
        );
        let daeunData = null;
        if (daeunResponse.ok) {
          daeunData = await daeunResponse.json();
        }

        // 세운 데이터 로드
        const sewunResponse = await fetch(
          `/documents/대운-세운/${dominantGod}_세운전용_완성.json`
        );
        let sewunData = null;
        if (sewunResponse.ok) {
          sewunData = await sewunResponse.json();
        }

        // 현재 나이와 대운 기간 계산
        const currentAge = getCurrentAge(consultation);
        const daeunPeriod = currentAge
          ? getCurrentDaeunPeriod(currentAge)
          : "31-40";

        // 대운 내용 추출 (모든 나이대)
        let daeunAllPeriods = {};
        if (daeunData?.daewoon_only) {
          daeunAllPeriods = daeunData.daewoon_only;
        }

        // 세운 내용 추출 (2026년 기준)
        let sewunContent = "세운 분석을 불러올 수 없습니다.";
        if (sewunData?.sewoon_only?.["2026"]) {
          sewunContent = sewunData.sewoon_only["2026"];
        }

        setFortuneData({
          daeun: {
            title: `대운 분석 (${dominantGod} 기준)`,
            allPeriods: daeunAllPeriods,
            currentPeriod: daeunPeriod,
            age: currentAge,
          },
          sewun: {
            title: `세운 분석 (${dominantGod} 기준)`,
            content: sewunContent,
            year: "2026",
          },
        });
      } catch (error) {
        console.error("대운-세운 데이터 로드 실패:", error);
        setFortuneData({
          daeun: {
            title: "대운 분석",
            allPeriods: {},
            currentPeriod: null,
            age: null,
          },
          sewun: {
            title: "세운 분석",
            content: "데이터를 불러오는 중 오류가 발생했습니다.",
          },
        });
      }
    };

    loadFortuneData();
  }, [consultation]);

  // 섹션 5에서 사용할 이미지 목록
  const imageList = [
    "/assets/images/results/5장/1.png",
    "/assets/images/results/1장/5.png",
    "/assets/images/results/1장/5.png",
  ];

  // 웹툰 패널 설정들
  const panelConfigs = [
    {
      backgroundImage: imageList[0],
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
        top: "0%",
        // maxWidth: "400px",
      },
      speechBubbles: [
        {
          text: "대운은 크게 10년 주기로 찾아온다네",
          position: { top: "90%", right: "30%" },
          size: "large",
          direction: "bottom-right",
        },
      ],
    },
    {
      backgroundImage: imageList[1],
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "다음은 세운이라네. \n세운은 해마다 바뀌는 신년운세로, 절기 입춘을 기준으로",
          position: { top: "90%" },
          size: "extraLarge",
          direction: "bottom-right",
        },
      ],
    },
    {
      backgroundImage: imageList[2],
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "다음장은 그대의 운에 대해 알려주겠네.",
          position: { top: "10%", left: "30%" },
          size: "large",
          direction: "bottom-right",
          backgroundColor: "#e2e3e5",
          borderColor: "#383d41",
          textColor: "#383d41",
          maxWidth: "400px",
        },
      ],
    },
  ];

  // consultation이 없으면 로딩 표시
  if (!consultation) {
    return (
      <div>
        <div className="card-header">
          <h3 className="card-title">5. 나의 대운, 세운</h3>
        </div>
        <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
          상담 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 1. 최상단 제목 */}
      <div className="card-header">
        <h3 className="card-title">5. 나의 대운, 세운</h3>
      </div>

      {/* 2. 그 아래 웹툰 퍼널 */}
      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          key="section5-panel-1"
          sectionNumber={5}
          consultation={consultation}
          backgroundImage={panelConfigs[0].backgroundImage}
          imageStyle={panelConfigs[0].imageStyle}
          speechBubbles={panelConfigs[0].speechBubbles}
          panelStyle={{
            minHeight: "500px",
            background: "transparent",
            border: "none",
            borderRadius: "0",
          }}
        />
      </div>

      {/* 3. 그 아래 '대운 설명' */}
      {fortuneData && (
        <div
          style={{
            marginTop: "100px",
            width: "100%",
            maxWidth: "100%",
            marginBottom: "30px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            padding: "clamp(12px, 4vw, 20px)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxSizing: "border-box",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          <h4
            style={{
              color: "#d4af37",
              fontSize: "clamp(18px, 5vw, 24px)",
              fontWeight: "bold",
              marginBottom: "8px",
              fontFamily: "Noto Serif KR",
              textAlign: "center",
            }}
          >
            {fortuneData.daeun.title}
          </h4>
          {fortuneData.daeun.age && (
            <div
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "12px",
                textAlign: "center",
                marginBottom: "20px",
                fontStyle: "italic",
              }}
            >
              현재 나이: {fortuneData.daeun.age}세
            </div>
          )}

          {/* 모든 나이대별 대운 설명 */}
          {Object.entries(fortuneData.daeun.allPeriods || {}).map(
            ([period, content]) => {
              const isCurrentPeriod =
                period === fortuneData.daeun.currentPeriod;

              return (
                <div
                  key={period}
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    backgroundColor: isCurrentPeriod
                      ? "rgba(212, 175, 55, 0.1)"
                      : "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    border: isCurrentPeriod
                      ? "2px solid rgba(212, 175, 55, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: isCurrentPeriod
                      ? "0 0 15px rgba(212, 175, 55, 0.2)"
                      : "none",
                  }}
                >
                  <h5
                    style={{
                      color: isCurrentPeriod
                        ? "#d4af37"
                        : "rgba(255, 255, 255, 0.9)",
                      fontSize: "16px",
                      fontWeight: "600",
                      marginBottom: "12px",
                      fontFamily: "Noto Serif KR",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isCurrentPeriod && (
                      <span style={{ fontSize: "14px" }}>🎯</span>
                    )}
                    {period}세 대운
                    {isCurrentPeriod && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#d4af37",
                          fontWeight: "normal",
                          marginLeft: "auto",
                        }}
                      >
                        현재 시기
                      </span>
                    )}
                  </h5>
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {content}
                  </div>
                </div>
              );
            }
          )}

          {Object.keys(fortuneData.daeun.allPeriods || {}).length === 0 && (
            <div
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "14px",
                textAlign: "center",
                padding: "20px",
                fontStyle: "italic",
              }}
            >
              대운 데이터를 불러올 수 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 4. 그 아래 웹툰 퍼널 */}
      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          key="section5-panel-2"
          sectionNumber={5}
          consultation={consultation}
          backgroundImage={panelConfigs[1].backgroundImage}
          imageStyle={panelConfigs[1].imageStyle}
          speechBubbles={panelConfigs[1].speechBubbles}
          panelStyle={{
            minHeight: "500px",
            background: "transparent",
            border: "none",
            borderRadius: "0",
          }}
        />
      </div>

      {/* 5. 그 아래 '세운 설명' */}
      {fortuneData && (
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            marginTop: "100px",
            marginBottom: "30px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            padding: "clamp(12px, 4vw, 20px)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxSizing: "border-box",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          <h4
            style={{
              color: "#d4af37",
              fontSize: "clamp(18px, 5vw, 24px)",
              fontWeight: "bold",
              marginBottom: "8px",
              fontFamily: "Noto Serif KR",
              textAlign: "center",
            }}
          >
            {fortuneData.sewun.title}
          </h4>
          {fortuneData.sewun.year && (
            <div
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "12px",
                textAlign: "center",
                marginBottom: "16px",
                fontStyle: "italic",
              }}
            >
              {fortuneData.sewun.year}년 세운
            </div>
          )}
          <div
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "14px",
              lineHeight: "1.7",
            }}
          >
            {formatTextToJSX(fortuneData.sewun.content)}
          </div>
        </div>
      )}

      {/* 6. 그 아래 웹툰 퍼널 */}
      <div style={{ marginTop: "20px" }}>
        <WebtoonPanel
          key="section5-panel-3"
          sectionNumber={5}
          consultation={consultation}
          backgroundImage={panelConfigs[2].backgroundImage}
          imageStyle={panelConfigs[2].imageStyle}
          speechBubbles={panelConfigs[2].speechBubbles}
          panelStyle={{
            height: "500px",
            background: "transparent",
            border: "none",
            borderRadius: "0",
            marginBottom: "0",
          }}
        />
      </div>
    </div>
  );
}
