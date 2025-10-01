"use client";

import { useEffect, useState } from "react";
import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { getTenGodsAdvice } from "../../../../../lib/ten-gods-utils";

export default function Section7Conclusion({ consultation }) {
  const [adviceData, setAdviceData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 십성 데이터 추출 (가장 강한 십성 찾기)
  const tenGodsData = consultation?.tenGods || {};
  const dominantGod = Object.entries(tenGodsData).reduce(
    (max, [god, value]) => (value > (max.value || 0) ? { god, value } : max),
    {}
  );

  // 가장 강한 십성의 조언 가이드 데이터 로드
  useEffect(() => {
    if (dominantGod.god && dominantGod.value > 0) {
      setLoading(true);
      getTenGodsAdvice(dominantGod.god)
        .then((data) => {
          setAdviceData(data);
        })
        .catch((error) => {
          console.error("Failed to load advice guide:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dominantGod.god, dominantGod.value]);

  // 웹툰 패널 설정
  const panelConfigs = {
    intro: {
      backgroundImage: "/assets/images/results/7장/1.png",
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "그대에게 해줄 수 있는 나의 조언들이라네.",
          position: { top: "95%" },
          size: "extraLarge",
          direction: "bottom-right",
          maxWidth: "350px",
        },
      ],
    },
    conclusion: {
      backgroundImage: "/assets/images/results/7장/2.png",
      imageStyle: {
        objectFit: "cover",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "성격팔자에 찾아와줘서 정말 고맙네",
          position: { top: "15%", left: "25%" },
          size: "large",
          direction: "bottom-right",
          backgroundColor: "#e2e3e5",
          borderColor: "#383d41",
          textColor: "#383d41",
          maxWidth: "400px",
        },
        {
          text: "그대와의 긴 이야기가 끝났네. 이 지도가 그대의 항해에 등불이 되기를 바라네.",
          position: { top: "85%", right: "25%" },
          size: "medium",
          direction: "bottom-right",
          maxWidth: "320px",
        },
      ],
    },
  };

  return (
    <div>
      {/* 최상단 제목 */}
      <div className="card-header">
        <h3 className="card-title">7. 종합 결론과 조언</h3>
      </div>

      {/* 첫 번째 웹툰 퍼널 */}
      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          backgroundImage={panelConfigs.intro.backgroundImage}
          imageStyle={panelConfigs.intro.imageStyle}
          speechBubbles={panelConfigs.intro.speechBubbles}
          panelStyle={{
            height: "600px",
            background: "transparent",
            border: "none",
            borderRadius: "0",
          }}
        />
      </div>

      {/* 십성 기반 조언 가이드 설명박스 */}
      {dominantGod.value > 0 && (
        <div
          style={{
            marginTop: "150px",
            marginBottom: "30px",
            padding: "25px",
            backgroundColor: "rgba(212, 175, 55, 0.05)",
            borderRadius: "12px",
            border: "2px solid rgba(212, 175, 55, 0.3)",
            boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <h4
              style={{
                color: "#d4af37",
                fontSize: "20px",
                fontWeight: "700",
                margin: 0,
                fontFamily: "Noto Serif KR",
                textAlign: "center",
              }}
            >
              조언
            </h4>
          </div>

          {loading ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "14px",
              }}
            >
              조언 가이드를 불러오는 중...
            </div>
          ) : adviceData ? (
            <div
              style={{
                padding: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderRadius: "10px",
                border: "1px solid rgba(212, 175, 55, 0.2)",
              }}
            >
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontSize: "15px",
                  lineHeight: "1.8",
                  whiteSpace: "pre-line",
                }}
              >
                {adviceData.categories?.advice ||
                  "조언 내용을 불러올 수 없습니다."}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "14px",
              }}
            >
              조언 정보를 불러올 수 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 두 번째 웹툰 퍼널 */}
      <div style={{ marginTop: "150px" }}>
        <WebtoonPanel
          backgroundImage={panelConfigs.conclusion.backgroundImage}
          imageStyle={panelConfigs.conclusion.imageStyle}
          speechBubbles={panelConfigs.conclusion.speechBubbles}
          panelStyle={{
            height: "500px",
            background: "transparent",
            border: "none",
            borderRadius: "0",
          }}
        />
      </div>
    </div>
  );
}
