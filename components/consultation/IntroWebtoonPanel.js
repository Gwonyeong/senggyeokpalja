"use client";

import WebtoonPanel from "./WebtoonPanel";
import { generateSectionContent } from "../../lib/consultation-content-generator";

export default function IntroWebtoonPanel({ consultation }) {
  if (!consultation) {
    return null;
  }

  const panelConfigs = [
    {
      backgroundImage: "/assets/images/results/1장/1.png",
      imageStyle: {
        objectFit: "contain",
        width: "100%",
        height: "100%",
      },
      speechBubbles: [
        {
          text: "안녕하세요! 당신의 사주팔자 이야기를 들려드릴 토리라고 해요.",
          position: { top: "20%", left: "30%" },
          size: "large",
          direction: "bottom-left",
          maxWidth: "350px",
        },
      ],
    },
    {
      backgroundImage: "/assets/images/results/1장/5.png", // 새로운 이미지 경로 (필요시 조정)
      imageStyle: {
        objectFit: "contain",
        width: "100%",
        height: "100%",
      },
      speechBubbles: [
        {
          text:
            consultation.additionalData.name +
            "님의 사주원국표를 먼저 보여드릴게요.",
          position: { top: "15%", left: "35%" },
          size: "middle",
          direction: "bottom-right",
          maxWidth: "350px",
        },
      ],
    },
  ];

  return (
    <div style={{ marginBottom: "20px" }}>
      {panelConfigs.map((config, index) => (
        <WebtoonPanel
          key={`intro-panel-${index}`}
          sectionNumber={1}
          consultation={consultation}
          {...generateSectionContent(consultation, 1, {
            backgroundImage: config.backgroundImage,
            imageStyle: config.imageStyle,
            speechBubbles: config.speechBubbles,
            characterImages: [],
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
  );
}
