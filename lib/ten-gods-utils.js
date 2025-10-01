"use client";

// 십성 기본 정보
export const getTenGodsBasicInfo = (tenGodName) => {
  const basicInfo = {
    비견: {
      name: "비견(比肩)",
      alias: ["동료", "자립", "경쟁", "협력"],
      characteristic: "평등과 자립, 그리고 경쟁을 통한 성장",
      personality: "자립심이 강하고, 친구나 동료와의 관계에서 협력과 신뢰를 중시하는 성향"
    },
    겁재: {
      name: "겁재(劫財)",
      alias: ["도전", "변화", "모험", "추진력"],
      characteristic: "적극적인 도전 정신과 변화를 추구하는 기운",
      personality: "모험을 즐기고 새로운 도전에 적극적이며, 변화를 두려워하지 않는 성향"
    },
    식신: {
      name: "식신(食神)",
      alias: ["재능", "표현", "창의", "여유"],
      characteristic: "창의적 표현과 재능을 발휘하는 기운",
      personality: "예술적 감각이 뛰어나고 창의적이며, 여유롭고 평화로운 성향"
    },
    상관: {
      name: "상관(傷官)",
      alias: ["비판", "개혁", "창신", "표현"],
      characteristic: "비판적 사고와 개혁을 추구하는 기운",
      personality: "비판적 사고가 뛰어나고 개혁적이며, 새로운 것을 창조하는 성향"
    },
    편재: {
      name: "편재(偏財)",
      alias: ["사업", "투자", "기회", "활동"],
      characteristic: "사업과 투자를 통한 활발한 활동의 기운",
      personality: "사업 수완이 뛰어나고 기회를 잘 포착하며, 활동적이고 외향적인 성향"
    },
    정재: {
      name: "정재(正財)",
      alias: ["안정", "저축", "계획", "신중"],
      characteristic: "안정적인 재물 관리와 계획적 성향의 기운",
      personality: "계획적이고 신중하며, 안정적인 재물 관리를 선호하는 성향"
    },
    편관: {
      name: "편관(偏官)",
      alias: ["도전", "압박", "시련", "극복"],
      characteristic: "도전과 시련을 통한 성장의 기운",
      personality: "강한 추진력과 결단력을 가지고 있으며, 어려움을 극복하는 성향"
    },
    정관: {
      name: "정관(正官)",
      alias: ["책임", "명예", "권위", "질서"],
      characteristic: "책임감과 명예를 중시하는 기운",
      personality: "책임감이 강하고 질서를 중시하며, 명예와 지위를 추구하는 성향"
    },
    편인: {
      name: "편인(偏印)",
      alias: ["직관", "예술", "철학", "독창"],
      characteristic: "직관적 사고와 예술적 감성의 기운",
      personality: "직관력이 뛰어나고 예술적 감각이 있으며, 독창적인 사고를 하는 성향"
    },
    정인: {
      name: "정인(正印)",
      alias: ["학문", "지혜", "교육", "보호"],
      characteristic: "학문과 지혜를 추구하는 기운",
      personality: "학문을 좋아하고 지혜롭며, 타인을 보호하고 도움을 주는 성향"
    }
  };

  return basicInfo[tenGodName] || null;
};

// 십성 상세 설명 불러오기
export const getTenGodsDescription = async (tenGodName) => {
  try {
    const response = await fetch(`/documents/십신/${tenGodName}/${tenGodName}_성격_완성.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch description for ${tenGodName}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load ten gods description:', error);
    return null;
  }
};

// 십성별 조언 가이드 불러오기
export const getTenGodsAdvice = async (tenGodName) => {
  try {
    const response = await fetch(`/documents/십신/${tenGodName}/${tenGodName}_조언가이드_완성.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch advice for ${tenGodName}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load ten gods advice:', error);
    return null;
  }
};

// 십성별 총운 불러오기
export const getTenGodsFortune = async (tenGodName) => {
  try {
    const response = await fetch(`/documents/십신/${tenGodName}/${tenGodName}_총운_완성.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch fortune for ${tenGodName}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load ten gods fortune:', error);
    return null;
  }
};