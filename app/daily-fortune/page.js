"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import styles from "./DailyFortune.module.css";
import { createClient } from "@/lib/supabase";

export default function DailyFortunePage() {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [fortune, setFortune] = useState(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [showBirthDateModal, setShowBirthDateModal] = useState(false);
  const [hasBirthDate, setHasBirthDate] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 프로필 정보 가져오기
          const response = await fetch("/api/auth/profile");
          const data = await response.json();

          if (data.success && data.profile) {
            // birthDate가 있는지 확인
            setHasBirthDate(!!data.profile.birthDate);
            setUserProfile(data.profile);
          }

          // DB에서 오늘의 운세 데이터 확인
          const fortuneResponse = await fetch("/api/daily-fortune");
          const fortuneData = await fortuneResponse.json();

          if (fortuneData.success && fortuneData.data) {
            // DB에 저장된 운세가 있으면 사용
            setFortune(fortuneData.data.fortuneData);
            setIsFlipped(true);
            setShowContent(true);
            setHasViewed(true);
          } else {
            // DB에 저장된 운세가 없으면 새로운 운세 생성 준비
            setHasViewed(false);
            setIsFlipped(false);
            setShowContent(false);
            setShowGif(false);
          }
        } else {
          // 로그인하지 않은 사용자도 기본 상태로 설정 (카드 클릭 시 운세 생성)
          setHasViewed(false);
          setIsFlipped(false);
          setShowContent(false);
          setShowGif(false);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

    checkUserProfile();
  }, []);

  const generateDailyFortune = () => {
    const fortunes = [
      {
        title: "대길(大吉)",
        description: "오늘은 당신에게 큰 행운이 찾아오는 날입니다.",
        general:
          "모든 일이 순조롭게 풀리는 하루입니다. 적극적인 태도로 임하세요.",
        love: "새로운 인연을 만날 수 있는 좋은 기회가 찾아옵니다. 마음을 열어보세요.",
        career: "업무에서 큰 성과를 거둘 수 있는 날입니다. 자신감을 가지세요.",
        wealth: "예상치 못한 재물운이 따를 것입니다. 투자에 신중을 기하세요.",
        health: "활력이 넘치는 하루입니다. 운동을 시작하기 좋은 시기입니다.",
        advice:
          "자신감을 가지고 적극적으로 행동하세요. 주변에 감사를 표현하는 것도 잊지 마세요.",
        luckyNumber: 7,
        luckyColor: "금색",
        luckyDirection: "남쪽",
      },
      {
        title: "중길(中吉)",
        description: "평온하고 안정적인 하루가 될 것입니다.",
        general: "차분하게 일상을 보내며 내면을 돌아보기 좋은 날입니다.",
        love: "기존 관계가 더욱 돈독해지는 시간입니다. 진심을 전하세요.",
        career: "꾸준한 노력이 인정받는 날입니다. 묵묵히 자신의 일을 하세요.",
        wealth:
          "절약하면 미래에 큰 도움이 될 것입니다. 계획적인 소비를 하세요.",
        health: "규칙적인 생활 리듬을 유지하세요. 충분한 휴식이 필요합니다.",
        advice: "차분한 마음으로 일상을 즐기세요. 작은 행복에 감사하세요.",
        luckyNumber: 3,
        luckyColor: "파란색",
        luckyDirection: "동쪽",
      },
      {
        title: "소길(小吉)",
        description: "작은 행운들이 모여 큰 기쁨을 만들어낼 것입니다.",
        general: "소소한 일상 속에서 의미를 찾는 하루가 될 것입니다.",
        love: "소소한 일상에서 행복을 찾을 수 있습니다. 함께하는 시간을 소중히 하세요.",
        career: "작은 성취가 쌓여 큰 결과로 이어집니다. 꾸준함이 중요합니다.",
        wealth:
          "충동구매를 자제하고 계획적으로 소비하세요. 저축의 중요성을 느끼게 됩니다.",
        health: "가벼운 산책이나 스트레칭으로 몸을 움직이세요.",
        advice:
          "작은 것에 감사하는 마음을 가지세요. 긍정적인 생각이 행운을 부릅니다.",
        luckyNumber: 5,
        luckyColor: "초록색",
        luckyDirection: "서쪽",
      },
    ];

    // 날짜 기반으로 운세 선택 (매일 다른 운세)
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );
    const fortuneIndex = dayOfYear % fortunes.length;

    return fortunes[fortuneIndex];
  };

  // 십신 의미 헬퍼 함수 (consultation과 동일)
  const getSibsinMeaning = (sibsinName) => {
    const meanings = {
      비견: "자아, 독립성, 경쟁심",
      겁재: "경쟁, 도전, 야망",
      식신: "재능, 표현력, 창조성",
      상관: "비판력, 개혁성, 독창성",
      편재: "투자, 사업, 모험",
      정재: "안정적 재물, 계획성",
      편관: "권력, 추진력, 결단력",
      정관: "명예, 권위, 책임감",
      편인: "특수재능, 종교성, 예술성",
      정인: "학문, 지혜, 인덕",
    };
    return meanings[sibsinName] || "운명의 길";
  };

  // 오행 분석 함수
  const analyzeOhaeng = (ohaeng) => {
    const ohaengNames = {
      木: "목(木)",
      火: "화(火)",
      土: "토(土)",
      金: "금(金)",
      水: "수(水)",
    };

    const ohaengMeanings = {
      木: "성장, 창조, 유연성",
      火: "열정, 활력, 확산",
      土: "안정, 신용, 중재",
      金: "질서, 정의, 수렴",
      水: "지혜, 적응, 유동",
    };

    // 총 개수 계산
    const total = Object.values(ohaeng).reduce((sum, count) => sum + count, 0);

    // 가장 많은 오행 찾기
    let maxCount = 0;
    let dominantOhaeng = null;

    for (const [element, count] of Object.entries(ohaeng)) {
      if (count > maxCount) {
        maxCount = count;
        dominantOhaeng = element;
      }
    }

    // 오행별 분포 계산
    const distribution = {};
    for (const [element, count] of Object.entries(ohaeng)) {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      distribution[element] = {
        count,
        percentage,
        name: ohaengNames[element] || element,
        meaning: ohaengMeanings[element] || "알 수 없음",
      };
    }

    return {
      total,
      dominantOhaeng: dominantOhaeng
        ? {
            element: dominantOhaeng,
            name: ohaengNames[dominantOhaeng],
            count: maxCount,
            percentage: total > 0 ? Math.round((maxCount / total) * 100) : 0,
            meaning: ohaengMeanings[dominantOhaeng],
          }
        : null,
      distribution,
    };
  };

  // 오늘의 일진 계산 함수
  const calculateTodayIljin = () => {
    const today = new Date();

    // 60갑자 순환 계산 (간단한 방식)
    const startDate = new Date(1900, 0, 1); // 기준일
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const gapjaIndex = daysDiff % 60;

    // 60갑자 배열
    const cheongan = [
      "갑",
      "을",
      "병",
      "정",
      "무",
      "기",
      "경",
      "신",
      "임",
      "계",
    ];
    const jiji = [
      "자",
      "축",
      "인",
      "묘",
      "진",
      "사",
      "오",
      "미",
      "신",
      "유",
      "술",
      "해",
    ];

    const ganIndex = gapjaIndex % 10;
    const jiIndex = gapjaIndex % 12;

    // 천간을 한자로 변환
    const ganToHan = {
      갑: "甲",
      을: "乙",
      병: "丙",
      정: "丁",
      무: "戊",
      기: "己",
      경: "庚",
      신: "辛",
      임: "壬",
      계: "癸",
    };

    // 지지를 한자로 변환
    const jiToHan = {
      자: "子",
      축: "丑",
      인: "寅",
      묘: "卯",
      진: "辰",
      사: "巳",
      오: "午",
      미: "未",
      신: "申",
      유: "酉",
      술: "戌",
      해: "亥",
    };

    // 천간 오행 매핑
    const ganOhaeng = {
      갑: "木",
      을: "木",
      병: "火",
      정: "火",
      무: "土",
      기: "土",
      경: "金",
      신: "金",
      임: "水",
      계: "水",
    };

    // 천간 음양 매핑
    const ganEumYang = {
      갑: "陽",
      을: "陰",
      병: "陽",
      정: "陰",
      무: "陽",
      기: "陰",
      경: "陽",
      신: "陰",
      임: "陽",
      계: "陰",
    };

    const ganKor = cheongan[ganIndex];
    const jiKor = jiji[jiIndex];

    return {
      gan: {
        kor: ganKor,
        han: ganToHan[ganKor],
        ohaeng: ganOhaeng[ganKor],
        eumYang: ganEumYang[ganKor],
      },
      ji: {
        kor: jiKor,
        han: jiToHan[jiKor],
      },
      gapja: `${ganKor}${jiKor}`,
      gapjaHan: `${ganToHan[ganKor]}${jiToHan[jiKor]}`,
    };
  };

  // 원국 격국 판단 함수
  const analyzeWongukGeokguk = (sajuData) => {
    if (!sajuData.sibsin || !sajuData.palja) {
      return null;
    }

    const sibsin = sajuData.sibsin;
    const ilgan = sajuData.palja.ilju.gan;

    // 십신별 개수
    const sibsinCounts = Object.entries(sibsin).filter(
      ([_, count]) => count > 0
    );

    // 가장 많은 십신 찾기 (일간 제외한 나머지 십신 중)
    let dominantSibsin = null;
    let maxCount = 0;

    Object.entries(sibsin).forEach(([sibsinName, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantSibsin = sibsinName;
      }
    });

    // 격국 판단 로직
    let geokguk = "잡격"; // 기본값
    let geokgukScore = 0;

    if (dominantSibsin && maxCount >= 2) {
      switch (dominantSibsin) {
        case "식신":
          geokguk = "식신격";
          geokgukScore = sibsin["식신"] * 5; // 식신 개수에 비례
          break;
        case "상관":
          geokguk = "상관격";
          geokgukScore = sibsin["상관"] * 5;
          break;
        case "정재":
        case "편재":
          geokguk = "재격";
          geokgukScore = (sibsin["정재"] + sibsin["편재"]) * 5;
          break;
        case "정관":
        case "편관":
          geokguk = "관격";
          geokgukScore = (sibsin["정관"] + sibsin["편관"]) * 5;
          break;
        case "정인":
        case "편인":
          geokguk = "인격";
          geokgukScore = (sibsin["정인"] + sibsin["편인"]) * 5;
          break;
        case "비견":
        case "겁재":
          geokguk = "양인격";
          geokgukScore = (sibsin["비견"] + sibsin["겁재"]) * 3;
          break;
      }
    }

    return {
      geokguk,
      dominantSibsin,
      maxCount,
      geokgukScore,
      sibsinCounts,
    };
  };

  // 용신 분석 함수
  const analyzeYongsin = (sajuData, heesinGisinResult) => {
    if (!sajuData || !heesinGisinResult) {
      return null;
    }

    const ilgan = sajuData.palja.ilju.gan;
    const ohaeng = sajuData.ohaeng;
    const isIlganStrong = heesinGisinResult.isIlganStrong;

    let yongsin = [];
    let gisin = [];

    // 기본적인 용신 찾기 로직
    if (isIlganStrong) {
      // 일간이 강할 때: 일간을 약하게 하는 오행이 용신
      Object.entries(heesinGisinResult.heesinGisinAnalysis).forEach(
        ([element, analysis]) => {
          if (analysis.type === "희신") {
            yongsin.push({
              element,
              reason: "일간이 강하므로 약하게 하는 오행",
              priority: 1,
            });
          } else if (analysis.type === "기신") {
            gisin.push({
              element,
              reason: "일간이 강할 때 더 강하게 하는 오행",
              priority: 1,
            });
          }
        }
      );
    } else {
      // 일간이 약할 때: 일간을 강하게 하는 오행이 용신
      Object.entries(heesinGisinResult.heesinGisinAnalysis).forEach(
        ([element, analysis]) => {
          if (analysis.type === "희신") {
            yongsin.push({
              element,
              reason: "일간이 약하므로 강하게 하는 오행",
              priority: 1,
            });
          } else if (analysis.type === "기신") {
            gisin.push({
              element,
              reason: "일간이 약할 때 더 약하게 하는 오행",
              priority: 1,
            });
          }
        }
      );
    }

    return {
      yongsin,
      gisin,
      isIlganStrong,
    };
  };

  // 원국 특성 분석 함수
  const analyzeWongukCharacteristics = (
    sajuData,
    heesinGisinResult,
    todayIljin
  ) => {
    if (!sajuData || !heesinGisinResult || !todayIljin) {
      return null;
    }

    // 격국 분석
    const geokgukResult = analyzeWongukGeokguk(sajuData);

    // 용신 분석
    const yongsinResult = analyzeYongsin(sajuData, heesinGisinResult);

    let totalScore = 0;
    let analysisDetails = [];

    // 1. 격국 유지 여부 분석
    if (geokgukResult && geokgukResult.geokguk !== "잡격") {
      const todayOhaeng = todayIljin.gan.ohaeng;
      let geokgukScore = 0;
      let geokgukReason = "";

      // 오늘 일진이 격국에 미치는 영향 분석
      switch (geokgukResult.geokguk) {
        case "식신격":
          // 식신격인 경우, 오늘 일진이 식신을 생조하면 +10, 극제하면 -10
          if (todayOhaeng === sajuData.palja.ilju.gan.ohaeng) {
            geokgukScore = 10;
            geokgukReason = "식신격 강화 (일간과 같은 오행)";
          } else {
            // 기타 복잡한 로직은 간소화
            geokgukScore = 0;
            geokgukReason = "격국에 중립적 영향";
          }
          break;
        case "재격":
          // 재격인 경우
          if (
            ["木", "火"].includes(todayOhaeng) &&
            sajuData.palja.ilju.gan.ohaeng === "土"
          ) {
            geokgukScore = 10;
            geokgukReason = "재격 강화 (재성 생조)";
          } else {
            geokgukScore = 0;
            geokgukReason = "격국에 중립적 영향";
          }
          break;
        default:
          geokgukScore = 0;
          geokgukReason = "격국 분석 불가";
      }

      totalScore += geokgukScore;
      analysisDetails.push({
        type: "격국 유지",
        score: geokgukScore,
        reason: geokgukReason,
        detail: `${geokgukResult.geokguk} × 오늘 일진 ${todayIljin.gapja}`,
      });
    }

    // 2. 용신 작용 분석
    if (yongsinResult && yongsinResult.yongsin.length > 0) {
      const todayOhaeng = todayIljin.gan.ohaeng;
      let yongsinScore = 0;
      let yongsinReason = "";

      // 오늘 일진이 용신에 미치는 영향
      const isYongsinElement = yongsinResult.yongsin.some(
        (y) => y.element === todayOhaeng
      );
      const isGisinElement = yongsinResult.gisin.some(
        (g) => g.element === todayOhaeng
      );

      if (isYongsinElement) {
        yongsinScore = 10;
        yongsinReason = "용신 강화 (오늘 일진이 용신과 같은 오행)";
      } else if (isGisinElement) {
        yongsinScore = -10;
        yongsinReason = "용신 극제 (오늘 일진이 기신과 같은 오행)";
      } else {
        yongsinScore = 0;
        yongsinReason = "용신과 무관계";
      }

      totalScore += yongsinScore;
      analysisDetails.push({
        type: "용신 작용",
        score: yongsinScore,
        reason: yongsinReason,
        detail: `용신: ${yongsinResult.yongsin
          .map((y) => y.element)
          .join(", ")}`,
      });
    }

    // 3. 원국 구조와 조화 분석 (간단한 생극 순환 분석)
    const structureScore = analyzeStructuralHarmony(sajuData, todayIljin);
    totalScore += structureScore.score;
    analysisDetails.push(structureScore);

    return {
      totalScore,
      analysisDetails,
      geokgukResult,
      yongsinResult,
    };
  };

  // 원국 구조와 조화 분석 함수
  const analyzeStructuralHarmony = (sajuData, todayIljin) => {
    const ilgan = sajuData.palja.ilju.gan;
    const todayOhaeng = todayIljin.gan.ohaeng;
    const ohaeng = sajuData.ohaeng;

    // 오행 상생 순환 분석
    const ohaengSaeng = { 水: "木", 木: "火", 火: "土", 土: "金", 金: "水" };

    let score = 0;
    let reason = "";

    // 원국에서 가장 부족한 오행 찾기
    let minElement = null;
    let minCount = Infinity;
    Object.entries(ohaeng).forEach(([element, count]) => {
      if (count < minCount) {
        minCount = count;
        minElement = element;
      }
    });

    // 오늘 일진이 부족한 오행을 보충하는지 확인
    if (todayOhaeng === minElement) {
      score = 10;
      reason = "원국의 부족한 오행 보충";
    } else if (ohaengSaeng[todayOhaeng] === minElement) {
      score = 5;
      reason = "원국의 부족한 오행을 간접 생조";
    } else {
      // 과잉 오행을 더 강화하는지 확인
      let maxElement = null;
      let maxCount = 0;
      Object.entries(ohaeng).forEach(([element, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxElement = element;
        }
      });

      if (todayOhaeng === maxElement && maxCount >= 3) {
        score = -10;
        reason = "과잉 오행 더욱 강화 (불균형 심화)";
      } else {
        score = 0;
        reason = "구조에 중립적 영향";
      }
    }

    return {
      type: "원국 구조 조화",
      score,
      reason,
      detail: `부족 오행: ${minElement}(${minCount}개), 오늘 일진: ${todayOhaeng}`,
    };
  };

  // 일진 조화 분석 함수 (사용자 일간과 오늘 일진의 십신 관계)
  const analyzeIljinHarmony = (userIlgan, todayIljin) => {
    if (!userIlgan || !todayIljin) {
      return null;
    }

    const ilganOhaeng = userIlgan.ohaeng;
    const ilganEumYang = userIlgan.eumYang;
    const iljinGanOhaeng = todayIljin.gan.ohaeng;
    const iljinGanEumYang = todayIljin.gan.eumYang;

    // 오행 상생/상극 관계
    const ohaengSaeng = { 水: "木", 木: "火", 火: "土", 土: "金", 金: "水" };
    const ohaengGeuk = { 水: "火", 火: "金", 金: "木", 木: "土", 土: "水" };

    let sibsinType = null;
    let score = 0;
    let description = "";

    // 사용자 일간과 오늘 일진의 관계로 십신 결정
    if (iljinGanOhaeng === ilganOhaeng) {
      // 같은 오행
      sibsinType = iljinGanEumYang === ilganEumYang ? "비견" : "겁재";
    } else if (ohaengSaeng[ilganOhaeng] === iljinGanOhaeng) {
      // 일간이 생하는 오행 (생출)
      sibsinType = iljinGanEumYang === ilganEumYang ? "식신" : "상관";
    } else if (ohaengGeuk[ilganOhaeng] === iljinGanOhaeng) {
      // 일간이 극하는 오행 (극출)
      sibsinType = iljinGanEumYang === ilganEumYang ? "편재" : "정재";
    } else if (ohaengGeuk[iljinGanOhaeng] === ilganOhaeng) {
      // 일간을 극하는 오행 (극입)
      sibsinType = iljinGanEumYang === ilganEumYang ? "편관" : "정관";
    } else if (ohaengSaeng[iljinGanOhaeng] === ilganOhaeng) {
      // 일간을 생하는 오행 (생입)
      sibsinType = iljinGanEumYang === ilganEumYang ? "편인" : "정인";
    }

    // 십신별 점수 및 설명 부여
    switch (sibsinType) {
      case "정인":
      case "식신":
      case "정재":
      case "정관":
        score = 10;
        description = "안정적, 생산적 관계 - 일간을 돕고 균형 유지";
        break;
      case "편인":
      case "편재":
      case "비견":
        score = 0;
        description = "중립 - 긍정/부정 혼재, 명식 따라 다름";
        break;
      case "상관":
      case "편관":
      case "겁재":
        score = -10;
        description = "충돌, 불균형 - 일간을 약화시키거나 극함";
        break;
      default:
        score = 0;
        description = "관계 없음";
    }

    return {
      sibsinType,
      score,
      description,
      todayIljin,
      userIlgan,
    };
  };

  // 희신/기신 판단 함수
  const analyzeHeesinGisin = (sajuData) => {
    if (!sajuData.palja || !sajuData.ohaeng || !sajuData.palja.ilju) {
      return null;
    }

    const ilgan = sajuData.palja.ilju.gan; // 일간 정보
    const ohaeng = sajuData.ohaeng; // 오행 개수
    const ilganOhaeng = ilgan.ohaeng; // 일간의 오행

    // 오행 상생/상극 관계
    const ohaengSaeng = { 水: "木", 木: "火", 火: "土", 土: "金", 金: "水" }; // 생하는 관계
    const ohaengGeuk = { 水: "火", 火: "金", 金: "木", 木: "土", 土: "水" }; // 극하는 관계

    // 일간 강약 판단 (간단한 로직: 같은 오행의 개수가 2개 이상이면 강함)
    const ilganCount = ohaeng[ilganOhaeng] || 0;
    const isIlganStrong = ilganCount >= 2;

    // 희신/기신 판단
    const heesinGisinAnalysis = {};

    Object.keys(ohaeng).forEach((element) => {
      let type = "보통"; // 기본값
      let score = 0;

      if (isIlganStrong) {
        // 일간이 강할 때: 일간을 약하게 하는 오행이 희신
        if (ohaengGeuk[element] === ilganOhaeng) {
          // 일간을 극하는 오행 = 희신
          type = "희신";
          score = 10;
        } else if (ohaengSaeng[ilganOhaeng] === element) {
          // 일간이 생하는 오행 = 희신
          type = "희신";
          score = 10;
        } else if (
          element === ilganOhaeng ||
          ohaengSaeng[element] === ilganOhaeng
        ) {
          // 일간과 같은 오행이나 일간을 생하는 오행 = 기신
          type = "기신";
          score = -10;
        }
      } else {
        // 일간이 약할 때: 일간을 강하게 하는 오행이 희신
        if (element === ilganOhaeng || ohaengSaeng[element] === ilganOhaeng) {
          // 일간과 같은 오행이나 일간을 생하는 오행 = 희신
          type = "희신";
          score = 10;
        } else if (
          ohaengGeuk[element] === ilganOhaeng ||
          ohaengSaeng[ilganOhaeng] === element
        ) {
          // 일간을 극하는 오행이나 일간이 생하는 오행 = 기신
          type = "기신";
          score = -10;
        }
      }

      heesinGisinAnalysis[element] = {
        type,
        score,
        count: ohaeng[element] || 0,
      };
    });

    return {
      ilgan: {
        ohaeng: ilganOhaeng,
        kor: ilgan.kor,
        han: ilgan.han,
        eumYang: ilgan.eumYang,
      },
      isIlganStrong,
      heesinGisinAnalysis,
      totalScore: Object.values(heesinGisinAnalysis).reduce(
        (total, analysis) => {
          return total + analysis.score * analysis.count;
        },
        0
      ),
    };
  };

  // 사용자의 주된 십신 계산 함수
  const calculateUserPrimarySibsin = async () => {
    if (!userProfile || !userProfile.birthDate) {
      console.log("프로필 정보가 부족합니다:", {
        hasProfile: !!userProfile,
        hasBirthDate: !!userProfile?.birthDate,
        hasBirthTime: !!userProfile?.birthTime,
      });
      return null;
    }

    try {
      const birthDate = new Date(userProfile.birthDate);

      // 생시를 시간 인덱스로 변환 (birthTime이 없으면 정오 12시로 처리)
      let hour = 12; // 기본값: 정오
      let minute = 0;

      if (userProfile.birthTime) {
        const birthTime = new Date(userProfile.birthTime);
        hour = birthTime.getHours();
        minute = birthTime.getMinutes();
      }

      let timeIndex = 6; // 기본값 오시 (정오)

      if (hour === 0 && minute >= 30) timeIndex = 0;
      else if (hour === 1 || (hour === 2 && minute < 30)) timeIndex = 0;
      else if ((hour === 2 && minute >= 30) || (hour === 3 && minute < 30))
        timeIndex = 1;
      else if ((hour === 3 && minute >= 30) || (hour === 4 && minute < 30))
        timeIndex = 1;
      else if ((hour === 4 && minute >= 30) || (hour === 5 && minute < 30))
        timeIndex = 2;
      else if ((hour === 5 && minute >= 30) || (hour === 6 && minute < 30))
        timeIndex = 2;
      else if ((hour === 6 && minute >= 30) || (hour === 7 && minute < 30))
        timeIndex = 3;
      else if ((hour === 7 && minute >= 30) || (hour === 8 && minute < 30))
        timeIndex = 3;
      else if ((hour === 8 && minute >= 30) || (hour === 9 && minute < 30))
        timeIndex = 4;
      else if ((hour === 9 && minute >= 30) || (hour === 10 && minute < 30))
        timeIndex = 4;
      else if ((hour === 10 && minute >= 30) || (hour === 11 && minute < 30))
        timeIndex = 5;
      else if ((hour === 11 && minute >= 30) || (hour === 12 && minute < 30))
        timeIndex = 5;
      else if ((hour === 12 && minute >= 30) || (hour === 13 && minute < 30))
        timeIndex = 6;
      else if ((hour === 13 && minute >= 30) || (hour === 14 && minute < 30))
        timeIndex = 6;
      else if ((hour === 14 && minute >= 30) || (hour === 15 && minute < 30))
        timeIndex = 7;
      else if ((hour === 15 && minute >= 30) || (hour === 16 && minute < 30))
        timeIndex = 7;
      else if ((hour === 16 && minute >= 30) || (hour === 17 && minute < 30))
        timeIndex = 8;
      else if ((hour === 17 && minute >= 30) || (hour === 18 && minute < 30))
        timeIndex = 8;
      else if ((hour === 18 && minute >= 30) || (hour === 19 && minute < 30))
        timeIndex = 9;
      else if ((hour === 19 && minute >= 30) || (hour === 20 && minute < 30))
        timeIndex = 9;
      else if ((hour === 20 && minute >= 30) || (hour === 21 && minute < 30))
        timeIndex = 10;
      else if ((hour === 21 && minute >= 30) || (hour === 22 && minute < 30))
        timeIndex = 10;
      else if ((hour === 22 && minute >= 30) || (hour === 23 && minute < 30))
        timeIndex = 11;
      else if (hour === 23 && minute >= 30) timeIndex = 0;

      // 서버 사주 계산 API 호출 (consultation과 동일한 로직)
      const response = await fetch("/api/saju/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birthDate: birthDate.toISOString(),
          timeIndex: timeIndex,
          isLunar: userProfile.calendar === "lunar",
        }),
      });

      if (!response.ok) {
        throw new Error("사주 계산 API 호출 실패");
      }

      const apiResult = await response.json();

      if (apiResult.success && apiResult.data) {
        const sajuData = apiResult.data;

        // consultation과 동일한 방식: 단순히 개수가 가장 많은 십신 찾기
        const dominantGod = Object.entries(sajuData.sibsin).reduce(
          (max, [god, value]) =>
            value > (max.value || 0) ? { god, value } : max,
          {}
        );

        // consultation과 동일한 형태로 주된 십신 정보 구성
        const primarySibsin = dominantGod.god
          ? {
              name: dominantGod.god,
              count: dominantGod.value,
              meaning: getSibsinMeaning(dominantGod.god),
              description: `${dominantGod.god}(${getSibsinMeaning(
                dominantGod.god
              )}) - ${dominantGod.value}개`,
            }
          : null;

        // 오행 분석 (서버에서 계산된 데이터 사용)
        const ohaengAnalysis = analyzeOhaeng(sajuData.ohaeng);

        // 희신/기신 분석
        const heesinGisinResult = analyzeHeesinGisin(sajuData);

        // 오늘의 일진 계산
        const todayIljin = calculateTodayIljin();

        // 일진 조화 분석 (사용자 일간과 오늘 일진의 관계)
        const iljinHarmonyResult = analyzeIljinHarmony(
          sajuData.palja.ilju.gan,
          todayIljin
        );

        // 원국 특성 분석 (격국, 용신, 구조 조화)
        const wongukResult = analyzeWongukCharacteristics(
          sajuData,
          heesinGisinResult,
          todayIljin
        );

        if (primarySibsin) {
          console.log("🔮 사용자의 주된 십신:", primarySibsin);

          // 오행 정보 출력
          console.log("🌟 오행 분석 결과:");
          console.log("├─ 주된 오행:", ohaengAnalysis.dominantOhaeng);
          console.log("├─ 전체 분포:", ohaengAnalysis.distribution);
          console.log("└─ 총 개수:", ohaengAnalysis.total);

          // 각 오행별 상세 정보
          console.log("📊 오행별 상세:");
          Object.entries(ohaengAnalysis.distribution).forEach(
            ([element, info]) => {
              if (info.count > 0) {
                console.log(
                  `   ${info.name}: ${info.count}개 (${info.percentage}%) - ${info.meaning}`
                );
              }
            }
          );

          // 희신/기신 분석 결과 출력
          if (heesinGisinResult) {
            console.log("\n🎯 희신/기신 분석 결과:");
            console.log(
              "├─ 일간:",
              `${heesinGisinResult.ilgan.kor}(${heesinGisinResult.ilgan.han}) - ${heesinGisinResult.ilgan.ohaeng} ${heesinGisinResult.ilgan.eumYang}`
            );
            console.log(
              "├─ 일간 강약:",
              heesinGisinResult.isIlganStrong ? "강함" : "약함"
            );
            console.log("└─ 희신/기신 분석:");

            // 기본 점수 70점에서 시작
            let totalScore = 70;

            Object.entries(heesinGisinResult.heesinGisinAnalysis).forEach(
              ([element, analysis]) => {
                if (analysis.count > 0) {
                  const elementScore = analysis.score * analysis.count;
                  totalScore += elementScore;

                  const ohaengNames = {
                    木: "목(木)",
                    火: "화(火)",
                    土: "토(土)",
                    金: "금(金)",
                    水: "수(水)",
                  };

                  console.log(
                    `   ${ohaengNames[element]}: ${analysis.type} (${
                      analysis.count
                    }개 × ${analysis.score}점 = ${
                      elementScore > 0 ? "+" : ""
                    }${elementScore}점)`
                  );
                }
              }
            );

            console.log(
              `\n🏆 임시 점수: ${totalScore}점 (기본 70점 + 희신/기신 보정)`
            );
            console.log(
              `   희신/기신 보정: ${
                heesinGisinResult.totalScore > 0 ? "+" : ""
              }${heesinGisinResult.totalScore}점`
            );
          }

          // 일진 조화 분석 결과 출력 및 최종 점수 계산
          let finalScore = heesinGisinResult
            ? 70 + heesinGisinResult.totalScore
            : 70;

          if (iljinHarmonyResult) {
            console.log("\n📅 일진 조화 분석:");
            console.log(
              `├─ 오늘의 일진: ${iljinHarmonyResult.todayIljin.gapja}(${iljinHarmonyResult.todayIljin.gapjaHan})`
            );
            console.log(
              `├─ 일진 천간: ${iljinHarmonyResult.todayIljin.gan.kor}(${iljinHarmonyResult.todayIljin.gan.han}) - ${iljinHarmonyResult.todayIljin.gan.ohaeng} ${iljinHarmonyResult.todayIljin.gan.eumYang}`
            );
            console.log(
              `├─ 사용자 일간: ${iljinHarmonyResult.userIlgan.kor}(${iljinHarmonyResult.userIlgan.han}) - ${iljinHarmonyResult.userIlgan.ohaeng} ${iljinHarmonyResult.userIlgan.eumYang}`
            );
            console.log(
              `├─ 십신 관계: ${iljinHarmonyResult.sibsinType || "없음"}`
            );
            console.log(
              `├─ 조화 점수: ${iljinHarmonyResult.score > 0 ? "+" : ""}${
                iljinHarmonyResult.score
              }점`
            );
            console.log(`└─ 설명: ${iljinHarmonyResult.description}`);

            // 일진 조화 점수를 최종 점수에 반영
            finalScore += iljinHarmonyResult.score;

            console.log(`\n🎯 최종 점수: ${finalScore}점`);
            console.log(`   = 기본 점수 70점`);
            if (heesinGisinResult) {
              console.log(
                `   + 희신/기신 보정 ${
                  heesinGisinResult.totalScore > 0 ? "+" : ""
                }${heesinGisinResult.totalScore}점`
              );
            }
            console.log(
              `   + 일진 조화 보정 ${iljinHarmonyResult.score > 0 ? "+" : ""}${
                iljinHarmonyResult.score
              }점`
            );
          } else {
            // 일진 조화 분석이 없는 경우에도 점수 범위 조정
            const adjustedScore = Math.max(50, Math.min(100, finalScore));

            console.log(
              `\n🎯 임시 점수: ${adjustedScore}점 (일진 조화 분석 불가)`
            );

            if (finalScore !== adjustedScore) {
              console.log(
                `   ⚖️ 점수 조정: ${finalScore}점 → ${adjustedScore}점 (50-100점 범위 적용)`
              );
            }

            finalScore = adjustedScore;
          }

          // 원국 특성 분석 결과 출력 및 최종 점수 계산
          if (wongukResult) {
            console.log("\n🏛️ 원국 특성 분석:");

            // 격국 정보 출력
            if (wongukResult.geokgukResult) {
              console.log(`├─ 격국: ${wongukResult.geokgukResult.geokguk}`);
              console.log(
                `├─ 주도 십신: ${wongukResult.geokgukResult.dominantSibsin} (${wongukResult.geokgukResult.maxCount}개)`
              );
            }

            // 용신 정보 출력
            if (wongukResult.yongsinResult) {
              const yongsinElements = wongukResult.yongsinResult.yongsin
                .map((y) => y.element)
                .join(", ");
              const gisinElements = wongukResult.yongsinResult.gisin
                .map((g) => g.element)
                .join(", ");
              console.log(`├─ 용신: ${yongsinElements || "없음"}`);
              console.log(`├─ 기신: ${gisinElements || "없음"}`);
            }

            // 원국 특성 분석 상세 출력
            console.log("└─ 원국 특성 분석 상세:");
            wongukResult.analysisDetails.forEach((detail, index) => {
              const prefix =
                index === wongukResult.analysisDetails.length - 1
                  ? "   └─"
                  : "   ├─";
              console.log(
                `${prefix} ${detail.type}: ${detail.score > 0 ? "+" : ""}${
                  detail.score
                }점 (${detail.reason})`
              );
              console.log(`      ${detail.detail}`);
            });

            // 원국 특성 점수를 최종 점수에 반영
            finalScore += wongukResult.totalScore;

            // 점수 범위 조정 (50-100점 제한)
            const adjustedScore = Math.max(50, Math.min(100, finalScore));

            console.log(`\n🎯 최종 점수: ${adjustedScore}점`);
            console.log(`   = 기본 점수 70점`);
            if (heesinGisinResult) {
              console.log(
                `   + 희신/기신 보정 ${
                  heesinGisinResult.totalScore > 0 ? "+" : ""
                }${heesinGisinResult.totalScore}점`
              );
            }
            if (iljinHarmonyResult) {
              console.log(
                `   + 일진 조화 보정 ${
                  iljinHarmonyResult.score > 0 ? "+" : ""
                }${iljinHarmonyResult.score}점`
              );
            }
            console.log(
              `   + 원국 특성 보정 ${wongukResult.totalScore > 0 ? "+" : ""}${
                wongukResult.totalScore
              }점`
            );

            if (finalScore !== adjustedScore) {
              console.log(
                `   ⚖️ 점수 조정: ${finalScore}점 → ${adjustedScore}점 (50-100점 범위 적용)`
              );
            }

            // 최종 점수를 조정된 점수로 업데이트
            finalScore = adjustedScore;
          } else {
            // 원국 특성 분석이 없는 경우에도 점수 범위 조정
            const adjustedScore = Math.max(50, Math.min(100, finalScore));

            console.log(
              `\n🎯 최종 점수: ${adjustedScore}점 (원국 특성 분석 불가)`
            );

            if (finalScore !== adjustedScore) {
              console.log(
                `   ⚖️ 점수 조정: ${finalScore}점 → ${adjustedScore}점 (50-100점 범위 적용)`
              );
            }

            finalScore = adjustedScore;
          }

          return {
            primarySibsin,
            ohaengAnalysis,
            heesinGisinResult,
            iljinHarmonyResult,
            wongukResult,
            finalScore,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("십신 계산 중 오류:", error);
      return null;
    }
  };

  // 십신별 운세 데이터 가져오기 (MBTI 포함)
  const loadFortuneData = async (sibsinName, finalScore, userMbti = null) => {
    try {
      // 십신 이름 정규화 (예: 비견, 겁재, 식신 등)
      const sibsinFileName = `${sibsinName}_오늘의운세.json`;
      const response = await fetch(`/documents/오늘의운세/${sibsinFileName}`);

      if (!response.ok) {
        console.error(`운세 파일을 찾을 수 없습니다: ${sibsinFileName}`);
        return null;
      }

      const data = await response.json();

      // 점수에 맞는 운세 찾기 (50, 60, 70, 80, 90, 100 중 가장 가까운 값)
      const scoreKeys = [50, 60, 70, 80, 90, 100];
      const closestScore = scoreKeys.reduce((prev, curr) =>
        Math.abs(curr - finalScore) < Math.abs(prev - finalScore) ? curr : prev
      );

      // JSON 구조에서 데이터 가져오기: {fortuneByScore: {sibsinName: [{score, categories...}]}}
      const fortuneArray = data.fortuneByScore?.[sibsinName];
      if (!fortuneArray || !Array.isArray(fortuneArray)) {
        console.error(`${sibsinName}에 대한 운세 배열을 찾을 수 없습니다`);
        return null;
      }

      // 점수에 맞는 운세 객체 찾기
      const fortuneData = fortuneArray.find(item => item.score === closestScore);

      if (!fortuneData) {
        console.error(
          `점수 ${closestScore}에 해당하는 운세 데이터를 찾을 수 없습니다`
        );
        return null;
      }

      // 각 카테고리에서 랜덤하게 하나씩 선택
      const getRandomItem = (arr) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
      };

      // MBTI 기반 추가 메시지 생성
      let mbtiMessage = null;
      if (userMbti && data.mbtiModifier && data.mbtiModifier[userMbti]) {
        const mbtiMessages = data.mbtiModifier[userMbti];
        mbtiMessage = getRandomItem(mbtiMessages);
      }

      const selectedFortune = {
        score: closestScore,
        sibsin: sibsinName,
        sibsinName: sibsinName, // UI에서 사용할 십신 이름
        총운: getRandomItem(fortuneData.총운),
        재물: getRandomItem(fortuneData.재물),
        연애: getRandomItem(fortuneData.연애),
        커리어: getRandomItem(fortuneData.커리어),
        건강: getRandomItem(fortuneData.건강),
        가족: getRandomItem(fortuneData.가족),
        mbtiMessage: mbtiMessage, // MBTI 기반 추가 메시지
      };

      console.log("📖 오늘의 운세 데이터 로드 완료:", {
        십신: sibsinName,
        점수: closestScore,
        원점수: finalScore,
        MBTI: userMbti,
        MBTI메시지: mbtiMessage ? "포함됨" : "없음",
      });

      return selectedFortune;
    } catch (error) {
      console.error("운세 데이터 로드 실패:", error);
      return null;
    }
  };

  const handleCardClick = async () => {
    if (!isFlipped && !hasViewed) {
      // 생년월일이 없으면 모달 표시 (생시는 선택사항이므로 체크하지 않음)
      if (!hasBirthDate) {
        setShowBirthDateModal(true);
        return;
      }

      // 사용자의 주된 십신 및 오행 계산 및 콘솔 출력
      const result = await calculateUserPrimarySibsin();
      if (result && result.primarySibsin) {
        console.log("=".repeat(50));
        console.log("🎯 사주팔자 분석 결과");
        console.log("=".repeat(50));

        // 십신별 운세 데이터 로드 (MBTI 포함)
        const fortuneData = await loadFortuneData(
          result.primarySibsin.name,
          result.finalScore,
          userProfile?.mbti
        );

        if (fortuneData) {
          // 운세 데이터를 상태로 저장
          const finalFortuneData = {
            title: `${result.primarySibsin.name} - ${fortuneData.score}점`,
            description:
              fortuneData.총운 || "오늘은 평온한 하루가 될 것입니다.",
            general: fortuneData.총운,
            love: fortuneData.연애,
            career: fortuneData.커리어,
            wealth: fortuneData.재물,
            health: fortuneData.건강,
            family: fortuneData.가족,
            sibsinName: fortuneData.sibsinName, // 십신 이름 추가
            score: fortuneData.score, // 점수 추가
            mbtiMessage: fortuneData.mbtiMessage, // MBTI 메시지 추가
            luckyNumber: Math.floor(Math.random() * 9) + 1,
            luckyColor: ["빨강", "파랑", "노랑", "초록", "보라"][
              Math.floor(Math.random() * 5)
            ],
            luckyDirection: ["동", "서", "남", "북"][
              Math.floor(Math.random() * 4)
            ],
          };

          setFortune(finalFortuneData);

          // DB에 저장 (로그인한 사용자만)
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            try {
              await fetch("/api/daily-fortune", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  sibsinName: result.primarySibsin.name,
                  score: result.finalScore,
                  fortuneData: finalFortuneData,
                  primarySibsin: result.primarySibsin,
                  ohaengAnalysis: result.ohaengAnalysis,
                }),
              });
            } catch (error) {
              console.error("Error saving fortune to DB:", error);
            }
          }
        }
      }

      // 카드 뒤집기 시작
      setIsFlipped(true);
      setShowGif(true);

      // GIF 애니메이션 재생 시간 (약 2초)
      setTimeout(() => {
        setShowGif(false);
        setShowContent(true);
        setHasViewed(true);
      }, 800);
    }
  };

  return (
    <PageWrapper>
      <div className={styles["daily-fortune-page"]}>
        <main>
          <section id="daily-fortune">
            <div className={styles["container"]}>
              <div className={styles["page-header"]}>
                <h1 className={styles["page-title"]}>오늘의 운세</h1>
              </div>

              <div className={styles["date-display"]}>
                <p>
                  {new Date().toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </p>
              </div>

              <div className={styles["card-wrapper"]}>
                {!isFlipped ? (
                  // 카드 뒷면
                  <div
                    className={styles["card-back"]}
                    onClick={handleCardClick}
                  >
                    <Image
                      src="/assets/images/오늘의운세/카드 뒷면.png"
                      alt="운세 카드 뒷면"
                      width={300}
                      height={450}
                      className={styles["card-image"]}
                      priority
                    />
                    <p className={styles["card-instruction"]}>
                      카드를 터치하여 오늘의 운세를 확인하세요
                    </p>
                  </div>
                ) : showGif ? (
                  // GIF 애니메이션
                  <div className={styles["gif-container"]}>
                    <Image
                      src="/assets/images/오늘의운세/카드뒤집기.gif"
                      alt="카드 뒤집기 애니메이션"
                      width={300}
                      height={450}
                      className={styles["gif-image"]}
                      unoptimized
                    />
                  </div>
                ) : showContent ? (
                  // 운세 내용
                  <>
                    {/* <h2 className={styles["fortune-title"]}>
                      {fortune?.title}
                    </h2> */}
                    <div className={`card ${styles["daily-fortune-card"]}`}>
                      <div className={styles["card-header"]}></div>

                      <div
                        className={`${styles["fortune-content"]} ${styles["responsive-padding"]}`}
                      >
                        {/* 십신과 점수 표시 영역 */}
                        <div className={styles["sibsin-score-section"]}>
                          <div className={styles["sibsin-info"]}>
                            <span className={styles["sibsin-label"]}>주 십신</span>
                            <span className={styles["sibsin-value"]}>
                              {fortune?.sibsinName || "알 수 없음"}
                            </span>
                          </div>
                          <div className={styles["score-info"]}>
                            <span className={styles["score-label"]}>오늘의 점수</span>
                            <span className={styles["score-value"]}>
                              {fortune?.score || 0}점
                            </span>
                          </div>
                        </div>

                        {/* MBTI 기반 추가 메시지 */}
                        {fortune?.mbtiMessage && (
                          <div className={styles["mbti-message-section"]}>
                            <div className={styles["mbti-info"]}>
                              <span className={styles["mbti-label"]}>
                                MBTI 특성 ({userProfile?.mbti})
                              </span>
                              <p className={styles["mbti-message"]}>
                                {fortune.mbtiMessage}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 첫 번째 카드: 운세 상세 정보 */}
                        <div>
                          <h3 className={styles["card-title"]}>상세 운세</h3>
                          <div className={styles["fortune-sections"]}>
                            <div className={styles["fortune-item"]}>
                              <span className={styles["fortune-label"]}>
                                총운
                              </span>
                              <p className={styles["fortune-text"]}>
                                {fortune?.general}
                              </p>
                            </div>
                            <div className={styles["fortune-item"]}>
                              <span className={styles["fortune-label"]}>
                                재물
                              </span>
                              <p className={styles["fortune-text"]}>
                                {fortune?.wealth}
                              </p>
                            </div>
                            <div className={styles["fortune-item"]}>
                              <span className={styles["fortune-label"]}>
                                연애
                              </span>
                              <p className={styles["fortune-text"]}>
                                {fortune?.love}
                              </p>
                            </div>
                            <div className={styles["fortune-item"]}>
                              <span className={styles["fortune-label"]}>
                                커리어
                              </span>
                              <p className={styles["fortune-text"]}>
                                {fortune?.career}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`card ${styles["daily-fortune-card"]}`}>
                      {/* 두 번째 카드: 랜덤 요소 */}
                      <div className={styles["fortune-content"]}>
                        <div className={styles["responsive-padding"]}>
                          <div className={styles["fortune-item"]}>
                            <span className={styles["fortune-label"]}>
                              건강
                            </span>
                            <p className={styles["fortune-text"]}>
                              {fortune?.health}
                            </p>
                          </div>
                          <div className={styles["fortune-item"]}>
                            <span className={styles["fortune-label"]}>
                              가족
                            </span>
                            <p className={styles["fortune-text"]}>
                              {fortune?.family}
                            </p>
                          </div>

                          <h3 className={styles["card-title"]}>
                            오늘의 랜덤 요소
                          </h3>
                          <div className={styles["lucky-sections"]}>
                            <div className={styles["lucky-item"]}>
                              <span className={styles["lucky-label"]}>
                                포인트 컬러
                              </span>
                              <span className={styles["lucky-value"]}>
                                {fortune?.luckyColor}
                              </span>
                            </div>
                            <div className={styles["lucky-item"]}>
                              <span className={styles["lucky-label"]}>
                                행동
                              </span>
                              <span className={styles["lucky-value"]}>
                                {fortune?.luckyDirection}쪽으로 향하기
                              </span>
                            </div>
                            <div className={styles["lucky-item"]}>
                              <span className={styles["lucky-label"]}>
                                사물
                              </span>
                              <span className={styles["lucky-value"]}>
                                숫자 {fortune?.luckyNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* 생년월일 입력 요청 모달 */}
      {showBirthDateModal && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => setShowBirthDateModal(false)}
        >
          <div className={styles["modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["modal-title"]}>알림</h2>
            <p className={styles["modal-text"]}>
              마이페이지에서 생년월일을 입력해주세요!
            </p>
            <div className={styles["modal-buttons"]}>
              <button
                className={styles["modal-button-cancel"]}
                onClick={() => setShowBirthDateModal(false)}
              >
                닫기
              </button>
              <button
                className={styles["modal-button-primary"]}
                onClick={() => router.push("/mypage")}
              >
                마이페이지로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
