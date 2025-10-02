import TenGodsChart from "../../../../../components/consultation/TenGodsChart";
import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";

export default function Section2TenGods({ consultation }) {
  // 섹션 2에서 사용할 이미지 목록 (2-2장 이미지만 사용)
  const imageList = [
    "/assets/images/results/2-2장/1.png",
    "/assets/images/results/2-2장/2.png",
  ];

  // 각 패널별 설정 (이미지, 말풍선, 이미지 스타일)
  const panelConfigs = [
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
          text: "이번엔 십성을 분석하겠네.",
          position: { top: "10%", left: "30%" },
          size: "medium",
          direction: "bottom-right",
          maxWidth: "320px",
        },
        {
          text: "그대의 '운명의 항해사'가 어떤 역할을 맡고 있는지 아는가?",
          position: { top: "90%", right: "30%" },
          size: "medium",
          direction: "bottom-right",
          maxWidth: "320px",
        },
      ],
    },
  ];

  // consultation이 없으면 로딩 표시
  if (!consultation) {
    return (
      <div>
        <div className="card-header">
          <h3 className="card-title">2. 나의 십성(십신)</h3>
        </div>
        <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
          상담 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header">
        <h3 className="card-title">2. 나의 십성(십신)</h3>
      </div>

      {/* 첫 번째 웹툰 패널 - 도입부 */}
      <div style={{ marginBottom: "120px" }}>
        {panelConfigs.map((config, index) => (
          <WebtoonPanel
            key={`section2-intro-panel-${index}`}
            sectionNumber={2}
            consultation={consultation}
            {...generateSectionContent(consultation, 2, {
              backgroundImage: config.backgroundImage,
              imageStyle: config.imageStyle,
              speechBubbles: config.speechBubbles,
              characterImages: config.characterImages || [],
            })}
            panelStyle={{
              height: "600px",
              background: "transparent",
              border: "none",
              borderRadius: "0",
              marginBottom: index < panelConfigs.length - 1 ? "20px" : "0",
            }}
          />
        ))}
      </div>

      {/* 십성 설명 패널들 */}

      {/* 십성 차트 */}
      <TenGodsChart consultation={consultation} />

      {/* 십성 해석 후 추가 웹툰 패널 */}
      <div style={{ marginTop: "120px", marginBottom: "120px" }}>
        <WebtoonPanel
          key="section2-final-panel"
          sectionNumber={2}
          consultation={consultation}
          {...generateSectionContent(consultation, 2, {
            backgroundImage: imageList[1],
            imageStyle: {
              objectFit: "cover",
              objectPosition: "center center",
              width: "100%",
              height: "100%",
              aspectRatio: "1 / 1",
            },
            speechBubbles: [
              {
                text: "이제 그대의 십성이 어떤 의미를 갖는지 알았겠지?",
                position: { top: "5%", left: "30%" },
                size: "medium",
                direction: "bottom-right",

                maxWidth: "300px",
              },
              {
                text: "십성은 그대의 인생에서 만나는 다양한 관계와 역할을 의미한다네.",
                position: { top: "95%", right: "30%" },
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
