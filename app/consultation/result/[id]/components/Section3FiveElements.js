import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import {
  calculateSinsalFromConsultation,
  enrichSinsalData,
} from "../../../../../lib/saju-utils";
import { useState, useEffect } from "react";

export default function Section3FiveElements({ consultation }) {
  const [sinsalData, setSinsalData] = useState({});
  const [sinsalJsonData, setSinsalJsonData] = useState([]);

  // 신살 JSON 데이터 로드
  useEffect(() => {
    const loadSinsalData = async () => {
      try {
        const response = await fetch("/documents/신살_풀패키지.json");
        const jsonData = await response.json();
        setSinsalJsonData(jsonData);
      } catch (error) {
        console.error("신살 데이터 로드 실패:", error);
      }
    };

    loadSinsalData();
  }, []);

  // 신살 계산
  useEffect(() => {
    if (consultation && sinsalJsonData.length > 0) {
      const calculatedSinsal = calculateSinsalFromConsultation(consultation);
      const enrichedSinsal = enrichSinsalData(calculatedSinsal, sinsalJsonData);
      setSinsalData(enrichedSinsal);
    }
  }, [consultation, sinsalJsonData]);

  // 섹션 3에서 사용할 이미지 목록
  const imageList = [
    "/assets/images/results/3장/1.png",
    "/assets/images/results/3장/2.png",
    "/assets/images/results/3장/3.png",
    "/assets/images/results/3장/4.png",
  ];

  // 첫 번째와 두 번째 웹툰 패널 설정
  const topPanelConfigs = [
    {
      backgroundImage: imageList[0],
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
      },
      speechBubbles: [
        {
          text: "이번엔 신살을 분석하겠네.",
          position: { top: "10%", left: "30%" },
          size: "medium",
          direction: "bottom-right",
          maxWidth: "320px",
        },
        {
          text: "그대의 '운명의 별자리'가 어떤 의미를 담고 있는지 아는가?",
          position: { top: "90%", right: "30%" },
          size: "medium",
          direction: "bottom-right",
          maxWidth: "320px",
        },
      ],
    },
    {
      backgroundImage: imageList[1],
      imageStyle: {
        objectFit: "cover",
        objectPosition: "center center",
        width: "250px",
        height: "250px",
        borderRadius: "100%",
        border: "2px solid #d4af37",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        aspectRatio: "1 / 1",
        boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
      },
      speechBubbles: [
        {
          text: "신살은 그대의 고난과 시련을 주는 운석이 될 수도 있다네",
          position: { top: "25%", left: "30%" },
          size: "small",
          direction: "bottom-right",

          maxWidth: "250px",
        },
        {
          text: "고통을 이겨내고 성장할 에너지가 될 수도 있지. 그대의 무기로 만드는게 중요하다네.",
          position: { top: "75%", right: "30%" },
          size: "small",
          direction: "bottom-left",
          maxWidth: "250px",
        },
      ],
    },
  ];

  // 마지막 웹툰 패널 설정
  const bottomPanelConfig = {
    backgroundImage: imageList[3],
    imageStyle: {
      objectFit: "cover",
      objectPosition: "center center",
      width: "100%",
      height: "100%",
      aspectRatio: "1 / 1",
    },
    speechBubbles: [
      {
        text: "이제 그대의 신살이 어떤 의미를 갖는지 알았겠지?",
        position: { top: "10%", left: "30%" },
        size: "medium",
        direction: "bottom-right",

        maxWidth: "250px",
      },
      {
        text: "다음장은 팔자유형에 대해 설명하곘네.",
        position: { top: "90%", right: "30%" },
        size: "medium",
        direction: "bottom-right",
        maxWidth: "250px",
      },
    ],
  };

  // consultation이 없으면 로딩 표시
  if (!consultation) {
    return (
      <div>
        <div className="card-header">
          <h3 className="card-title">3. 나의 신살</h3>
        </div>
        <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
          상담 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 1. 상단에 제목 */}
      <div className="card-header">
        <h3 className="card-title">3. 나의 신살</h3>
      </div>

      {/* 2. 제목 아래에 웹툰 퍼널 2개 */}
      <div style={{ marginBottom: "20px" }}>
        {topPanelConfigs.map((config, index) => (
          <WebtoonPanel
            key={`section3-top-panel-${index}`}
            sectionNumber={3}
            consultation={consultation}
            backgroundImage={config.backgroundImage}
            imageStyle={config.imageStyle}
            speechBubbles={config.speechBubbles}
            characterImages={config.characterImages || []}
            panelStyle={{
              height: "600px",
              background: "transparent",
              border: "none",
              borderRadius: "0",
              marginBottom: index < topPanelConfigs.length - 1 ? "20px" : "0",
            }}
          />
        ))}
      </div>

      {/* 3. 그 아래에 신살 설명 */}
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
        <h4
          style={{
            color: "#d4af37",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px",
            textAlign: "center",
            fontFamily: "Noto Serif KR",
          }}
        >
          신살(神殺) 해석
        </h4>

        {Object.keys(sinsalData).length > 0 ? (
          <>
            {/* 신살 목록 */}
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
                보유 신살
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
                {Object.entries(sinsalData).map(([sinsalName, data]) => (
                  <div
                    key={sinsalName}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#131316",
                      border: "2px solid #d4af37",
                      boxShadow: "0 0 12px rgba(212, 175, 55, 0.3)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      position: "relative",
                      background:
                        "linear-gradient(135deg, #131316 0%, rgba(212, 175, 55, 0.1) 100%)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      <span style={{ color: "#d4af37", fontSize: "14px" }}>
                        ⭐
                      </span>
                      <span
                        style={{
                          color: "#d4af37",
                          fontWeight: "600",
                        }}
                      >
                        {data.info.name_kr}{" "}
                        {data.info.name_hanja && `(${data.info.name_hanja})`}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#d4af37",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {data.positions.map((pos) => pos.position).join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 신살 상세 설명 */}
            {Object.entries(sinsalData).map(([sinsalName, data], index) => (
              <div
                key={`detail-${sinsalName}`}
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
                    {data.info.name_kr}{" "}
                    {data.info.name_hanja && `(${data.info.name_hanja})`}
                  </h4>
                </div>

                {/* 키워드 */}
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px 16px",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#d4af37",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      키워드:
                    </span>
                    {data.info.representative_keywords?.map(
                      (keyword, keywordIndex) => (
                        <span
                          key={keywordIndex}
                          style={{
                            backgroundColor: "rgba(212, 175, 55, 0.2)",
                            color: "#d4af37",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            border: "1px solid rgba(212, 175, 55, 0.3)",
                          }}
                        >
                          {keyword}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* 상세 설명 */}
                <h5
                  style={{
                    color: "#d4af37",
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    fontFamily: "Noto Serif KR",
                  }}
                >
                  🔮 상세 해석
                </h5>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "14px",
                    lineHeight: "1.7",
                    whiteSpace: "pre-line",
                  }}
                >
                  {data.info.expert_explanation ||
                    "상세 설명을 불러올 수 없습니다."}
                </div>
              </div>
            ))}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                ✨
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
                평온한 운세
              </h4>
            </div>
            <div
              style={{
                padding: "20px",
                backgroundColor: "rgba(212, 175, 55, 0.05)",
                borderRadius: "12px",
                border: "2px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
              }}
            >
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  margin: "8px 0",
                }}
              >
                현재 사주에서는 특별한 신살이 발견되지 않았습니다.
              </p>
              <p
                style={{
                  color: "#d4af37",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  margin: "8px 0",
                  fontWeight: "600",
                }}
              >
                이는 평온하고 안정된 운세를 의미합니다.
              </p>
            </div>
          </div>
        )}

        {/* 신살에 대한 일반적 설명 */}
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
            💫 신살에 대한 이해
          </h4>
          <div
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "12px",
              lineHeight: "1.6",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              신살은 하늘의 별들이 인간의 운명에 미치는 특별한 영향력을
              의미합니다.
            </p>
            <p style={{ margin: "0" }}>
              길신(吉神)은 행운과 성공을, 흉신(凶神)은 주의가 필요한 영역을
              나타내지만, 올바른 이해와 대응으로 모든 신살을 성장의 기회로
              활용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 4. 신살 설명 아래 웹툰 퍼널 하나 */}
      <div style={{ marginTop: "120px", marginBottom: "120px" }}>
        <WebtoonPanel
          key="section3-bottom-panel"
          sectionNumber={3}
          consultation={consultation}
          backgroundImage={bottomPanelConfig.backgroundImage}
          imageStyle={bottomPanelConfig.imageStyle}
          speechBubbles={bottomPanelConfig.speechBubbles}
          characterImages={bottomPanelConfig.characterImages || []}
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
