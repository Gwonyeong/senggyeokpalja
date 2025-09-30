import { calculateFourPillars } from 'manseryeok';

export function calculateSajuWithManseryeok(birthDate, timeIndex) {
  // timeIndex를 시간으로 변환
  let hour = 6; // 기본값: 오시(6)
  let minute = 0;

  if (timeIndex !== 6 && timeIndex !== undefined) {
    // timeIndex를 실제 시간으로 변환
    // 0: 자시(23:30-01:29) -> 0시
    // 1: 축시(01:30-03:29) -> 2시
    // 2: 인시(03:30-05:29) -> 4시
    // ... 등등
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
    isLunar: false // 양력으로 전달
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
    ohaeng: element.stem,
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
    ohaeng: element.branch,
    eumYang: yinYang.branch === '양' ? '陽' : '陰'
  });

  // 기존 포맷으로 변환
  const palja = {
    yeonju: {
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
    const ganOhaeng = ju.gan.ohaeng === '목' ? '木' :
                     ju.gan.ohaeng === '화' ? '火' :
                     ju.gan.ohaeng === '토' ? '土' :
                     ju.gan.ohaeng === '금' ? '金' :
                     ju.gan.ohaeng === '수' ? '水' : ju.gan.ohaeng;

    const jiOhaeng = ju.ji.ohaeng === '목' ? '木' :
                    ju.ji.ohaeng === '화' ? '火' :
                    ju.ji.ohaeng === '토' ? '土' :
                    ju.ji.ohaeng === '금' ? '金' :
                    ju.ji.ohaeng === '수' ? '水' : ju.ji.ohaeng;

    ohaengCount[ganOhaeng] = (ohaengCount[ganOhaeng] || 0) + 1;
    ohaengCount[jiOhaeng] = (ohaengCount[jiOhaeng] || 0) + 1;
  });

  // 일간 정보
  const ilgan = palja.ilju.gan;

  return {
    palja: palja,
    ilgan: ilgan,
    ohaeng: ohaengCount,
    fourPillars: fourPillars, // manseryeok 원본 결과도 포함
    birthInfo: birthInfo // 입력 정보도 포함
  };
}