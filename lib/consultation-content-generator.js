// 상담 데이터를 기반으로 웹툰 콘텐츠를 생성하는 유틸리티

// 기본 캐릭터 이미지 (토리)
const DEFAULT_CHARACTER = {
  src: "/assets/images/토리.png",
  alt: "토리",
  imageWidth: 150,
  imageHeight: 150,
  position: { top: "60%", left: "20%" },
  zIndex: 5,
};

// 십신별 성격 특징 매핑
const SIBSIN_PERSONALITY_MAP = {
  비견: "독립적이고 자주적인 성향",
  겁재: "도전적이고 경쟁적인 성향",
  식신: "창조적이고 표현력이 뛰어난 성향",
  상관: "비판적이고 독창적인 성향",
  정재: "안정적이고 계획적인 성향",
  편재: "활동적이고 사업가적인 성향",
  정관: "책임감 있고 명예를 중시하는 성향",
  편관: "추진력 있고 결단력 있는 성향",
  정인: "학문적이고 지혜로운 성향",
  편인: "예술적이고 직관적인 성향",
};

// 오행별 특성 매핑
const ELEMENT_CHARACTERISTICS = {
  木: "성장과 창조의 에너지",
  火: "열정과 활동의 에너지",
  土: "안정과 포용의 에너지",
  金: "정의와 절제의 에너지",
  水: "지혜와 적응의 에너지",
};

// MBTI별 특성 매핑
const MBTI_CHARACTERISTICS = {
  INTJ: "전략가 - 독립적이고 창의적",
  INTP: "논리술사 - 분석적이고 객관적",
  ENTJ: "통솔자 - 리더십이 강하고 목표지향적",
  ENTP: "변론가 - 혁신적이고 도전적",
  INFJ: "옹호자 - 이상주의적이고 통찰력 있는",
  INFP: "중재자 - 가치지향적이고 창의적",
  ENFJ: "선도자 - 카리스마 있고 영감을 주는",
  ENFP: "활동가 - 열정적이고 창의적",
  ISTJ: "현실주의자 - 책임감 있고 체계적",
  ISFJ: "수호자 - 온화하고 배려심 깊은",
  ESTJ: "경영자 - 조직적이고 실용적",
  ESFJ: "집정관 - 사교적이고 협조적",
  ISTP: "장인 - 실용적이고 적응력 있는",
  ISFP: "모험가 - 유연하고 조화로운",
  ESTP: "사업가 - 활동적이고 현실적",
  ESFP: "연예인 - 자발적이고 열정적",
};

/**
 * 섹션 1: 사주팔자 기본 정보 생성
 */
export const generateSection1Content = (consultation) => {
  const { birthDate, lunarCalendar, additionalData } = consultation;

  const speechBubbles = [
    {
      text: `그대의 사주팔자를 분석하겠네.`,
      position: { top: "15%", left: "50%" },
      size: "large",
      direction: "bottom-left",
    },
  ];

  return {
    backgroundImage: "/assets/images/results/section1/1.png",

    speechBubbles,
  };
};

/**
 * 섹션 2: 십신 분석 생성
 */
export const generateSection2Content = (consultation) => {
  const tenGods = consultation.tenGods || {};
  const primarySibsin =
    Object.entries(tenGods).sort(([, a], [, b]) => b - a)[0]?.[0] || "정인";

  const personality = SIBSIN_PERSONALITY_MAP[primarySibsin] || "균형잡힌 성향";

  const speechBubbles = [
    {
      text: `${
        consultation.additionalData?.name || "고객"
      }님의 핵심 십신은\n"${primarySibsin}"입니다!`,
      position: { top: "20%", left: "45%" },
      size: "large",
      direction: "bottom-left",
      backgroundColor: "#e8f4fd",
      borderColor: "#0066cc",
    },
    {
      text: `${personality}을 가지고 계시네요.\n이는 매우 특별한 재능입니다.`,
      position: { top: "65%", left: "55%" },
      size: "medium",
      direction: "top-right",
      backgroundColor: "#ffffff",
      borderColor: "#333",
    },
  ];

  return {
    backgroundImage: "/assets/images/consultation/section2/base.png",
    characterImages: [DEFAULT_CHARACTER],
    speechBubbles,
  };
};

/**
 * 섹션 3: 오행 균형 분석 생성
 */
export const generateSection3Content = (consultation) => {
  const {
    woodCount,
    fireCount,
    earthCount,
    metalCount,
    waterCount,
    dominantElement,
  } = consultation;
  const elements = {
    木: woodCount,
    火: fireCount,
    土: earthCount,
    金: metalCount,
    水: waterCount,
  };
  const dominant = dominantElement || "木";
  const dominantCharacteristic =
    ELEMENT_CHARACTERISTICS[dominant] || "균형의 에너지";

  const speechBubbles = [
    {
      text: `오행 분석 결과를 알려드릴게요!\n가장 강한 오행은 "${dominant}"입니다.`,
      position: { top: "25%", left: "40%" },
      size: "large",
      direction: "bottom-right",
      backgroundColor: "#f0f8e8",
      borderColor: "#4a7c59",
    },
    {
      text: `이는 ${dominantCharacteristic}를\n나타냅니다. 정말 멋지네요!`,
      position: { top: "70%", left: "65%" },
      size: "medium",
      direction: "top-left",
      backgroundColor: "#ffffff",
      borderColor: "#333",
    },
  ];

  return {
    backgroundImage: "/assets/images/consultation/section3/base.png",
    characterImages: [DEFAULT_CHARACTER],
    speechBubbles,
  };
};

/**
 * 섹션 4: 성격 분석 생성
 */
export const generateSection4Content = (consultation) => {
  const mbti = consultation.additionalData?.mbti;
  const mbtiDesc = mbti ? MBTI_CHARACTERISTICS[mbti] : "독특하고 매력적인 성향";
  const name = consultation.additionalData?.name || "고객";

  const speechBubbles = [
    {
      text: `${name}님의 성격을 분석해보니\n정말 흥미로운 분이시네요!`,
      position: { top: "20%", left: "50%" },
      size: "large",
      direction: "bottom-left",
      backgroundColor: "#fce4ec",
      borderColor: "#e91e63",
    },
    {
      text: mbti
        ? `${mbti} - ${mbtiDesc}의\n특성을 가지고 계십니다.`
        : "균형잡힌 성격의 소유자시네요!",
      position: { top: "60%", left: "55%" },
      size: "medium",
      direction: "top-right",
      backgroundColor: "#ffffff",
      borderColor: "#333",
    },
  ];

  return {
    backgroundImage: "/assets/images/consultation/section4/base.png",
    characterImages: [DEFAULT_CHARACTER],
    speechBubbles,
  };
};

/**
 * 섹션 5: 운세 해석 생성
 */
export const generateSection5Content = (consultation) => {
  const year = new Date().getFullYear();
  const name = consultation.additionalData?.name || "고객";

  const speechBubbles = [
    {
      text: `${name}님의 ${year}년 운세를\n해석해드릴게요!`,
      position: { top: "15%", left: "45%" },
      size: "large",
      direction: "bottom-left",
      backgroundColor: "#fff8e1",
      borderColor: "#ff9800",
    },
    {
      text: `전체적으로 좋은 흐름을 타고\n계시네요. 특히 하반기가\n기대됩니다!`,
      position: { top: "65%", left: "60%" },
      size: "medium",
      direction: "top-left",
      backgroundColor: "#ffffff",
      borderColor: "#333",
    },
  ];

  return {
    backgroundImage: "/assets/images/consultation/section5/base.png",
    characterImages: [DEFAULT_CHARACTER],
    speechBubbles,
  };
};

/**
 * 섹션 6: 조언 및 가이드 생성
 */
export const generateSection6Content = (consultation) => {
  const name = consultation.additionalData?.name || "고객";
  const dominantElement = consultation.dominantElement || "木";

  let advice = "";
  switch (dominantElement) {
    case "木":
      advice = "성장을 위한 도전을 두려워하지 마세요.";
      break;
    case "火":
      advice = "열정을 조절하며 지속가능한 발전을 추구하세요.";
      break;
    case "土":
      advice = "안정감을 바탕으로 새로운 기회를 포착하세요.";
      break;
    case "金":
      advice = "원칙을 지키면서도 유연함을 발휘하세요.";
      break;
    case "水":
      advice = "지혜롭게 상황을 판단하고 적절히 행동하세요.";
      break;
    default:
      advice = "균형잡힌 마음으로 모든 일에 임하세요.";
  }

  const speechBubbles = [
    {
      text: `${name}님께 드리는\n토리의 특별한 조언입니다!`,
      position: { top: "20%", left: "40%" },
      size: "large",
      direction: "bottom-right",
      backgroundColor: "#e3f2fd",
      borderColor: "#2196f3",
    },
    {
      text: advice,
      position: { top: "60%", left: "55%" },
      size: "medium",
      direction: "top-left",
      backgroundColor: "#ffffff",
      borderColor: "#333",
    },
  ];

  return {
    backgroundImage: "/assets/images/consultation/section6/base.png",
    characterImages: [DEFAULT_CHARACTER],
    speechBubbles,
  };
};

/**
 * 섹션 7: 종합 결론 생성
 */
export const generateSection7Content = (consultation) => {
  const name = consultation.additionalData?.name || "고객";

  const speechBubbles = [
    {
      text: `${name}님, 토리와 함께한\n운명 여행은 어떠셨나요?`,
      position: { top: "20%", left: "45%" },
      size: "large",
      direction: "bottom-left",
      backgroundColor: "#f3e5f5",
      borderColor: "#9c27b0",
    },
    {
      text: `여러분의 인생에 행복과\n성공이 함께하길 바랍니다!\n언제든 토리의 찻집으로 오세요.`,
      position: { top: "65%", left: "50%" },
      size: "medium",
      direction: "top-right",
      backgroundColor: "#ffffff",
      borderColor: "#333",
    },
  ];

  return {
    backgroundImage: "/assets/images/consultation/section7/base.png",
    characterImages: [DEFAULT_CHARACTER],
    speechBubbles,
  };
};

/**
 * 메인 콘텐츠 생성 함수
 */
export const generateSectionContent = (consultation, sectionNumber) => {
  switch (sectionNumber) {
    case 1:
      return generateSection1Content(consultation);
    case 2:
      return generateSection2Content(consultation);
    case 3:
      return generateSection3Content(consultation);
    case 4:
      return generateSection4Content(consultation);
    case 5:
      return generateSection5Content(consultation);
    case 6:
      return generateSection6Content(consultation);
    case 7:
      return generateSection7Content(consultation);
    default:
      return {
        backgroundImage: null,
        characterImages: [DEFAULT_CHARACTER],
        speechBubbles: [
          {
            text: "준비 중인 섹션입니다.",
            position: { top: "50%", left: "50%" },
            size: "medium",
          },
        ],
      };
  }
};
