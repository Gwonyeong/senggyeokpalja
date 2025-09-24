"use client";

import React from "react";
import Image from "next/image";
import SpeechBubble from "./SpeechBubble";

const WebtoonPanel = ({
  sectionNumber,
  backgroundImage,
  characterImages = [],
  speechBubbles = [],
  panelStyle = {},
  className = "",
}) => {
  // 기본 패널 스타일
  const defaultPanelStyle = {
    position: "relative",
    width: "100%",

    background: "transparent",
    border: "none",
    borderRadius: "0",
    overflow: "hidden",
    ...panelStyle,
  };

  return (
    <div className={`webtoon-panel ${className}`} style={defaultPanelStyle}>
      {/* 배경 이미지 */}
      {backgroundImage && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        >
          <Image
            src={backgroundImage}
            alt={`섹션 ${sectionNumber} 배경`}
            fill
            style={{ objectFit: "cover" }}
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
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {/* 패널 번호 표시 (선택사항) */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {sectionNumber}
        </div>
      </div>
    </div>
  );
};

export default WebtoonPanel;
