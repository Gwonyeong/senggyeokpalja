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
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "성격팔자에 찾아와줘서 정말 고맙네",
          position: { top: "5%", left: "30%" },
          size: "medium",
          direction: "bottom-right",
        },
        {
          text: "그대와의 긴 이야기가 끝났네. 이 지도가 그대의 항해에 등불이 되기를 바라네.",
          position: { top: "95%", right: "35%" },
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

      {/* 설문조사 유도 박스 */}

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
      <div
        style={{
          marginTop: "180px",
          marginBottom: "50px",
          padding: "30px",
          backgroundColor: "rgba(212, 175, 55, 0.08)",
          borderRadius: "16px",
          border: "2px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "0 6px 24px rgba(212, 175, 55, 0.15)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            marginBottom: "25px",
            fontSize: "16px",
            lineHeight: "1.7",
            color: "rgba(255, 255, 255, 0.9)",
            fontFamily: "Noto Serif KR",
          }}
        >
          마지막으로, 이 여정에 대한 그대의 소중한 생각을 들려준다면, 감사의
          의미로 나의 찻집에서 다음 여정에 사용할 수 있는{" "}
          <span
            style={{
              color: "#d4af37",
              fontWeight: "600",
            }}
          >
            &apos;특별 할인 쿠폰&apos;
          </span>
          을 선물로 주겠네.
        </div>

        <button
          style={{
            backgroundColor: "#3BBF3F",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "16px 32px",
            fontSize: "16px",
            fontWeight: "700",
            fontFamily: "Noto Serif KR",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 16px rgba(59, 191, 63, 0.3)",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#33a937";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(59, 191, 63, 0.4)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#3BBF3F";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 16px rgba(59, 191, 63, 0.3)";
          }}
          onClick={() => {
            // 설문조사 링크 또는 페이지로 이동
            window.open("https://smore.im/form/2RQBeyh8f3", "_blank");
          }}
        >
          🍃 토리와 특별 면담하기
        </button>
      </div>
    </div>
  );
}
