"use client";

import React from "react";
import Image from "next/image";
import SpeechBubble from "./SpeechBubble";
import SajuTable from "./SajuTable";

const WebtoonPanel = ({
  sectionNumber,
  backgroundImage,
  characterImages = [],
  speechBubbles = [],
  panelStyle = {},
  className = "",
  consultation = null,
  imageStyle = {},
}) => {
  // 기본 패널 스타일
  const defaultPanelStyle = {
    position: "relative",
    width: "100%",
    background: "transparent",
    border: "none",
    borderRadius: "0",
    overflow: "visible",
    ...panelStyle,
  };

  return (
    <div className={`webtoon-panel ${className}`} style={defaultPanelStyle}>
      {/* 배경 이미지 */}
      {backgroundImage && (
        <div
          style={{
            position: "absolute",
            top: imageStyle.top || 0,
            left: imageStyle.left || 0,
            width: imageStyle.width || "100%",
            height: imageStyle.height || "100%",
            aspectRatio: imageStyle.aspectRatio || "auto",
            border: imageStyle.border || "none",
            borderRadius: imageStyle.borderRadius || "0",
            zIndex: 1,
            transform: imageStyle.transform || "none",
          }}
        >
          <Image
            src={backgroundImage}
            alt={`섹션 ${sectionNumber} 배경`}
            fill
            style={{
              objectFit: imageStyle.objectFit || "contain",
              objectPosition: imageStyle.objectPosition || "center center",
              borderRadius: imageStyle.borderRadius || "0",
            }}
            priority={sectionNumber <= 2}
          />
        </div>
      )}

      {/* 캐릭터 이미지들 */}
      {characterImages.map((character, index) => (
        <div
          key={`character-${index}`}
          style={{
            position: "absolute",
            top: character.position?.top || "50%",
            left: character.position?.left || "50%",
            transform: character.position?.transform || "translate(-50%, -50%)",
            width: character.width || "auto",
            height: character.height || "auto",
            zIndex: character.zIndex || 5,
          }}
        >
          <Image
            src={character.src}
            alt={character.alt || `캐릭터 ${index + 1}`}
            width={character.imageWidth || 200}
            height={character.imageHeight || 200}
            style={{
              objectFit: "contain",
              filter: character.filter || "none",
            }}
          />
        </div>
      ))}

      {/* 말풍선들 */}
      {speechBubbles.map((bubble, index) => (
        <SpeechBubble
          key={`bubble-${index}`}
          text={bubble.text}
          position={bubble.position}
          type={bubble.type}
          size={bubble.size}
          direction={bubble.direction}
          textColor={bubble.textColor}
          backgroundColor={bubble.backgroundColor}
          borderColor={bubble.borderColor}
          maxWidth={bubble.maxWidth}
        />
      ))}

      {/* 추가 오버레이 요소들 */}
      <div
        className="panel-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 5,
          pointerEvents: "none",
        }}
      ></div>
    </div>
  );
};

export default WebtoonPanel;
