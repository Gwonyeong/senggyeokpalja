"use client";

import React from "react";

const SajuTable = ({ consultation }) => {
  // additionalData에서 sajuData 추출
  const sajuData = consultation?.additionalData?.sajuData;

  if (!sajuData?.palja) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
        사주팔자 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const { palja, sibsin, ilgan } = sajuData;

  // 십신 정보 매핑 (각 주별로)
  const getSibsinForPillar = (pillars, pillarType) => {
    // 지지 기반 십신 계산 로직
    const jiInfo = {
      子: { ohaeng: "水", eumYang: "陽" },
      丑: { ohaeng: "土", eumYang: "陰" },
      寅: { ohaeng: "木", eumYang: "陽" },
      卯: { ohaeng: "木", eumYang: "陰" },
      辰: { ohaeng: "土", eumYang: "陽" },
      巳: { ohaeng: "火", eumYang: "陽" },
      午: { ohaeng: "火", eumYang: "陰" },
      未: { ohaeng: "土", eumYang: "陰" },
      申: { ohaeng: "金", eumYang: "陽" },
      酉: { ohaeng: "金", eumYang: "陰" },
      戌: { ohaeng: "土", eumYang: "陽" },
      亥: { ohaeng: "水", eumYang: "陰" },
    };

    const ohaengSaeng = { 水: "木", 木: "火", 火: "土", 土: "金", 金: "水" };
    const ohaengGeuk = { 水: "火", 火: "金", 金: "木", 木: "土", 土: "水" };

    if (!ilgan || !pillars?.ji?.han) return "정인";

    const pillarJi = pillars.ji.han;
    const jiOhaeng = jiInfo[pillarJi]?.ohaeng;
    const jiEumYang = jiInfo[pillarJi]?.eumYang;
    const ilganOhaeng = ilgan.ohaeng;
    const ilganEumYang = ilgan.eumYang;

    if (!jiOhaeng) return "정인";

    let sibsinType = "정인";

    // 일간과의 관계로 십신 결정
    if (jiOhaeng === ilganOhaeng) {
      // 같은 오행
      sibsinType = jiEumYang === ilganEumYang ? "비견" : "겁재";
    } else if (ohaengSaeng[ilganOhaeng] === jiOhaeng) {
      // 일간이 생하는 오행 (생출)
      sibsinType = jiEumYang === ilganEumYang ? "식신" : "상관";
    } else if (ohaengGeuk[ilganOhaeng] === jiOhaeng) {
      // 일간이 극하는 오행 (극출)
      sibsinType = jiEumYang === ilganEumYang ? "편재" : "정재";
    } else if (ohaengGeuk[jiOhaeng] === ilganOhaeng) {
      // 일간을 극하는 오행 (극입)
      sibsinType = jiEumYang === ilganEumYang ? "편관" : "정관";
    } else if (ohaengSaeng[jiOhaeng] === ilganOhaeng) {
      // 일간을 생하는 오행 (생입)
      sibsinType = jiEumYang === ilganEumYang ? "편인" : "정인";
    }

    return sibsinType;
  };

  const pillars = [
    { name: "시주", data: palja.siju },
    { name: "일주", data: palja.ilju },
    { name: "월주", data: palja.wolju },
    { name: "연주", data: palja.yeonju },
  ];

  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        border: "2px solid #d4af37",
        borderRadius: "12px",
        padding: "20px",
        margin: "20px auto",
        maxWidth: "600px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    ></div>
  );
};

// 스타일 상수들
const headerStyle = {
  padding: "10px 8px",
  border: "1px solid #ddd",
  backgroundColor: "#f8f4e6",
  fontWeight: "bold",
  textAlign: "center",
  color: "#2c2c2c",
};

const labelStyle = {
  padding: "12px 8px",
  border: "1px solid #ddd",
  backgroundColor: "#f0f0f0",
  fontWeight: "bold",
  textAlign: "center",
  color: "#2c2c2c",
};

const cellStyle = {
  padding: "12px 8px",
  border: "1px solid #ddd",
  textAlign: "center",
  verticalAlign: "middle",
};

export default SajuTable;
