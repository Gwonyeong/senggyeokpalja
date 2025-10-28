"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  getFiveElementDescription,
  getFiveElementBasicInfo,
} from "../../lib/five-elements-utils";

export default function FiveElementsChart({ consultation }) {
  const canvasRef = useRef(null);
  const [elementDescription, setElementDescription] = useState(null);
  const [loading, setLoading] = useState(false);

  // 텍스트를 첫 문장과 나머지로 분리하는 함수
  const splitTextBySentence = (text) => {
    if (!text || typeof text !== 'string') return { firstSentence: '', restText: '' };

    // 마침표, 느낌표, 물음표를 기준으로 첫 문장 찾기
    const sentenceEnd = text.search(/[.!?。]/);

    if (sentenceEnd === -1) {
      // 문장 끝을 찾을 수 없으면 전체 텍스트를 첫 문장으로 처리
      return { firstSentence: text, restText: '' };
    }

    const firstSentence = text.substring(0, sentenceEnd + 1);
    const restText = text.substring(sentenceEnd + 1).trim();

    return { firstSentence, restText };
  };

  // 블러 처리가 필요한 섹션인지 확인하는 함수
  const isBlurSection = (text) => {
    // 블러 처리할 섹션 제목들 (첫 문장만 표시)
    const blurSections = ['[연애·대인]', '[재물운]', '[커리어]', '[성격]', '[건강]', '[가족]'];

    // 텍스트가 블러 처리 섹션으로 시작하는지 확인
    return blurSections.some(section => text.trim().startsWith(section));
  };

  // 전체 블러 처리가 필요한 섹션인지 확인하는 함수
  const isFullBlurSection = (text) => {
    // 전체 블러 처리할 섹션 제목 (모든 문장 블러)
    const fullBlurSections = ['[조언·성장가이드]'];

    // 텍스트가 전체 블러 처리 섹션으로 시작하는지 확인
    return fullBlurSections.some(section => text.trim().startsWith(section));
  };

  // 텍스트를 섹션별로 분리하고 블러 처리를 적용하는 함수
  const processTextWithSelectiveBlur = (fullText, isPaid) => {
    if (!fullText) return [];

    // 결제한 사용자는 전체 텍스트를 그대로 반환
    if (isPaid) {
      return colorizeElementText(fullText);
    }

    // 대괄호 섹션 패턴으로 텍스트 분리
    const sectionPattern = /(\[[^\]]+\])/g;
    const parts = fullText.split(sectionPattern);
    let processedParts = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // 대괄호로 둘러싸인 섹션 제목
      if (part.match(/^\[.*\]$/)) {
        // 이전에 내용이 있었다면 줄바꿈 추가
        if (processedParts.length > 0 && !processedParts[processedParts.length - 1].text?.endsWith('\n')) {
          processedParts.push({ text: '\n\n', isSpecial: false });
        }

        // 섹션 제목 추가
        const titleParts = colorizeElementText(part);
        processedParts.push(...titleParts);
        processedParts.push({ text: '\n', isSpecial: false });

        // 다음 파트가 있고 내용이 있는 경우
        if (i + 1 < parts.length && parts[i + 1].trim()) {
          const content = parts[i + 1].trim();
          const isBlurNeeded = isBlurSection(part);
          const isFullBlurNeeded = isFullBlurSection(part);

          if (isFullBlurNeeded) {
            // 전체 블러 처리가 필요한 섹션 (조언·성장가이드)
            processedParts.push({
              text: content,
              isSpecial: true,
              isBlurred: true
            });
          } else if (isBlurNeeded) {
            // 첫 문장만 정상, 나머지 블러 처리가 필요한 섹션
            const { firstSentence, restText } = splitTextBySentence(content);

            if (firstSentence) {
              const firstParts = colorizeElementText(firstSentence);
              processedParts.push(...firstParts);
            }

            if (restText) {
              // 블러 처리된 텍스트 앞에 공백 추가
              if (firstSentence) {
                processedParts.push({ text: ' ', isSpecial: false });
              }
              processedParts.push({
                text: restText,
                isSpecial: true,
                isBlurred: true
              });
            }
          } else {
            // 일반 섹션 (총운만 정상 출력)
            const normalParts = colorizeElementText(content);
            processedParts.push(...normalParts);
          }

          // 다음 파트 처리했으므로 인덱스 증가
          i++;
        }
      } else if (part.trim()) {
        // 섹션 제목이 없는 일반 텍스트 (보통 첫 부분)
        const normalParts = colorizeElementText(part);
        processedParts.push(...normalParts);
      }
    }

    return processedParts;
  };

  // 오행 데이터 추출 (목 → 화 → 수 → 금 → 토 순서)
  const elements = useMemo(
    () => ({
      목: consultation?.woodCount || 0,
      화: consultation?.fireCount || 0,
      수: consultation?.waterCount || 0,
      금: consultation?.metalCount || 0,
      토: consultation?.earthCount || 0,
    }),
    [consultation]
  );

  // 오행 색상 정의
  const colors = useMemo(
    () => ({
      목: "#22c55e", // 녹색
      화: "#ef4444", // 빨강색
      토: "#eab308", // 노란색
      금: "#e5e7eb", // 은색
      수: "#3b82f6", // 파란색
    }),
    []
  );

  // 오행 텍스트에 색상 적용하는 함수
  const colorizeElementText = (text) => {
    if (!text) return text;

    // 패턴 찾기 (오행과 소제목)
    const patterns = [
      // 대괄호 소제목 패턴
      { pattern: /\[[^\]]+\]/g, color: "#d4af37", isSubtitle: true },
      // 오행 패턴 (한자가 포함된 경우만)
      { pattern: /목\(木\)/g, color: colors.목, isElement: true },
      { pattern: /화\(火\)/g, color: colors.화, isElement: true },
      { pattern: /토\(土\)/g, color: colors.토, isElement: true },
      { pattern: /금\(金\)/g, color: colors.금, isElement: true },
      { pattern: /수\(水\)/g, color: colors.수, isElement: true },
      { pattern: /木/g, color: colors.목, isElement: true },
      { pattern: /火/g, color: colors.화, isElement: true },
      { pattern: /土/g, color: colors.토, isElement: true },
      { pattern: /金/g, color: colors.금, isElement: true },
      { pattern: /水/g, color: colors.수, isElement: true },
    ];

    let parts = [{ text, isSpecial: false }];

    patterns.forEach(({ pattern, color, isSubtitle, isElement }) => {
      parts = parts.flatMap(part => {
        if (part.isSpecial) return [part];

        const matches = [...part.text.matchAll(pattern)];
        if (matches.length === 0) return [part];

        const newParts = [];
        let lastIndex = 0;

        matches.forEach(match => {
          // 매치 전 텍스트
          if (match.index > lastIndex) {
            newParts.push({
              text: part.text.slice(lastIndex, match.index),
              isSpecial: false
            });
          }

          // 매치된 특수 텍스트 (소제목 또는 오행)
          newParts.push({
            text: match[0],
            isSpecial: true,
            isSubtitle: isSubtitle || false,
            isElement: isElement || false,
            color: color
          });

          lastIndex = match.index + match[0].length;
        });

        // 마지막 매치 후 텍스트
        if (lastIndex < part.text.length) {
          newParts.push({
            text: part.text.slice(lastIndex),
            isSpecial: false
          });
        }

        return newParts;
      });
    });

    return parts;
  };

  // 가장 강한 오행의 설명 데이터 로드
  useEffect(() => {
    if (consultation?.dominantElement) {
      setLoading(true);
      getFiveElementDescription(consultation.dominantElement)
        .then((data) => {
          setElementDescription(data);
        })
        .catch((error) => {
          console.error("Failed to load element description:", error);
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
        목: "木",
        화: "火",
        토: "土",
        금: "金",
        수: "水",
      };
      ctx.fillStyle = colors[element];
      ctx.font = "bold 16px Noto Serif KR";
      ctx.textAlign = "center";
      ctx.fillText(
        elementHanja[element] || element,
        x + barActualWidth / 2,
        height - padding + 25
      );

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
            ></span>
            <h4
              style={{
                color: "#d4af37",
                fontSize: "18px",
                fontWeight: "700",
                margin: 0,
                fontFamily: "Noto Serif KR",
              }}
            >
              당신의 대표 오행:{" "}
              {getFiveElementBasicInfo(consultation.dominantElement)?.name}
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
              {
                getFiveElementBasicInfo(consultation.dominantElement)
                  ?.characteristic
              }
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
              {
                getFiveElementBasicInfo(consultation.dominantElement)
                  ?.personality
              }
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
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "20px",
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
                {(() => {
                  const text = elementDescription.chapters?.스토리형_리포트 || "상세 설명을 불러올 수 없습니다.";
                  const isPaid = consultation?.isPaid;
                  const processedParts = processTextWithSelectiveBlur(text, isPaid);

                  return processedParts.map((part, index) => {
                    // 블러 처리된 부분
                    if (part.isBlurred) {
                      return (
                        <span
                          key={`blur-${index}`}
                          style={{
                            filter: 'blur(4px)',
                            WebkitFilter: 'blur(4px)',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          {part.text}
                        </span>
                      );
                    }

                    // 정상 출력 부분
                    return (
                      <span
                        key={index}
                        style={{
                          color: part.isSpecial ? part.color : "rgba(255, 255, 255, 0.8)",
                          fontWeight: part.isSpecial ? "600" : "normal",
                          fontSize: part.isSubtitle ? "16px" : "14px",
                          ...(part.isSubtitle && {
                            display: "inline-block",
                            marginTop: "12px",
                            marginBottom: "8px",
                          }),
                        }}
                      >
                        {part.text}
                      </span>
                    );
                  });
                })()}
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
