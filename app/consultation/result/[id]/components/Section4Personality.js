import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { determinePaljaType } from "../../../../../lib/saju-utils";
import { useState, useEffect } from "react";

export default function Section4Personality({ consultation }) {
  const [paljaTypeData, setPaljaTypeData] = useState(null);
  const [databaseData, setDatabaseData] = useState({});
  const [detailedDescriptions, setDetailedDescriptions] = useState({});

  // 팔자 유형 데이터베이스 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 기본 데이터베이스 로드
        const response = await fetch("/database.json");
        const database = await response.json();
        setDatabaseData(database);

        // 상세 설명 JSON 로드
        const detailResponse = await fetch("/documents/팔자유형_상세설명.json");
        const detailData = await detailResponse.json();
        setDetailedDescriptions(detailData);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };

    loadData();
  }, []);

  // 팔자 유형 계산
  useEffect(() => {
    if (
      consultation &&
      Object.keys(databaseData).length > 0 &&
      Object.keys(detailedDescriptions).length > 0
    ) {
      try {
        // consultation 데이터를 saju-utils의 calculateSaju 형식으로 변환
        const sajuData = {
          palja: {
            yeonju: {
              gan: { han: consultation.yearStem },
              ji: {
                han: consultation.yearBranch,
                ohaeng: getOhaengFromJiji(consultation.yearBranch),
              },
            },
            wolju: {
              gan: { han: consultation.monthStem },
              ji: {
                han: consultation.monthBranch,
                ohaeng: getOhaengFromJiji(consultation.monthBranch),
              },
            },
            ilju: {
              gan: { han: consultation.dayStem },
              ji: {
                han: consultation.dayBranch,
                ohaeng: getOhaengFromJiji(consultation.dayBranch),
              },
            },
            siju: {
              gan: { han: consultation.timeStem },
              ji: {
                han: consultation.timeBranch,
                ohaeng: getOhaengFromJiji(consultation.timeBranch),
              },
            },
          },
          ilgan: { han: consultation.dayStem },
          wolji: { ohaeng: getOhaengFromJiji(consultation.monthBranch) },
          ohaeng: calculateOhaengCount(consultation),
          sibsin: calculateSibsinCount(consultation),
        };

        const personalityType = determinePaljaType(sajuData);
        const typeData = databaseData[personalityType];
        const detailedData = detailedDescriptions[personalityType];

        if (typeData && detailedData) {
          setPaljaTypeData({
            personalityType,
            typeData,
            detailedData,
            sajuData,
          });
        }
      } catch (error) {
        console.error("팔자 유형 계산 실패:", error);
      }
    }
  }, [consultation, databaseData, detailedDescriptions]);

  // 지지를 오행으로 변환하는 헬퍼 함수
  const getOhaengFromJiji = (jiji) => {
    const jijiOhaengMap = {
      子: "수",
      丑: "土",
      寅: "木",
      卯: "木",
      辰: "土",
      巳: "火",
      午: "火",
      未: "土",
      申: "金",
      酉: "金",
      戌: "土",
      亥: "수",
    };
    return jijiOhaengMap[jiji] || "土";
  };

  // 오행 개수 계산 (간략화된 버전)
  const calculateOhaengCount = (consultation) => {
    const count = { 木: 0, 火: 0, 土: 0, 金: 0, 수: 0 };

    // 천간 오행
    const ganOhaengMap = {
      甲: "木",
      乙: "木",
      丙: "火",
      丁: "火",
      戊: "土",
      己: "土",
      庚: "金",
      辛: "金",
      壬: "수",
      癸: "수",
    };

    [
      consultation.yearStem,
      consultation.monthStem,
      consultation.dayStem,
      consultation.timeStem,
    ].forEach((stem) => {
      if (stem && ganOhaengMap[stem]) {
        count[ganOhaengMap[stem]]++;
      }
    });

    // 지지 오행
    [
      consultation.yearBranch,
      consultation.monthBranch,
      consultation.dayBranch,
      consultation.timeBranch,
    ].forEach((branch) => {
      if (branch) {
        const ohaeng = getOhaengFromJiji(branch);
        count[ohaeng]++;
      }
    });

    return count;
  };

  // 십성 개수 계산 (데이터베이스에서 가져오기)
  const calculateSibsinCount = (consultation) => {
    // consultation.tenGods에서 실제 십성 데이터 사용
    return (
      consultation.tenGods || {
        비견: 0,
        겁재: 0,
        식신: 0,
        상관: 0,
        편재: 0,
        정재: 0,
        편관: 0,
        정관: 0,
        편인: 0,
        정인: 0,
      }
    );
  };

  // 섹션 4에서 사용할 이미지 목록
  const imageList = [
    "/assets/images/results/1장/2.png",
    "/assets/images/results/1장/3.png",
    "/assets/images/results/1장/5.png",
  ];

  // 첫 번째와 두 번째 웹툰 패널 설정
  const topPanelConfigs = [
    {
      backgroundImage: imageList[0],
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "80%",
        height: "100%",
        aspectRatio: "1 / 1",
        top: "0%",
        maxWidth: "400px",
      },
      speechBubbles: [
        {
          text: "그대의 팔자유형은...",
          position: { top: "100%", left: "50%" },
          size: "large",
          direction: "bottom-right",
          maxWidth: "320px",
        },
      ],
    },
    {
      backgroundImage: imageList[1],
      imageStyle: {
        objectFit: "contain",
        objectPosition: "center center",
        width: "80%",
        height: "100%",
        aspectRatio: "1 / 1",
        // top: "-10%",
        left: "20%",
      },
      speechBubbles: [],
    },
  ];

  // 마지막 웹툰 패널 설정
  const bottomPanelConfig = {
    backgroundImage: imageList[2],
    imageStyle: {
      objectFit: "cover",
      objectPosition: "center center",
      width: "100%",
      height: "100%",
      aspectRatio: "1 / 1",
    },
    speechBubbles: [
      {
        text: "이제 그대의 팔자 유형이 어떤 의미를 갖는지 알았겠지?",
        position: { top: "10%", left: "30%" },
        size: "large",
        direction: "bottom-right",
        backgroundColor: "#e2e3e5",
        borderColor: "#383d41",
        textColor: "#383d41",
        maxWidth: "400px",
      },
      {
        text: "이 특별한 성격이 그대의 인생을 어떻게 이끌어 나갈지 기대되는군.",
        position: { top: "90%", right: "30%" },
        size: "medium",
        direction: "bottom-right",
        maxWidth: "350px",
      },
    ],
  };

  // consultation이 없으면 로딩 표시
  if (!consultation) {
    return (
      <div>
        <div className="card-header">
          <h3 className="card-title">4. 나의 팔자 유형</h3>
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
        <h3 className="card-title">4. 나의 팔자 유형</h3>
      </div>

      {/* 2. 제목 아래에 웹툰 퍼널 2개 */}
      <div style={{ marginBottom: "20px" }}>
        {topPanelConfigs.map((config, index) => (
          <WebtoonPanel
            key={`section4-top-panel-${index}`}
            sectionNumber={4}
            consultation={consultation}
            backgroundImage={config.backgroundImage}
            imageStyle={config.imageStyle}
            speechBubbles={config.speechBubbles}
            characterImages={config.characterImages || []}
            panelStyle={{
              height: "300px",
              background: "transparent",
              border: "none",
              borderRadius: "0",
              marginBottom: index < topPanelConfigs.length - 1 ? "20px" : "0",
            }}
          />
        ))}
      </div>

      {/* 3. 팔자 유형 분석 결과 */}
      {paljaTypeData ? (
        <div
          style={{
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
          {/* 팔자 유형 이미지와 정보 */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
              padding: "20px",
              // backgroundColor: "rgba(212, 175, 55, 0.05)",
              // borderRadius: "12px",
              // border: "2px solid rgba(212, 175, 55, 0.3)",
              // boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
            }}
          >
            {/* 1. 팔자유형에 맞는 이미지 */}
            <div
              style={{
                marginBottom: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={`/assets/images/${paljaTypeData.personalityType}.png`}
                alt={paljaTypeData.detailedData.alias}
                style={{
                  width: "min(200px, 60vw)",
                  height: "min(200px, 60vw)",
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "50%",
                  border: "4px solid #d4af37",
                  objectFit: "cover",
                  boxShadow:
                    "0 0 0 1px #FCA311, 0 0 40px rgba(212, 175, 55, 0.5)",
                  display: "block",
                }}
              />
            </div>

            {/* 2. 이미지 아래에 팔자 유형과 alias 출력 */}
            <div
              style={{
                fontSize: "clamp(18px, 5vw, 24px)",
                fontWeight: "bold",
                // color: "#d4af37",
                marginBottom: "8px",
                fontFamily: "monospace",
                letterSpacing: "1px",
                wordBreak: "keep-all",
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              {paljaTypeData.personalityType}
            </div>
            <h4
              style={{
                color: "#d4af37",
                fontSize: "clamp(20px, 6vw, 28px)",
                fontWeight: "700",
                margin: "0",
                fontFamily: "Noto Serif KR",
                wordBreak: "keep-all",
                textAlign: "center",
              }}
            >
              {paljaTypeData.detailedData.alias}
            </h4>
          </div>

          {/* 3. 그 아래 설명을 3개의 박스에 나눠 출력 (본질, 빛, 그림자) */}

          {/* 본질 박스 */}
          <div
            style={{
              marginBottom: "20px",
              padding: "clamp(12px, 4vw, 20px)",
              backgroundColor: "#131316",
              borderRadius: "12px",
              border: "2px solid rgba(212, 175, 55, 0.3)",
              boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            <h5
              style={{
                color: "#d4af37",
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "16px",
                fontFamily: "Noto Serif KR",
                textAlign: "center",
              }}
            >
              당신의 본질
            </h5>
            <div
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "12px",
                lineHeight: "1.7",
                whiteSpace: "pre-line",
              }}
            >
              {paljaTypeData.detailedData.본질}
            </div>
          </div>

          {/* 빛 박스 */}
          <div
            style={{
              marginBottom: "20px",
              padding: "clamp(12px, 4vw, 20px)",
              backgroundColor: "#131316",
              borderRadius: "12px",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              boxShadow: "0 4px 20px rgba(255, 215, 0, 0.1)",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            <h5
              style={{
                color: "#FFD700",
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "16px",
                fontFamily: "Noto Serif KR",
                textAlign: "center",
              }}
            >
              당신의 빛: 강점 사용 설명서
            </h5>

            {/* 핵심 강점 */}
            <div style={{ marginBottom: "16px" }}>
              <h6
                style={{
                  color: "#FFD700",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontFamily: "Noto Serif KR",
                }}
              >
                ✨ 핵심 강점: {paljaTypeData.detailedData.빛.핵심강점.제목}
              </h6>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  marginBottom: "12px",
                }}
              >
                {paljaTypeData.detailedData.빛.핵심강점.설명}
              </div>
            </div>

            {/* 최고의 무대 */}
            <div style={{ marginBottom: "16px" }}>
              <h6
                style={{
                  color: "#FFD700",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontFamily: "Noto Serif KR",
                }}
              >
                🎭 최고의 무대
              </h6>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  marginBottom: "12px",
                }}
              >
                {paljaTypeData.detailedData.빛.최고의무대}
              </div>
            </div>

            {/* 강점 활용 비급 */}
            <div>
              <h6
                style={{
                  color: "#FFD700",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontFamily: "Noto Serif KR",
                }}
              >
                🔥 강점 활용 비급
              </h6>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                {paljaTypeData.detailedData.빛.강점활용비급}
              </div>
            </div>
          </div>

          {/* 그림자 박스 */}
          <div
            style={{
              marginBottom: "20px",
              padding: "clamp(12px, 4vw, 20px)",
              backgroundColor: "#131316",
              borderRadius: "12px",
              border: "2px solid rgba(138, 43, 226, 0.3)",
              boxShadow: "0 4px 20px rgba(138, 43, 226, 0.1)",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            <h5
              style={{
                color: "#8A2BE2",
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "16px",
                fontFamily: "Noto Serif KR",
                textAlign: "center",
              }}
            >
              당신의 그림자: 약점 보완 처방전
            </h5>

            {/* 근원적 약점 */}
            <div style={{ marginBottom: "16px" }}>
              <h6
                style={{
                  color: "#8A2BE2",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontFamily: "Noto Serif KR",
                }}
              >
                ⚠️ 근원적 약점:{" "}
                {paljaTypeData.detailedData.그림자.근원적약점.제목}
              </h6>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  marginBottom: "12px",
                }}
              >
                {paljaTypeData.detailedData.그림자.근원적약점.설명}
              </div>
            </div>

            {/* 함정에 빠지는 순간 */}
            <div style={{ marginBottom: "16px" }}>
              <h6
                style={{
                  color: "#8A2BE2",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontFamily: "Noto Serif KR",
                }}
              >
                🕳️ 함정에 빠지는 순간
              </h6>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  marginBottom: "12px",
                }}
              >
                {paljaTypeData.detailedData.그림자.함정에빠지는순간
                  .split("\n\n")
                  .filter((item) => item.trim())
                  .map((item, index) => (
                    <div key={index} style={{ marginBottom: "8px" }}>
                      {index + 1}. {item.trim()}
                    </div>
                  ))}
              </div>
            </div>

            {/* 토리의 처방전 */}
            <div>
              <h6
                style={{
                  color: "#8A2BE2",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontFamily: "Noto Serif KR",
                }}
              >
                💊 토리의 처방전
              </h6>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  fontStyle: "italic",
                  padding: "12px",
                  backgroundColor: "rgba(138, 43, 226, 0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(138, 43, 226, 0.2)",
                }}
              >
                {paljaTypeData.detailedData.그림자.토리의처방전}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            border: "1px solid rgba(212, 175, 55, 0.2)",
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
              🔮
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
              팔자 유형 분석 중...
            </h4>
          </div>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "14px",
              lineHeight: "1.7",
              margin: "8px 0",
            }}
          >
            잠시만 기다려주세요. 토리가 그대의 팔자 유형을 분석하고 있습니다.
          </p>
        </div>
      )}

      {/* 4. 팔자 유형 설명 아래 웹툰 퍼널 하나 */}
      <div style={{ marginTop: "20px" }}>
        <WebtoonPanel
          key="section4-bottom-panel"
          sectionNumber={4}
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
