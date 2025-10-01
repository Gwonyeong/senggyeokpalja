import FiveElementsChart from "../../../../../components/consultation/FiveElementsChart";
import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";

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
          size: "large",
          direction: "bottom-right",
          backgroundColor: "#e2e3e5",
          borderColor: "#383d41",
          textColor: "#383d41",
          maxWidth: "330px",
        },
        {
          text: "그대의 성격과 재능까지 선택한단 말이네. 그럼 이제 그대의 오행 분석을 하겠네.",
          position: { top: "80%", right: "35%" },
          size: "large",
          direction: "bottom-right",
          backgroundColor: "#e2e3e5",
          borderColor: "#383d41",
          textColor: "#383d41",
          maxWidth: "600px",
        },
      ],
    },
  ];

  return (
    <div className="section-container">
      <div className="card-header">
        <h3 className="card-title">1. 나의 사주팔자에 대하여</h3>
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

      {/* 오행 해석 후 추가 웹툰 패널 */}
      <div style={{ marginTop: "20px" }}>
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
                size: "large",
                direction: "bottom-right",
                backgroundColor: "#e2e3e5",
                borderColor: "#383d41",
                textColor: "#383d41",
                maxWidth: "400px",
              },
              {
                text: "다음장은 십성에 대하여 알려주겠네.",
                position: { top: "90%", right: "30%" },
                size: "medium",
                direction: "bottom-right",

                maxWidth: "350px",
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
