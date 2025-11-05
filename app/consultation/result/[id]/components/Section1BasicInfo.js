import FiveElementsChart from "../../../../../components/consultation/FiveElementsChart";
import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import IntroWebtoonPanel from "../../../../../components/consultation/IntroWebtoonPanel";
import SajuChart from "../../../../../components/consultation/SajuChart";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";
import { useState, useEffect } from "react";
import { getFiveElementBasicInfo } from "../../../../../lib/five-elements-utils";

export default function Section1BasicInfo({ consultation }) {
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
          text: "이번엔 오행을 분석하겠네.",
          position: { top: "10%", left: "30%" },
          size: "medium",
          direction: "bottom-right",

          maxWidth: "320px",
        },
        {
          text: "그대의 ‘운명의 배’가 어떤 훌륭한 재료들로 만들어졌는지 아는가?",
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
          text: "세상의 모든 것은 다섯 가지 기운으로 이루어져 있다네.",
          position: { top: "20%", left: "35%" },
          size: "medium",
          direction: "bottom-right",
          maxWidth: "250px",
        },
        {
          text: "그대의 성격과 재능까지 선택한단 말이네. 그럼 이제 그대의 오행 분석을 하겠네.",
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

      <FiveElementsChart consultation={consultation} />

      {/* MBTI와 오행 결합 분석 섹션 */}
      {consultation?.dominantElement && consultation?.additionalData?.mbti && (
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
    </div>
  );
}

// MBTI 타입을 그룹으로 매핑하는 함수
const getMBTIGroup = (mbti) => {
  if (!mbti || mbti.length < 4) return null;

  // MBTI의 두 번째와 세 번째 글자로 그룹 결정
  const secondChar = mbti[1]; // S 또는 N
  const thirdChar = mbti[2];  // T 또는 F

  if (secondChar === 'S' && thirdChar === 'T') return 'ST';
  if (secondChar === 'S' && thirdChar === 'F') return 'SF';
  if (secondChar === 'N' && thirdChar === 'T') return 'NT';
  if (secondChar === 'N' && thirdChar === 'F') return 'NF';

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
        console.error('MBTI 데이터 로딩 실패:', error);
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
    '金': '금',
    '木': '목',
    '水': '수',
    '火': '화',
    '土': '토'
  };

  // 대표 오행에 따른 키 매핑 (JSON 파일의 키와 일치하도록)
  const elementKey = elementMapping[dominantElement] || null;

  const analysisText = elementKey ? mbtiData[elementKey] : null;

  console.log('MBTI 분석 디버그:', {
    mbti,
    mbtiGroup,
    dominantElement: `${dominantElement} (한자)`,
    elementKey: `${elementKey} (한글)`,
    hasAnalysisText: !!analysisText,
    mbtiDataKeys: Object.keys(mbtiData || {}),
    analysisTextPreview: analysisText ? analysisText.substring(0, 100) + '...' : 'null'
  });

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "20px",
        backgroundColor: "rgba(106, 90, 205, 0.05)",
        borderRadius: "12px",
        border: "2px solid rgba(106, 90, 205, 0.3)",
        boxShadow: "0 4px 20px rgba(106, 90, 205, 0.1)",
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
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
          border: "1px solid rgba(106, 90, 205, 0.2)",
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
          <span style={{ color: "#6a5acd", fontWeight: "600" }}>성격유형:</span>{" "}
          {mbti} ({mbtiGroup} 그룹)
        </p>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "14px",
            margin: "8px 0 0 0",
            lineHeight: "1.5",
          }}
        >
          <span style={{ color: "#6a5acd", fontWeight: "600" }}>대표 오행:</span>{" "}
          {getFiveElementBasicInfo(dominantElement)?.name}
        </p>
        {mbtiData.point && (
          <div
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "14px",
              margin: "8px 0 0 0",
              lineHeight: "1.6",
            }}
          >
            <span style={{ color: "#6a5acd", fontWeight: "600" }}>{mbtiGroup} 특성:</span>
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
            color: "rgba(255, 255, 255, 0.8)",
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
                      filter: 'blur(4px)',
                      WebkitFilter: 'blur(4px)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      color: 'rgba(255, 255, 255, 0.5)'
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
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            fontStyle: "italic",
            padding: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
          }}
        >
          디버그: analysisText가 없습니다.
          <br />대표 오행: {dominantElement} (한자) → {elementKey} (한글 키)
          <br />mbtiData 키들: {Object.keys(mbtiData || {}).join(', ')}
        </div>
      )}

      {!isPaid && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "rgba(106, 90, 205, 0.1)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#6a5acd",
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
