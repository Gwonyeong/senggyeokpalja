"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { getTenGodsFortune, getTenGodsBasicInfo } from "../../lib/ten-gods-utils";

export default function TenGodsChart({ consultation }) {
  const canvasRef = useRef(null);
  const [godDescription, setGodDescription] = useState(null);
  const [loading, setLoading] = useState(false);

  // 십성 데이터 추출 (JSON에서 추출)
  const tenGodsData = consultation?.tenGods || {};

  // 십성 개수 계산 (tenGods JSON에서 추출)
  const tenGods = {
    비견: tenGodsData?.비견 || 0,
    겁재: tenGodsData?.겁재 || 0,
    식신: tenGodsData?.식신 || 0,
    상관: tenGodsData?.상관 || 0,
    편재: tenGodsData?.편재 || 0,
    정재: tenGodsData?.정재 || 0,
    편관: tenGodsData?.편관 || 0,
    정관: tenGodsData?.정관 || 0,
    편인: tenGodsData?.편인 || 0,
    정인: tenGodsData?.정인 || 0,
  };

  // 십성 색상 정의
  const colors = {
    비견: "#ff6b6b", // 빨간색
    겁재: "#ff8787", // 연빨간색
    식신: "#4ecdc4", // 청록색
    상관: "#45b7d1", // 하늘색
    편재: "#f7dc6f", // 노란색
    정재: "#f4d03f", // 진노란색
    편관: "#bb8fce", // 보라색
    정관: "#a569bd", // 진보라색
    편인: "#85c1e2", // 연파란색
    정인: "#5dade2", // 파란색
  };

  // 십성 설명
  const godDescriptions = {
    비견: "자기 자신과 같은 기운, 형제·친구·동료",
    겁재: "자신을 도와주는 기운, 경쟁·협력",
    식신: "자신이 생산하는 기운, 재능·표현력",
    상관: "권위에 도전하는 기운, 창의성·비판",
    편재: "큰 재물의 기운, 사업·투자",
    정재: "안정적인 재물의 기운, 월급·저축",
    편관: "외부의 압력, 도전·시련",
    정관: "명예와 권위의 기운, 직위·책임",
    편인: "비정통적인 학문, 예술·철학",
    정인: "정통적인 학문, 교육·지혜",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Canvas 초기화
    ctx.clearRect(0, 0, width, height);

    // 원형 차트 그리기
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const radius = Math.min(width, height) / 3;

    // 배경
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.fillRect(0, 0, width, height);

    // 총합 계산
    const total = Object.values(tenGods).reduce((sum, val) => sum + val, 0);
    if (total === 0) return;

    // 차트 제목
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 20px Noto Serif KR";
    ctx.textAlign = "center";
    ctx.fillText("십성 분포도", centerX, 30);

    // 원형 차트 그리기
    let currentAngle = -Math.PI / 2; // 12시 방향에서 시작

    Object.entries(tenGods).forEach(([god, value]) => {
      if (value === 0) return;

      const sliceAngle = (value / total) * 2 * Math.PI;

      // 파이 조각 그리기
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();

      // 그라데이션 효과
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, colors[god] + "ff");
      gradient.addColorStop(1, colors[god] + "cc");
      ctx.fillStyle = gradient;
      ctx.fill();

      // 테두리
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 레이블 위치 계산
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      // 레이블 그리기
      if (value / total > 0.05) { // 5% 이상일 때만 레이블 표시
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Pretendard";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(god, labelX, labelY - 8);
        ctx.font = "10px Pretendard";
        ctx.fillText(`${Math.round(value / total * 100)}%`, labelX, labelY + 8);
      }

      currentAngle += sliceAngle;
    });

    // 중앙 원 (도넛 효과)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = "#0a0a0a";
    ctx.fill();
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 중앙 텍스트
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 14px Noto Serif KR";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("십성", centerX, centerY);
  }, [consultation, tenGods, colors]);

  // 가장 강한 십성 찾기
  const dominantGod = Object.entries(tenGods).reduce((max, [god, value]) =>
    value > (max.value || 0) ? { god, value } : max, {});

  // 가장 강한 십성의 총운 데이터 로드
  useEffect(() => {
    if (dominantGod.god && dominantGod.value > 0) {
      setLoading(true);
      getTenGodsFortune(dominantGod.god)
        .then(data => {
          setGodDescription(data);
        })
        .catch(error => {
          console.error('Failed to load ten gods fortune:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dominantGod.god, dominantGod.value]);

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

      {/* 십성 설명 */}
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
          십성 해석
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          {Object.entries(tenGods).map(([god, count]) => {
            const total = Object.values(tenGods).reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage =
              total > 0 ? Math.round((count / total) * 100) : 0;
            const isDominant = dominantGod.god === god && count > 0;

            return (
              <div
                key={god}
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
                  ...(isDominant && {
                    background:
                      "linear-gradient(135deg, #131316 0%, rgba(212, 175, 55, 0.1) 100%)",
                  }),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: colors[god], fontSize: "12px" }}>●</span>
                    <span
                      style={{
                        color: isDominant ? "#d4af37" : "rgba(255, 255, 255, 0.7)",
                        fontWeight: isDominant ? "600" : "normal",
                      }}
                    >
                      {god}: {count}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: isDominant ? "#d4af37" : "rgba(255, 255, 255, 0.5)",
                      fontWeight: isDominant ? "600" : "normal",
                    }}
                  >
                    {percentage}%
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255, 255, 255, 0.5)",
                    marginTop: "4px",
                  }}
                >
                  {godDescriptions[god]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 가장 강한 십성에 대한 상세 설명 */}
      {dominantGod.value > 0 && (
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
              ⭐
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
              당신의 대표 십성: {dominantGod.god}
            </h4>
          </div>

          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
              border: "1px solid rgba(212, 175, 55, 0.2)",
            }}
          >
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
                <span style={{ color: "#d4af37", fontWeight: "600" }}>의미:</span>{" "}
                {godDescriptions[dominantGod.god]}
              </p>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  margin: "8px 0 0 0",
                  lineHeight: "1.5",
                }}
              >
                <span style={{ color: "#d4af37", fontWeight: "600" }}>특성:</span>{" "}
                {getTenGodsBasicInfo(dominantGod.god)?.characteristic}
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
                {getTenGodsBasicInfo(dominantGod.god)?.personality}
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
                총운 해석을 불러오는 중...
              </div>
            ) : godDescription ? (
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
                  🔮 총운 해석
                </h5>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "14px",
                    lineHeight: "1.7",
                    whiteSpace: "pre-line",
                  }}
                >
                  {godDescription.categories?.overall || "총운 설명을 불러올 수 없습니다."}
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
        </div>
      )}
    </div>
  );
}