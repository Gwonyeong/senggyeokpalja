// 서버사이드용 manseryeok 라이브러리 사용 유틸리티
import { calculateFourPillars } from 'manseryeok';

export function calculateSajuForServer(birthDate, timeIndex, isLunar = false) {
  // timeIndex를 시간으로 변환
  let hour = 6; // 기본값: 오시(6)
  let minute = 0;

  if (timeIndex !== 6 && timeIndex !== undefined && timeIndex !== 'unknown') {
    // timeIndex를 실제 시간으로 변환
    if (timeIndex === 0) {
      hour = 0;
    } else {
      hour = timeIndex * 2;
    }
  }

  // manseryeok 라이브러리를 위한 생년월일시 정보 구성
  const birthInfo = {
    year: birthDate.getFullYear(),
    month: birthDate.getMonth() + 1, // JavaScript는 0부터 시작하므로 +1
    day: birthDate.getDate(),
    hour: hour,
    minute: minute,
    isLunar: isLunar
  };

  // manseryeok 라이브러리로 사주팔자 계산
  const fourPillars = calculateFourPillars(birthInfo);

  // 기존 형식에 맞게 변환
  const convertPillar = (pillar, element, yinYang) => ({
    han: pillar.heavenlyStem === '갑' ? '甲' :
         pillar.heavenlyStem === '을' ? '乙' :
         pillar.heavenlyStem === '병' ? '丙' :
         pillar.heavenlyStem === '정' ? '丁' :
         pillar.heavenlyStem === '무' ? '戊' :
         pillar.heavenlyStem === '기' ? '己' :
         pillar.heavenlyStem === '경' ? '庚' :
         pillar.heavenlyStem === '신' ? '辛' :
         pillar.heavenlyStem === '임' ? '壬' :
         pillar.heavenlyStem === '계' ? '癸' : pillar.heavenlyStem,
    kor: pillar.heavenlyStem,
    ohaeng: element.stem === '목' ? '木' :
           element.stem === '화' ? '火' :
           element.stem === '토' ? '土' :
           element.stem === '금' ? '金' :
           element.stem === '수' ? '水' : element.stem,
    eumYang: yinYang.stem === '양' ? '陽' : '陰'
  });

  const convertBranch = (pillar, element, yinYang) => ({
    han: pillar.earthlyBranch === '자' ? '子' :
         pillar.earthlyBranch === '축' ? '丑' :
         pillar.earthlyBranch === '인' ? '寅' :
         pillar.earthlyBranch === '묘' ? '卯' :
         pillar.earthlyBranch === '진' ? '辰' :
         pillar.earthlyBranch === '사' ? '巳' :
         pillar.earthlyBranch === '오' ? '午' :
         pillar.earthlyBranch === '미' ? '未' :
         pillar.earthlyBranch === '신' ? '申' :
         pillar.earthlyBranch === '유' ? '酉' :
         pillar.earthlyBranch === '술' ? '戌' :
         pillar.earthlyBranch === '해' ? '亥' : pillar.earthlyBranch,
    kor: pillar.earthlyBranch,
    ohaeng: element.branch === '목' ? '木' :
           element.branch === '화' ? '火' :
           element.branch === '토' ? '土' :
           element.branch === '금' ? '金' :
           element.branch === '수' ? '水' : element.branch,
    eumYang: yinYang.branch === '양' ? '陽' : '陰'
  });

  // 기존 포맷으로 변환
  const palja = {
    yunju: {
      gan: convertPillar(fourPillars.year, fourPillars.yearElement, fourPillars.yearYinYang),
      ji: convertBranch(fourPillars.year, fourPillars.yearElement, fourPillars.yearYinYang)
    },
    wolju: {
      gan: convertPillar(fourPillars.month, fourPillars.monthElement, fourPillars.monthYinYang),
      ji: convertBranch(fourPillars.month, fourPillars.monthElement, fourPillars.monthYinYang)
    },
    ilju: {
      gan: convertPillar(fourPillars.day, fourPillars.dayElement, fourPillars.dayYinYang),
      ji: convertBranch(fourPillars.day, fourPillars.dayElement, fourPillars.dayYinYang)
    },
    siju: {
      gan: convertPillar(fourPillars.hour, fourPillars.hourElement, fourPillars.hourYinYang),
      ji: convertBranch(fourPillars.hour, fourPillars.hourElement, fourPillars.hourYinYang)
    }
  };

  // 오행 개수 계산
  const ohaengCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  Object.values(palja).forEach(ju => {
    ohaengCount[ju.gan.ohaeng] = (ohaengCount[ju.gan.ohaeng] || 0) + 1;
    ohaengCount[ju.ji.ohaeng] = (ohaengCount[ju.ji.ohaeng] || 0) + 1;
  });

  // 일간 정보
  const ilgan = palja.ilju.gan;

  // 지지 기반 십신 계산
  const calculateJijiSibsin = (palja, ilgan) => {
    const jiInfo = {
      "子": { ohaeng: "水", eumYang: "陽" },
      "丑": { ohaeng: "土", eumYang: "陰" },
      "寅": { ohaeng: "木", eumYang: "陽" },
      "卯": { ohaeng: "木", eumYang: "陰" },
      "辰": { ohaeng: "土", eumYang: "陽" },
      "巳": { ohaeng: "火", eumYang: "陽" },
      "午": { ohaeng: "火", eumYang: "陰" },
      "未": { ohaeng: "土", eumYang: "陰" },
      "申": { ohaeng: "金", eumYang: "陽" },
      "酉": { ohaeng: "金", eumYang: "陰" },
      "戌": { ohaeng: "土", eumYang: "陽" },
      "亥": { ohaeng: "水", eumYang: "陰" }
    };

    const ohaengSaeng = { '水': '木', '木': '火', '火': '土', '土': '金', '金': '水' };
    const ohaengGeuk = { '水': '火', '火': '金', '金': '木', '木': '土', '土': '水' };

    const sibsinCount = {};
    const ilganOhaeng = ilgan.ohaeng;
    const ilganEumYang = ilgan.eumYang;

    // 4개의 지지 (연지, 월지, 일지, 시지)에서 십신 계산
    const jijiList = [
      palja.yunju?.ji,
      palja.wolju?.ji,
      palja.ilju?.ji,
      palja.siju?.ji
    ].filter(ji => ji && ji.han);

    jijiList.forEach(ji => {
      const jiOhaeng = jiInfo[ji.han]?.ohaeng;
      const jiEumYang = jiInfo[ji.han]?.eumYang;

      if (!jiOhaeng) return;

      let sibsinType = null;

      // 일간과의 관계로 십신 결정
      if (jiOhaeng === ilganOhaeng) {
        // 같은 오행
        sibsinType = (jiEumYang === ilganEumYang) ? "비견" : "겁재";
      } else if (ohaengSaeng[ilganOhaeng] === jiOhaeng) {
        // 일간이 생하는 오행 (생출)
        sibsinType = (jiEumYang === ilganEumYang) ? "식신" : "상관";
      } else if (ohaengGeuk[ilganOhaeng] === jiOhaeng) {
        // 일간이 극하는 오행 (극출)
        sibsinType = (jiEumYang === ilganEumYang) ? "편재" : "정재";
      } else if (ohaengGeuk[jiOhaeng] === ilganOhaeng) {
        // 일간을 극하는 오행 (극입)
        sibsinType = (jiEumYang === ilganEumYang) ? "편관" : "정관";
      } else if (ohaengSaeng[jiOhaeng] === ilganOhaeng) {
        // 일간을 생하는 오행 (생입)
        sibsinType = (jiEumYang === ilganEumYang) ? "편인" : "정인";
      }

      if (sibsinType) {
        sibsinCount[sibsinType] = (sibsinCount[sibsinType] || 0) + 1;
      }
    });

    return sibsinCount;
  };

  const jijiSibsinInfo = calculateJijiSibsin(palja, ilgan);

  // 가장 관련 깊은 십신 찾기
  const findPrimarySibsin = (sibsin, ohaeng, ilgan) => {
    const sibsinMeaning = {
      "비견": { priority: 5, meaning: "자아, 독립성, 경쟁심", element: "동일" },
      "겁재": { priority: 5, meaning: "경쟁, 도전, 야망", element: "동일" },
      "식신": { priority: 3, meaning: "재능, 표현력, 창조성", element: "생출" },
      "상관": { priority: 3, meaning: "비판력, 개혁성, 독창성", element: "생출" },
      "정재": { priority: 2, meaning: "안정적 재물, 계획성", element: "극출" },
      "편재": { priority: 2, meaning: "투자, 사업, 모험", element: "극출" },
      "정관": { priority: 1, meaning: "명예, 권위, 책임감", element: "극입" },
      "편관": { priority: 1, meaning: "권력, 추진력, 결단력", element: "극입" },
      "정인": { priority: 4, meaning: "학문, 지혜, 인덕", element: "생입" },
      "편인": { priority: 4, meaning: "특수재능, 종교성, 예술성", element: "생입" }
    };

    let maxCount = 0;
    let primarySibsin = null;

    for (const [key, value] of Object.entries(sibsin)) {
      if (value > maxCount) {
        maxCount = value;
        primarySibsin = key;
      } else if (value === maxCount && primarySibsin) {
        if (sibsinMeaning[key].priority < sibsinMeaning[primarySibsin].priority) {
          primarySibsin = key;
        }
      }
    }

    if (!primarySibsin || maxCount === 0) {
      const ohaengTotal = Object.values(ohaeng).reduce((sum, val) => sum + val, 0);
      const ilganOhaeng = ilgan.ohaeng;
      const ilganOhaengCount = ohaeng[ilganOhaeng] || 0;

      if (ilganOhaengCount > ohaengTotal / 5) {
        primarySibsin = ilgan.eumYang === "陽" ? "식신" : "상관";
      } else {
        primarySibsin = ilgan.eumYang === "陽" ? "정인" : "편인";
      }
    }

    return {
      name: primarySibsin,
      count: sibsin[primarySibsin] || 0,
      meaning: sibsinMeaning[primarySibsin]?.meaning || "운명의 길",
      description: `${primarySibsin}(${sibsinMeaning[primarySibsin]?.meaning || ""})이 당신의 핵심 성향입니다.`
    };
  };

  const primarySibsin = findPrimarySibsin(jijiSibsinInfo, ohaengCount, ilgan);

  // fourPillars 객체에서 함수들을 제거하고 순수 데이터만 추출
  const cleanFourPillars = {
    year: {
      heavenlyStem: fourPillars.year.heavenlyStem,
      earthlyBranch: fourPillars.year.earthlyBranch
    },
    month: {
      heavenlyStem: fourPillars.month.heavenlyStem,
      earthlyBranch: fourPillars.month.earthlyBranch
    },
    day: {
      heavenlyStem: fourPillars.day.heavenlyStem,
      earthlyBranch: fourPillars.day.earthlyBranch
    },
    hour: {
      heavenlyStem: fourPillars.hour.heavenlyStem,
      earthlyBranch: fourPillars.hour.earthlyBranch
    },
    yearElement: fourPillars.yearElement,
    monthElement: fourPillars.monthElement,
    dayElement: fourPillars.dayElement,
    hourElement: fourPillars.hourElement,
    yearYinYang: fourPillars.yearYinYang,
    monthYinYang: fourPillars.monthYinYang,
    dayYinYang: fourPillars.dayYinYang,
    hourYinYang: fourPillars.hourYinYang
  };

  return {
    palja: palja,
    ilgan: ilgan,
    ohaeng: ohaengCount,
    sibsin: jijiSibsinInfo,
    primarySibsin: primarySibsin,
    fourPillars: cleanFourPillars, // 함수가 제거된 순수 데이터
    birthInfo: birthInfo // 입력 정보도 포함
  };
}