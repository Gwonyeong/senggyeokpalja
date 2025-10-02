"use client";

import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { formatTextToJSX } from "../../../../../lib/text-utils";
import { useState, useEffect } from "react";

export default function Section6Advice({ consultation }) {
  const [fortuneAdviceData, setFortuneAdviceData] = useState(null);

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

  // 조언 데이터 로드
  useEffect(() => {
    const loadAdviceData = async () => {
      if (!consultation) return;

      try {
        const dominantGod = getDominantTenGod(consultation);
        if (!dominantGod) {
          setFortuneAdviceData({
            직업운: "십성 데이터를 찾을 수 없습니다.",
            재물운: "십성 데이터를 찾을 수 없습니다.",
            연애운: "십성 데이터를 찾을 수 없습니다.",
            건강운: "십성 데이터를 찾을 수 없습니다.",
            가족운: "십성 데이터를 찾을 수 없습니다.",
          });
          return;
        }

        // 각 운세별 조언 데이터 로드
        // 파일명 매핑: 직업운->커리어, 나머지는 그대로
        const fileMapping = {
          직업운: "커리어",
          재물운: "재물운",
          연애운: "연애운",
          건강운: "건강운",
          가족운: "가족운",
        };

        const fortuneTypes = ["직업운", "재물운", "연애운", "건강운", "가족운"];
        const adviceData = {};

        for (const fortuneType of fortuneTypes) {
          try {
            const fileName = fileMapping[fortuneType];
            const response = await fetch(
              `/documents/십신/${dominantGod}/${dominantGod}_${fileName}_완성.json`
            );
            if (response.ok) {
              const data = await response.json();
              // categories 객체 내부의 적절한 키를 찾아서 내용 추출
              let content = "";
              if (fileName === "커리어" && data.categories?.career) {
                content = data.categories.career;
              } else if (fileName === "재물운" && data.categories?.wealth) {
                content = data.categories.wealth;
              } else if (fileName === "연애운" && data.categories?.love) {
                content = data.categories.love;
              } else if (fileName === "건강운" && data.categories?.health) {
                content = data.categories.health;
              } else if (fileName === "가족운" && data.categories?.family) {
                content = data.categories.family;
              } else {
                // fallback: categories 객체의 첫 번째 값 사용
                content =
                  Object.values(data.categories || {})[0] ||
                  data.content ||
                  `${fortuneType} 조언을 준비중입니다.`;
              }
              adviceData[fortuneType] = content;
            } else {
              adviceData[fortuneType] = `${fortuneType} 조언을 준비중입니다.`;
            }
          } catch (error) {
            console.error(`${fortuneType} 데이터 로드 실패:`, error);
            adviceData[fortuneType] = `${fortuneType} 조언을 준비중입니다.`;
          }
        }

        setFortuneAdviceData(adviceData);
      } catch (error) {
        console.error("조언 데이터 로드 실패:", error);
        setFortuneAdviceData({
          직업운: "데이터를 로드할 수 없습니다.",
          재물운: "데이터를 로드할 수 없습니다.",
          연애운: "데이터를 로드할 수 없습니다.",
          건강운: "데이터를 로드할 수 없습니다.",
          가족운: "데이터를 로드할 수 없습니다.",
        });
      }
    };

    loadAdviceData();
  }, [consultation]);

  // 웹툰 패널 설정
  const panelConfigs = [
    {
      backgroundImage: "/assets/images/results/6장/1.png",
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "이번장엔 그대의 올해 운을 알려주겠네.",
          position: { top: "10%", left: "30%" },
          size: "large",
          direction: "bottom-right",
        },
        {
          text: "직업,재물,연애,건강,가족,하나씩 분석해보겠네.",
          position: { top: "90%", right: "30%" },
          size: "large",
          direction: "bottom-right",
        },
      ],
    },
    {
      backgroundImage: "/assets/images/results/1장/1.png",
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "이제 이야기가 끝나가네. \n 다음장은 마지막으로 조언을 해주겠네.",
          position: { top: "10%", left: "30%" },
          size: "extraLarge",
          direction: "bottom-right",

          maxWidth: "400px",
        },
      ],
    },
  ];

  const fortuneBoxes = [
    {
      title: "직업운",
      color: "#d4af37",
      borderColor: "rgba(212, 175, 55, 0.3)",
      shadowColor: "rgba(212, 175, 55, 0.1)",
    },
    {
      title: "재물운",
      color: "#32CD32",
      borderColor: "rgba(50, 205, 50, 0.3)",
      shadowColor: "rgba(50, 205, 50, 0.1)",
    },
    {
      title: "연애운",
      color: "#FF69B4",
      borderColor: "rgba(255, 105, 180, 0.3)",
      shadowColor: "rgba(255, 105, 180, 0.1)",
    },
    {
      title: "건강운",
      color: "#FF6347",
      borderColor: "rgba(255, 99, 71, 0.3)",
      shadowColor: "rgba(255, 99, 71, 0.1)",
    },
    {
      title: "가족운",
      color: "#87CEEB",
      borderColor: "rgba(135, 206, 235, 0.3)",
      shadowColor: "rgba(135, 206, 235, 0.1)",
    },
  ];

  return (
    <div>
      {/* 1. 최상단 제목 */}
      <div className="card-header">
        <h3 className="card-title">6. 나의 세운과 종합 운세</h3>
      </div>

      {/* 2. 첫 번째 웹툰 패널 */}
      <div style={{ marginBottom: "120px", marginTop: "120px" }}>
        <WebtoonPanel
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

      {/* 3. 설명박스 여러개 (직업운, 재물운, 연애운, 건강운, 가족운) */}
      {fortuneAdviceData && (
        <div style={{ marginBottom: "60px", marginTop: "40px" }}>
          {fortuneBoxes.map((fortune) => (
            <div
              key={fortune.title}
              style={{
                marginBottom: "20px",
                padding: "clamp(16px, 4vw, 24px)",
                backgroundColor: "#131316",
                borderRadius: "12px",
                border: `2px solid ${fortune.borderColor}`,
                boxShadow: `0 4px 20px ${fortune.shadowColor}`,
                boxSizing: "border-box",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              <h5
                style={{
                  color: fortune.color,
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  fontFamily: "Noto Serif KR",
                  textAlign: "center",
                }}
              >
                {fortune.title}
              </h5>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  lineHeight: "1.7",
                }}
              >
                {formatTextToJSX(fortuneAdviceData[fortune.title])}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. 마지막 웹툰 패널 */}
      <div style={{ marginBottom: "20px", marginTop: "40px" }}>
        <WebtoonPanel
          backgroundImage={panelConfigs[1].backgroundImage}
          imageStyle={panelConfigs[1].imageStyle}
          speechBubbles={panelConfigs[1].speechBubbles}
          panelStyle={{
            minHeight: "600px",
            background: "transparent",
            border: "none",
            borderRadius: "0",
          }}
        />
      </div>
    </div>
  );
}
