"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { getFiveElementDescription, getFiveElementBasicInfo } from "../../lib/five-elements-utils";

export default function FiveElementsChart({ consultation }) {
  const canvasRef = useRef(null);
  const [elementDescription, setElementDescription] = useState(null);
  const [loading, setLoading] = useState(false);

  // 오행 데이터 추출 (목 → 화 → 수 → 금 → 토 순서)
  const elements = useMemo(() => ({
    목: consultation?.woodCount || 0,
    화: consultation?.fireCount || 0,
    수: consultation?.waterCount || 0,
    금: consultation?.metalCount || 0,
    토: consultation?.earthCount || 0,
  }), [consultation]);

  // 오행 색상 정의
  const colors = useMemo(() => ({
    목: "#22c55e", // 녹색
    화: "#ef4444", // 빨강색
    토: "#eab308", // 노란색
    금: "#e5e7eb", // 은색
    수: "#3b82f6", // 파란색
  }), []);

  // 가장 강한 오행의 설명 데이터 로드
  useEffect(() => {
    if (consultation?.dominantElement) {
      setLoading(true);
      getFiveElementDescription(consultation.dominantElement)
        .then(data => {
          setElementDescription(data);
        })
        .catch(error => {
          console.error('Failed to load element description:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [consultation?.dominantElement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Canvas 초기화
    ctx.clearRect(0, 0, width, height);

    // 차트 설정
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / 5;
    const maxValue = Math.max(...Object.values(elements), 5); // 최소값 5로 설정

    // 배경 그리기
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.fillRect(0, 0, width, height);

    // 격자 그리기
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // 수평선
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y축 레이블
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "12px Pretendard";
      ctx.textAlign = "right";
      const value = Math.round(maxValue - (maxValue / 5) * i);
      ctx.fillText(value.toString(), padding - 10, y + 4);
    }

    // 막대 그래프 그리기
    Object.entries(elements).forEach(([element, value], index) => {
      const x = padding + barWidth * index + barWidth * 0.2;
      const barActualWidth = barWidth * 0.6;
      const barHeight = (value / maxValue) * chartHeight;
      const y = padding + chartHeight - barHeight;

      // 그림자 효과
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(x + 2, y + 2, barActualWidth, barHeight);

      // 막대 그리기 (그라데이션)
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      const color = colors[element];
      gradient.addColorStop(0, color + "cc");
      gradient.addColorStop(1, color + "66");
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barActualWidth, barHeight);

      // 막대 테두리
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barActualWidth, barHeight);

      // 오행 이름 레이블 (한자)
      const elementHanja = {
        '목': '木',
        '화': '火',
        '토': '土',
        '금': '金',
        '수': '水'
      };
      ctx.fillStyle = colors[element];
      ctx.font = "bold 16px Noto Serif KR";
      ctx.textAlign = "center";
      ctx.fillText(elementHanja[element] || element, x + barActualWidth / 2, height - padding + 25);

      // 값 표시
      if (value > 0) {
        ctx.fillStyle = "#d4af37";
        ctx.font = "bold 14px Pretendard";
        ctx.fillText(value.toString(), x + barActualWidth / 2, y - 10);
      }
    });

    // 차트 제목
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 20px Noto Serif KR";
    ctx.textAlign = "center";
    ctx.fillText("오행 분포도", width / 2, 30);
  }, [consultation, elements, colors]);

  return (
    <div
      style={{
        width: "100%",
        marginBottom: "30px",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid rgba(212, 175, 55, 0.2)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "600px",
          margin: "0 auto",
          display: "block",
        }}
      />

      {/* 오행 설명 */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "rgba(212, 175, 55, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(212, 175, 55, 0.1)",
        }}
      >
        <h4
          style={{
            color: "#d4af37",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          오행 해석
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          {Object.entries(elements).map(([element, count]) => {
            const total = Object.values(elements).reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage =
              total > 0 ? Math.round((count / total) * 100) : 0;
            const elementToHanja = {
              목: "木",
              화: "火",
              토: "土",
              금: "金",
              수: "水",
            };
            const isDominant =
              consultation?.dominantElement === elementToHanja[element];
            console.log(consultation?.dominantElement, element);
            return (
              <div
                key={element}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: isDominant ? "#131316" : "transparent",
                  border: isDominant
                    ? "2px solid #d4af37"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: isDominant
                    ? "0 0 12px rgba(212, 175, 55, 0.3)"
                    : "none",
                  transition: "all 0.3s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  position: "relative",
                  ...(isDominant && {
                    background:
                      "linear-gradient(135deg, #131316 0%, rgba(212, 175, 55, 0.1) 100%)",
                  }),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    ...(isDominant && {
                      padding: "4px 8px",

                      borderRadius: "4px",
                    }),
                  }}
                >
                  <span style={{ color: colors[element], fontSize: "14px" }}>
                    ●
                  </span>
                  <span
                    style={{
                      color: isDominant
                        ? "#d4af37"
                        : "rgba(255, 255, 255, 0.7)",
                      fontWeight: isDominant ? "600" : "normal",
                    }}
                  >
                    {element}(
                    {element === "목"
                      ? "木"
                      : element === "화"
                      ? "火"
                      : element === "토"
                      ? "土"
                      : element === "금"
                      ? "金"
                      : "水"}
                    ): {count}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: isDominant ? "#d4af37" : "rgba(255, 255, 255, 0.5)",
                    fontWeight: isDominant ? "600" : "normal",
                    ...(isDominant && {
                      padding: "4px 8px",

                      borderRadius: "4px",
                    }),
                  }}
                >
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 가장 강한 오행에 대한 상세 설명 */}
      {consultation?.dominantElement && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
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
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#d4af37",
              }}
            >

            </span>
            <h4
              style={{
                color: "#d4af37",
                fontSize: "18px",
                fontWeight: "700",
                margin: 0,
                fontFamily: "Noto Serif KR",
              }}
            >
              당신의 대표 오행: {getFiveElementBasicInfo(consultation.dominantElement)?.name}
            </h4>
          </div>

          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
              border: "1px solid rgba(212, 175, 55, 0.2)",
            }}
          >
            <p
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              <span style={{ color: "#d4af37", fontWeight: "600" }}>특성:</span>{" "}
              {getFiveElementBasicInfo(consultation.dominantElement)?.characteristic}
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                margin: "8px 0 0 0",
                lineHeight: "1.5",
              }}
            >
              <span style={{ color: "#d4af37", fontWeight: "600" }}>성향:</span>{" "}
              {getFiveElementBasicInfo(consultation.dominantElement)?.personality}
            </p>
          </div>

          {loading ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "14px",
              }}
            >
              상세 해석을 불러오는 중...
            </div>
          ) : elementDescription ? (
            <>
              <h5
                style={{
                  color: "#d4af37",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  fontFamily: "Noto Serif KR",
                }}
              >
                상세 운세 해석
              </h5>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  whiteSpace: "pre-line",
                }}
              >
                {elementDescription.chapters?.스토리형_리포트 || "상세 설명을 불러올 수 없습니다."}
              </div>
            </>
          ) : (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "14px",
              }}
            >
              상세 해석 정보를 불러올 수 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
