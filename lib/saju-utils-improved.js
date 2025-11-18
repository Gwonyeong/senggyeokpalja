// ======================================================================
// 개선된 사주팔자 관련 유틸리티 함수들
// ======================================================================

// 기존 saju-utils.js의 기본 데이터와 함수들을 재사용
import { calculateSaju } from './saju-utils.js';

// ======================================================================
// 개선된 성격 유형 결정 함수
// ======================================================================

/**
 * 개선된 팔자 유형 결정 함수
 * 기존 알고리즘의 편향 문제를 해결하여 16가지 유형이 고르게 분포되도록 개선
 */
export function determinePaljaTypeImproved(sajuData) {
    const ilganOhaengTable = { '甲':'木', '乙':'木', '七':'火', '丁':'火', '戊':'土', '己':'土', '庚':'金', '辛':'金', '壬':'水', '癸':'水' };
    const ohaengSaengTable = { '水':'木', '木':'火', '火':'土', '土':'金', '金':'水' };

    const axis1 = determineEnergyImproved(sajuData, ilganOhaengTable, ohaengSaengTable);
    const axis2 = determinePerceptionImproved(sajuData.sibsin);
    const axis3 = determineJudgementImproved(sajuData.sibsin);
    const axis4 = determineLifestyleImproved(sajuData.ohaeng, sajuData.sibsin);

    return axis1 + axis2 + axis3 + axis4;
}

/**
 * 축1: 에너지 방향 개선 (W/N)
 * 더 균형잡힌 분포를 위해 다양한 요소를 고려
 */
function determineEnergyImproved(sajuData, ilganOhaengTable, ohaengSaengTable) {
    let energyScore = 0;
    const sibsin = sajuData.sibsin;

    if (!sajuData.wolji) return 'N';

    const woljiOhaeng = sajuData.wolji.ohaeng;
    const ilganOhaeng = ilganOhaengTable[sajuData.ilgan.han];
    const supportingOhaengKey = Object.keys(ohaengSaengTable).find(key => ohaengSaengTable[key] === ilganOhaeng);

    // 1. 월지 지원 점수 (기존보다 세분화)
    if (woljiOhaeng === ilganOhaeng) {
        energyScore += 2.5;  // 같은 오행이면 강한 지원
    } else if (woljiOhaeng === supportingOhaengKey) {
        energyScore += 2.0;  // 인성으로 지원
    }

    // 2. 비겁 점수 (자기 강화)
    const bigeopCount = (sibsin['비견'] || 0) + (sibsin['겁재'] || 0);
    energyScore += bigeopCount * 1.2;

    // 3. 인성 점수 (에너지 공급)
    const inseongCount = (sibsin['정인'] || 0) + (sibsin['편인'] || 0);
    energyScore += inseongCount * 1.0;

    // 4. 관성 견제 효과 (에너지 약화)
    const gwanseongCount = (sibsin['정관'] || 0) + (sibsin['편관'] || 0);
    energyScore -= gwanseongCount * 0.5;

    // 5. 식상 소모 효과 (에너지 소모)
    const siksangCount = (sibsin['식신'] || 0) + (sibsin['상관'] || 0);
    energyScore -= siksangCount * 0.3;

    // 임계값을 3.0으로 조정하여 40-60% 분포 목표
    return energyScore >= 3.0 ? 'W' : 'N';
}

/**
 * 축2: 인식 방식 개선 (S/G)
 * 더 세밀한 가중치 조정으로 균형있는 분포 구현
 */
function determinePerceptionImproved(sibsin) {
    // 실용적 십신 (재물, 식상) - 현실감각
    const practicalScore =
        ((sibsin['식신']||0) * 1.0) +     // 재능 활용
        ((sibsin['상관']||0) * 1.1) +     // 표현력
        ((sibsin['정재']||0) * 1.2) +     // 안정적 재물
        ((sibsin['편재']||0) * 1.0);      // 투자/사업

    // 이상적 십신 (인성, 관성 일부) - 정신세계
    const idealScore =
        ((sibsin['정인']||0) * 1.5) +     // 학문, 지혜
        ((sibsin['편인']||0) * 1.3) +     // 예술, 종교
        ((sibsin['정관']||0) * 0.3);      // 명예, 이상

    // 임계값을 조정하여 45-55% 분포 목표
    return idealScore >= practicalScore * 0.8 ? 'G' : 'S';
}

/**
 * 축3: 판단 방식 개선 (I/H)
 * 논리적 판단 vs 감정적 조화의 균형있는 분포 구현
 */
function determineJudgementImproved(sibsin) {
    // 논리/규칙 기반 십신
    const logicScore =
        ((sibsin['정관']||0) * 1.3) +     // 체계, 질서
        ((sibsin['편관']||0) * 1.1) +     // 추진력, 결단
        ((sibsin['정재']||0) * 0.4);      // 계획성

    // 조화/감정 기반 십신
    const harmonyScore =
        ((sibsin['식신']||0) * 1.1) +     // 자연스러운 표현
        ((sibsin['상관']||0) * 1.0) +     // 감정 표현
        ((sibsin['비견']||0) * 0.8) +     // 동료애
        ((sibsin['겁재']||0) * 0.6) +     // 경쟁 의식
        ((sibsin['편재']||0) * 0.3);      // 융통성

    // 임계값 조정으로 40-60% 분포 목표
    return logicScore >= harmonyScore * 0.9 ? 'I' : 'H';
}

/**
 * 축4: 생활 방식 개선 (J/Y) - 균형 잡힌 분포 구현
 * 기존의 까다로운 조건을 적절히 완화하되 극단적이지 않게 조정
 */
function determineLifestyleImproved(ohaeng, sibsin) {
    if (!ohaeng || Object.keys(ohaeng).length === 0) return 'Y';

    let structureScore = 0;

    // 1. 오행 다양성 점수 (점진적 점수 시스템)
    const ohaengTypes = Object.keys(ohaeng).length;
    if (ohaengTypes >= 5) {  // 5가지면 완벽 점수
        structureScore += 2;
    } else if (ohaengTypes >= 4) {  // 4가지면 중간 점수
        structureScore += 1.5;
    } else if (ohaengTypes >= 3) {  // 3가지면 약간 점수
        structureScore += 0.8;
    }

    // 2. 오행 균형도 점수 (균형도를 더 정교하게 측정)
    const maxCount = Math.max(...Object.values(ohaeng));
    const totalCount = Object.values(ohaeng).reduce((sum, count) => sum + count, 0);
    const concentration = maxCount / totalCount;

    if (concentration <= 0.35) {  // 매우 균형 잡힌 경우
        structureScore += 1.5;
    } else if (concentration <= 0.5) {  // 적당히 균형 잡힌 경우
        structureScore += 1.0;
    } else if (concentration <= 0.6) {  // 약간 집중된 경우
        structureScore += 0.5;
    }

    // 3. 십신 안정성 점수 (가중치 적용)
    const stabilityGods = (sibsin['정관'] || 0) * 1.2 + (sibsin['정재'] || 0) * 1.0 + (sibsin['정인'] || 0) * 1.1;
    const changeGods = (sibsin['편관'] || 0) * 1.0 + (sibsin['편재'] || 0) * 0.8 + (sibsin['상관'] || 0) * 1.0;

    const stabilityRatio = totalCount > 0 ? stabilityGods / (stabilityGods + changeGods) : 0;
    if (stabilityRatio >= 0.6) {  // 안정성이 높으면
        structureScore += 1.2;
    } else if (stabilityRatio >= 0.4) {  // 보통이면
        structureScore += 0.6;
    }

    // 4. 오행 상생 체인 점수 (새로 추가 - 오행이 서로 생성하는 관계인지 확인)
    const ohaengSaeng = { '水':'木', '木':'火', '火':'土', '土':'金', '金':'水' };
    let chainScore = 0;
    const presentOhaeng = Object.keys(ohaeng).filter(oh => ohaeng[oh] > 0);

    presentOhaeng.forEach(oh1 => {
        if (presentOhaeng.includes(ohaengSaeng[oh1])) {
            chainScore += 0.3;
        }
    });
    structureScore += chainScore;

    // 임계값을 4.2로 높여서 30-35% 정도의 J형 분포 목표 (더 균형 잡힌 분포)
    return structureScore >= 4.2 ? 'J' : 'Y';
}

// ======================================================================
// 서버용 manseryeok 계산 결과를 analyze용 형식으로 변환
// ======================================================================

/**
 * manseryeok 결과를 analyze 페이지용 사주 데이터로 변환
 */
export function convertManseryeokToAnalyzeFormat(manseryeokResult) {
    const { palja, ohaeng, sibsin, ilgan } = manseryeokResult;

    // analyze 페이지에서 사용하는 format으로 변환
    const convertedData = {
        palja: palja,
        ilgan: ilgan,
        wolji: palja.wolju?.ji,
        ohaeng: ohaeng,
        sibsin: sibsin
    };

    return convertedData;
}

// ======================================================================
// 통합된 팔자 계산 함수 (analyze와 consultation에서 공통 사용)
// ======================================================================

/**
 * 통합된 사주팔자 계산 함수
 * analyze와 consultation 페이지에서 동일한 결과를 얻을 수 있도록 통합
 */
export function calculateSajuUnified(birthDate, timeIndex, isLunar = false) {
    // 환경에 따라 적절한 계산 방법 선택
    if (typeof window === 'undefined') {
        // 서버 환경: manseryeok 사용
        const { calculateSajuForServer } = require('./saju-utils-server.js');
        const manseryeokResult = calculateSajuForServer(birthDate, timeIndex, isLunar);
        const convertedData = convertManseryeokToAnalyzeFormat(manseryeokResult);

        // 개선된 팔자 유형 결정
        const personalityType = determinePaljaTypeImproved(convertedData);

        return {
            ...convertedData,
            personalityType: personalityType,
            manseryeokData: manseryeokResult  // 원본 manseryeok 데이터도 포함
        };
    } else {
        // 클라이언트 환경: 기존 방식 사용
        const sajuData = calculateSaju(birthDate, timeIndex);
        const personalityType = determinePaljaTypeImproved(sajuData);

        return {
            ...sajuData,
            personalityType: personalityType
        };
    }
}

// ======================================================================
// 분포 테스트 및 분석 함수
// ======================================================================

/**
 * 개선된 알고리즘의 분포를 테스트하는 함수
 */
export function testImprovedDistribution(testCases = 1000) {
    const distribution = {};
    const axisDistribution = {
        energy: { W: 0, N: 0 },
        perception: { S: 0, G: 0 },
        judgement: { I: 0, H: 0 },
        lifestyle: { J: 0, Y: 0 }
    };

    // 다양한 테스트 케이스 생성
    for (let i = 0; i < testCases; i++) {
        // 랜덤한 생년월일 생성 (1950-2023)
        const year = 1950 + Math.floor(Math.random() * 74);
        const month = 1 + Math.floor(Math.random() * 12);
        const day = 1 + Math.floor(Math.random() * 28);
        const hour = Math.floor(Math.random() * 12);

        const birthDate = new Date(year, month - 1, day);
        const sajuData = calculateSaju(birthDate, hour);
        const type = determinePaljaTypeImproved(sajuData);

        // 분포 카운트
        distribution[type] = (distribution[type] || 0) + 1;

        // 축별 분포 카운트
        axisDistribution.energy[type[0]]++;
        axisDistribution.perception[type[1]]++;
        axisDistribution.judgement[type[2]]++;
        axisDistribution.lifestyle[type[3]]++;
    }

    return {
        typeDistribution: distribution,
        axisDistribution: axisDistribution,
        totalTests: testCases,
        foundTypes: Object.keys(distribution).length
    };
}

// ======================================================================
// 호환성 함수들
// ======================================================================

/**
 * 기존 determinePaljaType 함수와의 호환성을 위한 래퍼
 */
export function determinePaljaType(sajuData) {
    return determinePaljaTypeImproved(sajuData);
}