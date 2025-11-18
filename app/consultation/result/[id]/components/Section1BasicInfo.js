import FiveElementsChart from "../../../../../components/consultation/FiveElementsChart";
import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import IntroWebtoonPanel from "../../../../../components/consultation/IntroWebtoonPanel";
import SajuChart from "../../../../../components/consultation/SajuChart";
import SpeechBubble from "../../../../../components/consultation/SpeechBubble";
import PromotionBubble from "../../../../../components/consultation/PromotionBubble";
import TossPaymentWidget from "../../../../../components/TossPaymentWidget";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";
import { useState, useEffect, useRef } from "react";
import { getFiveElementBasicInfo } from "../../../../../lib/five-elements-utils";
import Image from "next/image";

export default function Section1BasicInfo({ consultation }) {
  // 세운 데이터 상태
  const [sewunData, setSewunData] = useState(null);

  // TossPaymentWidget ref
  const paymentWidgetRef = useRef(null);

  // 가장 강한 십신 계산 (Section5와 동일한 로직)
  const getDominantTenGod = (consultation) => {
    if (!consultation?.tenGods) return null;

    const tenGodsData = consultation.tenGods;
    const dominantGod = Object.entries(tenGodsData).reduce(
      (max, [god, value]) => (value > (max.value || 0) ? { god, value } : max),
      {}
    );

    return dominantGod.value > 0 ? dominantGod.god : null;
  };

  // 세운 데이터 로드
  useEffect(() => {
    const loadSewunData = async () => {
      if (!consultation) return;

      try {
        const dominantGod = getDominantTenGod(consultation);
        if (!dominantGod) {
          setSewunData(null);
          return;
        }

        // 세운 데이터 로드 (Section5와 동일한 로직)
        const sewunResponse = await fetch(
          `/documents/대운-세운/${dominantGod}_세운전용_완성.json`
        );

        if (sewunResponse.ok) {
          const data = await sewunResponse.json();
          const sewunContent =
            data?.sewoon_only?.["2026"] || "세운 분석을 불러올 수 없습니다.";
          setSewunData({
            title: `세운 분석 (${dominantGod} 기준)`,
            content: sewunContent,
            year: "2026",
          });
        } else {
          setSewunData(null);
        }
      } catch (error) {
        console.error("세운 데이터 로드 실패:", error);
        setSewunData(null);
      }
    };

    loadSewunData();
  }, [consultation]);
  // 섹션 1에서 사용할 이미지 목록
  const imageList = [
    "/assets/images/results/1장/1.png",
    "/assets/images/results/2-1장/1.png",
    "/assets/images/results/2-1장/2.png",
    "/assets/images/results/2-1장/3.png",
    "/assets/images/results/2-1장/4.png",
    "/assets/images/results/2-1장/5.png",
    "/assets/images/results/2-1장/6.png",
    "/assets/images/results/2-1장/7.png",
    "/assets/images/results/2-1장/8.png",
  ];

  // 각 패널별 설정 (이미지, 말풍선, 이미지 스타일)
  const panelConfigs = [
    // {
    //   backgroundImage: imageList[0],
    //   imageStyle: {
    //     objectFit: "cover",
    //     objectPosition: "center top",
    //     width: "100%",
    //     height: "100%",
    //   },
    //   speechBubbles: [
    //     {
    //       text: "안녕하세요! 당신의 사주팔자를 분석해드리겠습니다.",
    //       position: { top: "20%", left: "30%" },
    //       size: "large",
    //       direction: "bottom-left",
    //       backgroundColor: "#fff3cd",
    //       borderColor: "#856404",
    //       textColor: "#856404",
    //       maxWidth: "350px",
    //     },
    //   ],
    // },
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
          text: "이번엔 오행을 분석할게요.",
          position: { top: "10%", left: "30%" },
          size: "medium",
          direction: "bottom-right",

          maxWidth: "320px",
        },
        {
          text: "당신의 ‘운명의 배’가 어떤 훌륭한 재료들로 만들어졌는지 아시나요?",
          position: { top: "90%", right: "30%" },
          size: "medium",
          direction: "bottom-right",

          maxWidth: "320px",
        },
      ],
    },
    {
      backgroundImage: imageList[2],
      imageStyle: {
        objectFit: "cover",
        objectPosition: "center center",
        width: "250px",
        height: "250px",
        borderRadius: "100%",
        border: "1px solid #FCA311",
        top: "50%",
        left: "30%",
        transform: "translate(-50%, -50%)",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "나무 목(木)",
          position: { top: "70%", left: "70%" },
          size: "medium",
          direction: "bottom-left",
          backgroundColor: "#d4edda",
          borderColor: "#155724",
          textColor: "#155724",
          maxWidth: "300px",
        },
      ],
    },
    {
      backgroundImage: imageList[3],
      imageStyle: {
        objectFit: "cover",
        objectPosition: "center center",
        width: "250px",
        height: "250px",
        borderRadius: "100%",
        border: "1px solid #FCA311",
        top: "50%",
        left: "70%",
        transform: "translate(-50%, -50%)",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "불 화(火)",
          position: { top: "35%", left: "30%" },
          size: "medium",
          direction: "top-left",
          backgroundColor: "#f8d7da",
          borderColor: "#721c24",
          textColor: "#721c24",
          maxWidth: "280px",
        },
      ],
    },
    {
      backgroundImage: imageList[4],
      imageStyle: {
        objectFit: "cover",
        objectPosition: "center center",
        width: "250px",
        height: "250px",
        borderRadius: "100%",
        border: "1px solid #FCA311",
        top: "50%",
        left: "30%",
        transform: "translate(-50%, -50%)",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "물 수(水)",
          position: { top: "70%", left: "70%" },
          size: "large",
          direction: "bottom-right",
          backgroundColor: "#cce7ff",
          borderColor: "#004085",
          textColor: "#004085",
          maxWidth: "330px",
        },
      ],
    },
    {
      backgroundImage: imageList[5],
      imageStyle: {
        objectFit: "cover",
        objectPosition: "center center",
        width: "250px",
        height: "250px",
        borderRadius: "100%",
        border: "1px solid #FCA311",
        top: "50%",
        left: "70%",
        transform: "translate(-50%, -50%)",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "쇠 금(金)",
          position: { top: "70%", left: "30%" },
          size: "large",
          direction: "bottom-right",
          backgroundColor: "#f8f9fa",
          borderColor: "#6c757d",
          textColor: "#495057",
          maxWidth: "330px",
        },
      ],
    },
    {
      backgroundImage: imageList[6],
      imageStyle: {
        objectFit: "cover",
        objectPosition: "center center",
        width: "250px",
        height: "250px",
        borderRadius: "100%",
        border: "1px solid #FCA311",
        top: "50%",
        left: "30%",
        transform: "translate(-50%, -50%)",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "흙 토(土)",
          position: { top: "70%", left: "70%" },
          size: "large",
          direction: "bottom-right",
          backgroundColor: "#fff3cd",
          borderColor: "#856404",
          textColor: "#856404",
          maxWidth: "330px",
        },
      ],
    },
    {
      backgroundImage: imageList[7],
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",

        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "세상의 모든 것은 다섯 가지 기운으로 이루어져 있어요.",
          position: { top: "20%", left: "35%" },
          size: "medium",
          direction: "bottom-right",
          maxWidth: "250px",
        },
        {
          text: "당신의 성격과 재능까지 선택한단 말이죠. 그럼 이제 그대의 오행 분석 할게요.",
          position: { top: "80%", right: "35%" },
          size: "medium",
          direction: "bottom-right",

          maxWidth: "300px",
        },
      ],
    },
  ];

  return (
    <div>
      <div className="card-header">
        <h3 className="card-title">1. 나의 사주팔자에 대하여</h3>
      </div>

      {/* 인트로 웹툰 패널 - 결제 상태와 무관하게 항상 표시 */}
      <div
        style={{
          marginBottom: "40px",
          width: "100%",
          position: "relative",
        }}
      >
        <img
          src="/assets/images/consultation/for_purchase/intro.jpg"
          alt="성격팔자 상담 인트로"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            // borderRadius: "12px",
          }}
        />
      </div>

      {/* 제목 아래 추가된 웹툰 퍼널과 사주 원국표 */}
      <IntroWebtoonPanel consultation={consultation} />
      <div style={{ marginBottom: "100px" }}>
        <SajuChart consultation={consultation} />
      </div>

      <div style={{ marginBottom: "20px" }}>
        {panelConfigs.map((config, index) => (
          <WebtoonPanel
            key={`section1-panel-${index}`}
            sectionNumber={1}
            consultation={consultation}
            {...generateSectionContent(consultation, 1, {
              backgroundImage: config.backgroundImage,
              imageStyle: config.imageStyle,
              speechBubbles: config.speechBubbles,
              characterImages: config.characterImages || [],
            })}
            panelStyle={{
              height:
                config.imageStyle?.width === "300px"
                  ? "300px"
                  : config.imageStyle?.height === "100%"
                  ? "600px"
                  : "300px",
              background: "transparent",
              border: "none",
              borderRadius: "0",
              marginBottom: index < panelConfigs.length - 1 ? "20px" : "0",
            }}
          />
        ))}
      </div>

      {/* 새로운 오행 분포 컴포넌트 */}
      <FiveElementsDistribution consultation={consultation} />

      {/* 결제 상태에 따른 조건부 렌더링 - 무료 사용자용 프로모션 콘텐츠 */}
      {!consultation?.isPaid && (
        <>
          {/* 오행 분포 후 추가 웹툰 패널 */}
          <div
            style={{
              marginTop: "40px",
              marginBottom: "40px",
              position: "relative",
            }}
          >
            <WebtoonPanel
              key="section1-after-elements-panel"
              sectionNumber={1}
              consultation={consultation}
              {...generateSectionContent(consultation, 1, {
                backgroundImage: "/assets/images/results/2-2장/2.png",
                imageStyle: {
                  objectFit: "contain",
                  objectPosition: "center center",
                  width: "100%",
                  height: "100%",
                  aspectRatio: "1 / 1",
                },
                speechBubbles: [
                  {
                    text:
                      "이외에도  " +
                      consultation.additionalData.name +
                      "님을 위한 많은 이야기들이 준비되어 있어요!",
                    position: { top: "15%", left: "35%" },
                    size: "middle",
                    direction: "bottom-right",
                    maxWidth: "260px",
                  },
                ],
              })}
              panelStyle={{
                height: "500px",
                background: "transparent",
                border: "none",
                borderRadius: "0",
                marginBottom: "0",
                position: "relative",
              }}
            />

            {/* 웹툰 패널 하단 그라데이션 오버레이 */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "250px", // 그라데이션 높이 증가
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.95) 80%, rgba(255,255,255,1) 100%)",
                pointerEvents: "none", // 클릭 이벤트 통과
                zIndex: 5,
              }}
            />

            {/* 오행 분포와 같은 배경색 오버레이 박스 */}
            <div
              style={{
                position: "absolute",
                bottom: "-480px", // 웹툰 패널에서 60px 위로 올림
                left: "50%",
                transform: "translateX(-50%)", // 간단히 중앙 정렬만
                width: "90%",
                maxWidth: "600px",
                padding: "30px",
                backgroundColor: "#F2F1EE", // 새로운 배경색
                borderRadius: "12px",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(212, 175, 55, 0.1)",
                zIndex: 10,
              }}
            >
              {/* 상세운세해석 이미지 */}
              <div
                style={{
                  width: "100%",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/assets/images/results/1장/상세운세해석.jpg"
                  alt="상세운세해석"
                  style={{
                    width: "auto",
                    maxWidth: "100%",
                    height: "30px",
                    maxHeight: "40px",
                    objectFit: "contain",
                  }}
                />
              </div>

              <h4
                style={{
                  color: "#2d2d30",
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  textAlign: "center",
                  fontFamily: "Noto Serif KR",
                }}
              >
                {sewunData
                  ? `${sewunData.title}`
                  : "더 많은 이야기가 기다리고 있어요"}
              </h4>

              {sewunData ? (
                <>
                  {sewunData.year && (
                    <div
                      style={{
                        color: "#888",
                        fontSize: "12px",
                        textAlign: "center",
                        marginBottom: "16px",
                        fontStyle: "italic",
                      }}
                    >
                      {sewunData.year}년 세운
                    </div>
                  )}
                  <div
                    style={{
                      color: "#2d2d30",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      whiteSpace: "pre-line",
                      textAlign: "left",
                    }}
                  >
                    {(() => {
                      // 텍스트를 문단 단위로 분리
                      const paragraphs = sewunData.content
                        .split("\n\n")
                        .filter((p) => p.trim());

                      if (paragraphs.length >= 2) {
                        // 처음 2개 문단은 완전히 표시
                        const visibleParagraphs = paragraphs.slice(0, 2);
                        const hiddenParagraphs = paragraphs.slice(2);

                        return (
                          <>
                            <span>{visibleParagraphs.join("\n\n")}</span>
                            {hiddenParagraphs.length > 0 && (
                              <span
                                style={{
                                  filter: "blur(4px)",
                                  WebkitFilter: "blur(4px)",
                                  userSelect: "none",
                                  pointerEvents: "none",
                                  color: "rgba(45, 45, 48, 0.5)",
                                }}
                              >
                                {"\n\n" + hiddenParagraphs.join("\n\n")}
                              </span>
                            )}
                          </>
                        );
                      } else {
                        // 문단이 2개 미만인 경우 전체 텍스트의 40%만 표시
                        const textLength = sewunData.content.length;
                        const showLength = Math.floor(textLength * 0.4);
                        const visibleText = sewunData.content.substring(
                          0,
                          showLength
                        );
                        const blurredText = sewunData.content.substring(showLength);

                        return (
                          <>
                            <span>{visibleText}</span>
                            <span
                              style={{
                                filter: "blur(4px)",
                                WebkitFilter: "blur(4px)",
                                userSelect: "none",
                                pointerEvents: "none",
                                color: "rgba(45, 45, 48, 0.5)",
                              }}
                            >
                              {blurredText}
                            </span>
                          </>
                        );
                      }
                    })()}
                  </div>
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      backgroundColor: "rgba(212, 175, 55, 0.1)",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#d4af37",
                        fontSize: "13px",
                        margin: 0,
                        fontWeight: "600",
                      }}
                    >
                      전체 세운 분석과 대운, 성격 분석 등을 보시려면 결제가
                      필요합니다
                    </p>
                  </div>
                </>
              ) : (
                <p
                  style={{
                    color: "#5a5a5a",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  {consultation.additionalData?.name || "고객"}님의 십신 분석, 성격
                  해석, 운세 전망 등 7개 챕터의 상세한 분석이 준비되어 있습니다.
                </p>
              )}

              {/* 박스 하단 말풍선 */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  right: "30%",
                  zIndex: 15,
                  pointerEvents: "none",
                }}
              >
                {/* 말풍선 위에 표시될 이미지 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-70px", // 원래 위치로 복원
                    left: "-80px",
                    width: "50px",
                    height: "50px",
                    zIndex: 70, // SpeechBubble의 zIndex(60)보다 높게 설정
                  }}
                >
                  <img
                    src="/assets/images/results/1장/tory_face.png" // 토리 캐릭터 이미지 (경로는 실제 이미지에 맞게 조정)
                    alt="토리 캐릭터"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",

                      border: "2px solid #856404",
                    }}
                  />
                </div>

                <SpeechBubble
                  text={"앗! 여기부터는 복채가 필요해요"}
                  position={{ top: "0%", left: "0%" }}
                  size="large"
                  direction="top-left"
                  backgroundColor="#ffffff"
                  borderColor="#000000"
                  textColor="#000000"
                  maxWidth="600px"
                  customStyle={{
                    minWidth: "200px",
                    height: "auto",
                    aspectRatio: "auto", // 기본 비율 무시
                    padding: "16px 24px",
                    fontWeight: "700", // 전체 텍스트를 볼드로
                  }}
                />
              </div>
            </div>

            {/* 말풍선 영역을 위한 추가 공간 */}
            <div style={{ height: "60px" }}></div>
          </div>

          {/* 프로모션 이미지 */}
          <div
            style={{
              marginTop: "840px",
              textAlign: "center",
            }}
          >
            <PromotionBubble
              consultationId={consultation?.id}
              isPaid={consultation?.isPaid}
              userName={consultation?.additionalData?.name}
            />
          </div>
        </>
      )}

      {/* 결제 상태에 따른 조건부 렌더링 */}
      {consultation?.isPaid ? (
        <>
          {/* MBTI와 오행 결합 분석 섹션 */}
          {consultation?.dominantElement &&
            consultation?.additionalData?.mbti && (
              <MBTIWithFiveElementsSection
                mbti={consultation.additionalData.mbti}
                dominantElement={consultation.dominantElement}
                isPaid={consultation?.isPaid}
              />
            )}

          {/* 오행 해석 후 추가 웹툰 패널 */}
          <div style={{ marginTop: "120px", marginBottom: "120px" }}>
            <WebtoonPanel
              key="section1-final-panel"
              sectionNumber={1}
              consultation={consultation}
              {...generateSectionContent(consultation, 1, {
                backgroundImage: "/assets/images/results/2-1장/8.png",
                imageStyle: {
                  objectFit: "cover",
                  objectPosition: "center center",
                  width: "100%",
                  height: "100%",
                  aspectRatio: "1 / 1",
                },
                speechBubbles: [
                  {
                    text: "이제 그대의 오행이 어떤 의미를 갖는지 알았겠지?",
                    position: { top: "10%", left: "30%" },
                    size: "medium",
                    direction: "bottom-right",
                    maxWidth: "300px",
                  },
                  {
                    text: "다음장은 십성에 대하여 알려주겠네.",
                    position: { top: "90%", right: "30%" },
                    size: "medium",
                    direction: "bottom-right",
                    maxWidth: "300px",
                  },
                ],
              })}
              panelStyle={{
                height: "500px",
                background: "transparent",
                border: "none",
                borderRadius: "0",
                marginBottom: "0",
              }}
            />
          </div>
        </>
      ) : (
        /* 무료 사용자용 프로모션 이미지 */
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <Image
              src="/assets/images/promotion.png"
              alt="프로모션 이미지"
              width={600}
              height={400}
              style={{
                width: "100%",
                height: "auto",
              }}
              priority
            />

            {/* 프로모션 이미지 위 구매 버튼 오버레이 */}
            <div
              style={{
                position: "absolute",
                bottom: "45%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                width: "85%",
                // maxWidth: "350px",
              }}
            >
              <button
                onClick={() => {
                  // TossPaymentWidget 열기
                  if (paymentWidgetRef.current) {
                    paymentWidgetRef.current.openPayment();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "2.8% 32px",
                  backgroundColor: "rgb(74, 144, 226)",
                  color: "#FFFFFF",
                  fontSize: "18px",
                  fontWeight: "700",
                  border: "none",
                  borderRadius: "50px",
                  cursor: "pointer",

                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span>지금 구매하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TossPaymentWidget 추가 */}
      {!consultation?.isPaid && (
        <TossPaymentWidget
          ref={paymentWidgetRef}
          consultationId={consultation?.id}
          amount={9900}
          orderName="성격팔자 상세리포트"
          onPaymentSuccess={() => {
            // 결제 성공 시 페이지 새로고침
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// 새로운 오행 분포 컴포넌트
const FiveElementsDistribution = ({ consultation }) => {
  // 오행 데이터 추출
  const elements = {
    木: consultation?.woodCount || 0,
    火: consultation?.fireCount || 0,
    土: consultation?.earthCount || 0,
    金: consultation?.metalCount || 0,
    水: consultation?.waterCount || 0,
  };

  // 오행별 색상 정의
  const elementColors = {
    木: "#22c55e",
    火: "#ef4444",
    土: "#eab308",
    金: "#94a3b8",
    水: "#3b82f6",
  };

  // 오행별 한글 이름
  const elementKoreanNames = {
    木: "목",
    火: "화",
    土: "토",
    金: "금",
    水: "수",
  };

  // 총합 계산
  const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
  const percentages = {};
  Object.entries(elements).forEach(([key, value]) => {
    percentages[key] = total > 0 ? Math.round((value / total) * 100) : 0;
  });

  // 원형 배치를 위한 좌표 계산
  const centerX = 200;
  const centerY = 200;
  const radius = 150;

  // 오행 위치 (원형 배치 - 목을 상단에서 시작)
  const elementPositions = {
    木: { angle: -90, x: centerX, y: centerY - radius }, // 상단
    火: {
      angle: -18,
      x: centerX + radius * Math.cos((-18 * Math.PI) / 180),
      y: centerY + radius * Math.sin((-18 * Math.PI) / 180),
    }, // 우상단
    土: {
      angle: 54,
      x: centerX + radius * Math.cos((54 * Math.PI) / 180),
      y: centerY + radius * Math.sin((54 * Math.PI) / 180),
    }, // 우하단
    金: {
      angle: 126,
      x: centerX + radius * Math.cos((126 * Math.PI) / 180),
      y: centerY + radius * Math.sin((126 * Math.PI) / 180),
    }, // 좌하단
    水: {
      angle: 198,
      x: centerX + radius * Math.cos((198 * Math.PI) / 180),
      y: centerY + radius * Math.sin((198 * Math.PI) / 180),
    }, // 좌상단
  };

  return (
    <div
      style={{
        width: "100%",
        marginBottom: "30px",
        backgroundColor: "#f8f8f6",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h4
        style={{
          color: "#2d2d30",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "center",
          fontFamily: "Noto Serif KR",
        }}
      >
        당신의 오행 분포
      </h4>

      {/* 오행 다이어그램 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          style={{ maxWidth: "100%", height: "auto" }}
        >
          {/* 상생 관계 (실선 화살표) */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="4"
              markerHeight="3"
              refX="3.5"
              refY="1.5"
              orient="auto"
            >
              <polygon points="0 0, 4 1.5, 0 3" fill="#888" />
            </marker>
            <marker
              id="arrowhead-red"
              markerWidth="4"
              markerHeight="3"
              refX="3.5"
              refY="1.5"
              orient="auto"
            >
              <polygon points="0 0, 4 1.5, 0 3" fill="#ef4444" />
            </marker>
          </defs>

          {/* 상생 관계 (실선 화살표 - 직선 연결) - 木→火→土→金→水→木 */}
          <g
            stroke="#888"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrowhead)"
          >
            {/* 木 → 火 */}
            <path
              d={`M ${elementPositions.木.x + 55} ${
                elementPositions.木.y + 0
              } Q ${elementPositions.木.x + 90} ${elementPositions.木.y + 10} ${
                elementPositions.火.x - 15
              } ${elementPositions.火.y - 45}`}
            />
            {/* 火 → 土 */}
            <path
              d={`M ${elementPositions.火.x + 5} ${
                elementPositions.火.y + 70
              } Q ${elementPositions.火.x + 0} ${elementPositions.火.y + 100} ${
                elementPositions.土.x + 30
              } ${elementPositions.土.y - 30}`}
            />
            {/* 土 → 金 */}
            <path
              d={`M ${elementPositions.土.x - 45} ${
                elementPositions.土.y + 20
              } Q ${elementPositions.土.x - 90} ${elementPositions.土.y + 40} ${
                elementPositions.金.x + 45
              } ${elementPositions.金.y + 15}`}
            />
            {/* 金 → 水 */}
            <path
              d={`M ${elementPositions.金.x - 35} ${
                elementPositions.金.y - 30
              } Q ${elementPositions.金.x - 60} ${elementPositions.金.y - 60} ${
                elementPositions.水.x - 5
              } ${elementPositions.水.y + 70}`}
            />
            {/* 水 → 木 */}
            <path
              d={`M ${elementPositions.水.x + 15} ${
                elementPositions.水.y - 45
              } Q ${elementPositions.水.x + 40} ${elementPositions.水.y - 80} ${
                elementPositions.木.x - 55
              } ${elementPositions.木.y + 0}`}
            />
          </g>

          {/* 상극 관계 (점선 빨간색 - 별 모양) */}
          <g
            stroke="#ef4444"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.7"
          >
            <line
              x1={elementPositions.木.x}
              y1={elementPositions.木.y}
              x2={elementPositions.土.x}
              y2={elementPositions.土.y}
            />
            <line
              x1={elementPositions.火.x}
              y1={elementPositions.火.y}
              x2={elementPositions.金.x}
              y2={elementPositions.金.y}
            />
            <line
              x1={elementPositions.土.x}
              y1={elementPositions.土.y}
              x2={elementPositions.水.x}
              y2={elementPositions.水.y}
            />
            <line
              x1={elementPositions.金.x}
              y1={elementPositions.金.y}
              x2={elementPositions.木.x}
              y2={elementPositions.木.y}
            />
            <line
              x1={elementPositions.水.x}
              y1={elementPositions.水.y}
              x2={elementPositions.火.x}
              y2={elementPositions.火.y}
            />
          </g>

          {/* 오행 원형 요소 */}
          {Object.entries(elementPositions).map(([element, pos]) => (
            <g key={element}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="35"
                fill={elementColors[element]}
                stroke={elementColors[element]}
                strokeWidth="2"
                opacity="0.3"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                fontWeight="bold"
                fill={elementColors[element]}
                fontFamily="Noto Serif KR"
              >
                {element}
              </text>
              <text
                x={pos.x}
                y={pos.y + 55}
                textAnchor="middle"
                fontSize="12"
                fill={elementColors[element]}
                fontWeight="600"
              >
                {elements[element]}개
              </text>
            </g>
          ))}

          {/* 범례 - 그래프 상단으로 이동, 줄바꿈으로 분리 */}
          <g transform="translate(20, 20)">
            {/* 상생 설명 (첫 번째 줄) */}
            <line x1="0" y1="0" x2="30" y2="0" stroke="#888" strokeWidth="2" />
            <text x="35" y="5" fontSize="12" fill="#888">
              상생
            </text>
            {/* 상극 설명 (두 번째 줄) */}
            <line
              x1="0"
              y1="18"
              x2="30"
              y2="18"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="5,5"
            />
            <text x="35" y="23" fontSize="12" fill="#ef4444">
              상극
            </text>
          </g>
        </svg>
      </div>

      {/* 대표 오행 표시 */}
      {consultation?.dominantElement && (
        <div style={{ marginBottom: "30px" }}>
          <h5
            style={{
              fontSize: "18px",
              fontWeight: "700",
              marginBottom: "15px",
              textAlign: "left",
              fontFamily: "Noto Serif KR",
            }}
          >
            <span style={{ color: "#000000" }}>
              {consultation.user?.displayName ||
                consultation.additionalData?.name ||
                "사용자"}
              님의 대표오행:{" "}
            </span>
            <span
              style={{
                color: elementColors[consultation.dominantElement] || "#d4af37",
              }}
            >
              {elementKoreanNames[consultation.dominantElement]}
              {consultation.dominantElement}
            </span>
          </h5>
          <div style={{ textAlign: "left", color: "#2d2d30" }}>
            <p style={{ marginBottom: "8px" }}>
              <span style={{ color: "#d4af37", fontWeight: "600" }}>특성:</span>{" "}
              {
                getFiveElementBasicInfo(consultation.dominantElement)
                  ?.characteristic
              }
            </p>
            <p>
              <span style={{ color: "#d4af37", fontWeight: "600" }}>성향:</span>{" "}
              {
                getFiveElementBasicInfo(consultation.dominantElement)
                  ?.personality
              }
            </p>
          </div>
        </div>
      )}

      {/* 오행 분포 막대 차트 */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "rgba(212, 175, 55, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(212, 175, 55, 0.1)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {["木", "火", "水", "金", "土"].map((element) => {
            const isDominant = consultation?.dominantElement === element;
            const percentage = percentages[element];
            const elementName = elementKoreanNames[element];
            const isHighlighted = isDominant;

            return (
              <div key={element} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      color: elementColors[element],
                      fontWeight: isDominant ? "600" : "normal",
                      fontSize: "14px",
                    }}
                  >
                    {elementName} {element}
                  </span>
                  <span
                    style={{
                      color: elementColors[element],
                      fontWeight: isDominant ? "600" : "normal",
                      fontSize: "14px",
                    }}
                  >
                    {percentage}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: isHighlighted ? "35px" : "25px",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    borderRadius: isHighlighted ? "20px" : "12px",
                    overflow: "hidden",
                    border: isHighlighted
                      ? `2px solid ${elementColors[element]}`
                      : "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: isHighlighted
                      ? `0 0 15px ${elementColors[element]}40`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      backgroundColor: elementColors[element],
                      opacity: isHighlighted ? 1 : 0.8,
                      transition: "width 0.5s ease",
                      background: isHighlighted
                        ? `linear-gradient(90deg, ${elementColors[element]} 0%, ${elementColors[element]}dd 100%)`
                        : elementColors[element],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 상세 운세 해석 박스 */}
      <DetailedFortuneInterpretation consultation={consultation} />
    </div>
  );
};

// MBTI 타입을 그룹으로 매핑하는 함수
const getMBTIGroup = (mbti) => {
  if (!mbti || mbti.length < 4) return null;

  // MBTI의 두 번째와 세 번째 글자로 그룹 결정
  const secondChar = mbti[1]; // S 또는 N
  const thirdChar = mbti[2]; // T 또는 F

  if (secondChar === "S" && thirdChar === "T") return "ST";
  if (secondChar === "S" && thirdChar === "F") return "SF";
  if (secondChar === "N" && thirdChar === "T") return "NT";
  if (secondChar === "N" && thirdChar === "F") return "NF";

  return null;
};

// MBTI와 오행 결합 분석 컴포넌트
const MBTIWithFiveElementsSection = ({ mbti, dominantElement, isPaid }) => {
  const [mbtiData, setMbtiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMBTIData = async () => {
      try {
        const mbtiGroup = getMBTIGroup(mbti);
        if (!mbtiGroup) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/documents/mbti/${mbtiGroup}.json`);
        if (response.ok) {
          const data = await response.json();
          setMbtiData(data);
        }
      } catch (error) {
        console.error("MBTI 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMBTIData();
  }, [mbti]);

  if (loading) {
    return (
      <div
        style={{
          marginTop: "24px",
          padding: "20px",
          backgroundColor: "rgba(212, 175, 55, 0.05)",
          borderRadius: "12px",
          border: "2px solid rgba(212, 175, 55, 0.3)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>
          MBTI와 오행 분석을 불러오는 중...
        </div>
      </div>
    );
  }

  if (!mbtiData) {
    return null;
  }

  const mbtiGroup = getMBTIGroup(mbti);

  // 한자 오행을 한글로 변환하는 매핑
  const elementMapping = {
    金: "금",
    木: "목",
    水: "수",
    火: "화",
    土: "토",
  };

  // 대표 오행에 따른 키 매핑 (JSON 파일의 키와 일치하도록)
  const elementKey = elementMapping[dominantElement] || null;

  const analysisText = elementKey ? mbtiData[elementKey] : null;

  console.log("MBTI 분석 디버그:", {
    mbti,
    mbtiGroup,
    dominantElement: `${dominantElement} (한자)`,
    elementKey: `${elementKey} (한글)`,
    hasAnalysisText: !!analysisText,
    mbtiDataKeys: Object.keys(mbtiData || {}),
    analysisTextPreview: analysisText
      ? analysisText.substring(0, 100) + "..."
      : "null",
  });

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        backgroundColor: "#f8f8f6",
        borderRadius: "12px",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
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
            color: "#6a5acd",
          }}
        >
          🧬
        </span>
        <h4
          style={{
            color: "#6a5acd",
            fontSize: "18px",
            fontWeight: "700",
            margin: 0,
            fontFamily: "Noto Serif KR",
          }}
        >
          {mbti} × {getFiveElementBasicInfo(dominantElement)?.name} 시너지 분석
        </h4>
      </div>

      <div
        style={{
          marginBottom: "16px",
          padding: "12px 16px",
          backgroundColor: "rgba(212, 175, 55, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(212, 175, 55, 0.1)",
        }}
      >
        <p
          style={{
            color: "#000000",
            fontSize: "14px",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          <span style={{ color: "#6a5acd", fontWeight: "600" }}>성격유형:</span>{" "}
          {mbti} ({mbtiGroup} 그룹)
        </p>
        <p
          style={{
            color: "#000000",
            fontSize: "14px",
            margin: "8px 0 0 0",
            lineHeight: "1.5",
          }}
        >
          <span style={{ color: "#6a5acd", fontWeight: "600" }}>
            대표 오행:
          </span>{" "}
          {getFiveElementBasicInfo(dominantElement)?.name}
        </p>
        {mbtiData.point && (
          <div
            style={{
              color: "#000000",
              fontSize: "14px",
              margin: "8px 0 0 0",
              lineHeight: "1.6",
            }}
          >
            <span style={{ color: "#6a5acd", fontWeight: "600" }}>
              {mbtiGroup} 특성:
            </span>
            <div style={{ marginTop: "4px", paddingLeft: "8px" }}>
              {mbtiData.point.map((point, index) => (
                <div key={index} style={{ marginBottom: "2px" }}>
                  • {point}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <h5
        style={{
          color: "#6a5acd",
          fontSize: "16px",
          fontWeight: "700",
          marginBottom: "12px",
          fontFamily: "Noto Serif KR",
        }}
      >
        🌟 맞춤형 인생 가이드
      </h5>

      {analysisText ? (
        <div
          style={{
            color: "#000000",
            fontSize: "14px",
            lineHeight: "1.7",
            whiteSpace: "pre-line",
          }}
        >
          {(() => {
            if (!isPaid) {
              // 무료 사용자를 위한 일부 블러 처리
              const textLength = analysisText.length;
              const showLength = Math.floor(textLength * 0.4); // 40%만 보여줌
              const visibleText = analysisText.substring(0, showLength);
              const blurredText = analysisText.substring(showLength);

              return (
                <>
                  <span>{visibleText}</span>
                  <span
                    style={{
                      filter: "blur(4px)",
                      WebkitFilter: "blur(4px)",
                      userSelect: "none",
                      pointerEvents: "none",
                      color: "rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {blurredText}
                  </span>
                </>
              );
            }
            return analysisText;
          })()}
        </div>
      ) : (
        <div
          style={{
            color: "rgba(0, 0, 0, 0.6)",
            fontSize: "14px",
            fontStyle: "italic",
            padding: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
          }}
        >
          디버그: analysisText가 없습니다.
          <br />
          대표 오행: {dominantElement} (한자) → {elementKey} (한글 키)
          <br />
          mbtiData 키들: {Object.keys(mbtiData || {}).join(", ")}
        </div>
      )}

      {!isPaid && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "rgba(212, 175, 55, 0.1)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#d4af37",
              fontSize: "13px",
              margin: 0,
              fontWeight: "600",
            }}
          >
            💎 전체 MBTI×오행 맞춤 분석을 보시려면 결제가 필요합니다
          </p>
        </div>
      )}
    </div>
  );
};

// 상세 운세 해석 컴포넌트
const DetailedFortuneInterpretation = ({ consultation }) => {
  const [fortuneData, setFortuneData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 오행별 색상 정의
  const elementColors = {
    木: "#22c55e",
    火: "#ef4444",
    土: "#eab308",
    金: "#94a3b8",
    水: "#3b82f6",
  };

  useEffect(() => {
    const loadFortuneData = async () => {
      try {
        if (!consultation?.dominantElement) {
          setLoading(false);
          return;
        }

        // 한자 오행을 한글로 변환하는 매핑
        const elementMapping = {
          金: "금",
          木: "목",
          水: "수",
          火: "화",
          土: "토",
        };

        const elementKey = elementMapping[consultation.dominantElement];
        if (!elementKey) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/documents/오행/${elementKey}_description.json`
        );
        if (response.ok) {
          const data = await response.json();
          setFortuneData(data);
        }
      } catch (error) {
        console.error("상세 운세 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFortuneData();
  }, [consultation?.dominantElement]);

  if (loading) {
    return (
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f8f8f6",
          borderRadius: "12px",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ color: "rgba(45, 45, 48, 0.6)", fontSize: "14px" }}>
          상세 운세 해석을 불러오는 중...
        </div>
      </div>
    );
  }

  if (!fortuneData || !consultation?.dominantElement) {
    return null;
  }

  const fortuneContent = fortuneData.chapters?.["스토리형_리포트"];

  if (!fortuneContent) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        backgroundColor: "#f8f8f6",
        borderRadius: "12px",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h4
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "left",
          fontFamily: "Noto Serif KR",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ color: "#2d2d30" }}>상세 운세 해석</span>
        <span
          style={{
            color: elementColors[consultation.dominantElement] || "#d4af37",
            fontSize: "18px",
          }}
        >
          ({consultation.dominantElement})
        </span>
      </h4>

      <div
        style={{
          color: "#2d2d30",
          fontSize: "15px",
          lineHeight: "1.8",
          whiteSpace: "pre-line",
          fontFamily: "Pretendard",
        }}
      >
        {(() => {
          const formatTextWithHeaders = (text) => {
            // [소제목] 형태를 찾아서 스타일 적용
            const parts = text.split(/(\[[^\]]+\])/g);

            return parts.map((part, index) => {
              // [소제목] 형태인지 확인
              if (part.match(/^\[[^\]]+\]$/)) {
                return (
                  <span
                    key={index}
                    style={{
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#d4af37",
                      display: "block",
                      marginTop: index > 0 ? "20px" : "0px",
                      marginBottom: "8px",
                      fontFamily: "Noto Serif KR",
                    }}
                  >
                    {part}
                  </span>
                );
              }
              // 일반 텍스트
              return <span key={index}>{part}</span>;
            });
          };

          if (!consultation?.isPaid) {
            // 무료 사용자를 위한 일부 블러 처리
            const textLength = fortuneContent.length;
            const showLength = Math.floor(textLength * 0.3); // 30%만 보여줌
            const visibleText = fortuneContent.substring(0, showLength);
            const blurredText = fortuneContent.substring(showLength);

            return (
              <>
                {formatTextWithHeaders(visibleText)}
                <span
                  style={{
                    filter: "blur(4px)",
                    WebkitFilter: "blur(4px)",
                    userSelect: "none",
                    pointerEvents: "none",
                    color: "rgba(45, 45, 48, 0.5)",
                  }}
                >
                  {blurredText}
                </span>
              </>
            );
          }
          return formatTextWithHeaders(fortuneContent);
        })()}
      </div>

      {!consultation?.isPaid && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "rgba(212, 175, 55, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#d4af37",
              fontSize: "14px",
              margin: 0,
              fontWeight: "600",
            }}
          >
            결제후 모든 내용을 볼 수 있어요!
          </p>
        </div>
      )}
    </div>
  );
};
