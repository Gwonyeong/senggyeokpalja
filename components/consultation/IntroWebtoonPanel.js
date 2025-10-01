"use client";

import WebtoonPanel from "./WebtoonPanel";
import { generateSectionContent } from "../../lib/consultation-content-generator";

export default function IntroWebtoonPanel({ consultation }) {
  if (!consultation) {
    return null;
  }

  const panelConfig = {
    backgroundImage: "/assets/images/results/1장/1.png",
    imageStyle: {
      objectFit: "contain",

      width: "100%",
      height: "100%",
    },
    speechBubbles: [
      {
        text: "그대의 사주팔자를 분석하겠네.",
        position: { top: "20%", left: "30%" },
        size: "large",
        direction: "bottom-left",

        maxWidth: "350px",
      },
    ],
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <WebtoonPanel
        key="intro-panel"
        sectionNumber={1}
        consultation={consultation}
        {...generateSectionContent(consultation, 1, {
          backgroundImage: panelConfig.backgroundImage,
          imageStyle: panelConfig.imageStyle,
          speechBubbles: panelConfig.speechBubbles,
          characterImages: [],
        })}
        panelStyle={{
          height: "600px",
          background: "transparent",
          border: "none",
          borderRadius: "0",
          marginBottom: "0",
        }}
      />
    </div>
  );
}
