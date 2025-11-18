/**
 * 팔자 유형 분포 테스트
 *
 * 이 테스트는 다양한 생년월일과 시간 조합에 대해
 * 16가지 팔자 유형이 골고루 분포되는지 확인합니다.
 *
 * 문제점 분석:
 * - 현재 4가지 유형만 출력된다는 문제 신고
 * - determinePaljaType 함수의 각 축별 판정 로직 검증 필요
 *
 * 실행 방법: node tests/palja-type-distribution-test.js
 */

const { calculateSaju, determinePaljaType } = require('../lib/saju-utils.js');

// 16가지 가능한 팔자 유형 정의
const ALL_PALJA_TYPES = [
    'WSIJ', 'WSIY', 'WSHJ', 'WSHY',
    'WGIJ', 'WGIY', 'WGHJ', 'WGHY',
    'NSIJ', 'NSIY', 'NSHJ', 'NSHY',
    'NGIJ', 'NGIY', 'NGHJ', 'NGHY'
];

/**
 * 다양한 생년월일 조합을 생성하는 함수
 */
function generateTestDates() {
    const testDates = [];

    // 연도: 1950-2023까지 10년 간격으로 샘플링
    const years = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

    // 월: 모든 달
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // 일: 월별로 몇 개씩 샘플링
    const days = [1, 8, 15, 22, 28]; // 월말 고려해서 28일까지

    // 시간: 모든 12 시간대
    const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    years.forEach(year => {
        months.forEach(month => {
            days.forEach(day => {
                // 날짜 유효성 검사
                const date = new Date(year, month - 1, day);
                if (date.getFullYear() === year &&
                    date.getMonth() === month - 1 &&
                    date.getDate() === day) {

                    hours.forEach(hour => {
                        testDates.push({
                            date: date,
                            hour: hour,
                            dateStr: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                            hourStr: `${hour}시`
                        });
                    });
                }
            });
        });
    });

    return testDates;
}

/**
 * 각 축별 분포를 분석하는 함수
 */
function analyzeAxisDistribution(results) {
    const axis1Distribution = {}; // W/N
    const axis2Distribution = {}; // S/G
    const axis3Distribution = {}; // I/H
    const axis4Distribution = {}; // J/Y

    results.forEach(result => {
        const type = result.type;
        const axis1 = type[0];
        const axis2 = type[1];
        const axis3 = type[2];
        const axis4 = type[3];

        axis1Distribution[axis1] = (axis1Distribution[axis1] || 0) + 1;
        axis2Distribution[axis2] = (axis2Distribution[axis2] || 0) + 1;
        axis3Distribution[axis3] = (axis3Distribution[axis3] || 0) + 1;
        axis4Distribution[axis4] = (axis4Distribution[axis4] || 0) + 1;
    });

    return {
        axis1: axis1Distribution, // 에너지 (W외강형/N내유형)
        axis2: axis2Distribution, // 인식 (S실리형/G관념형)
        axis3: axis3Distribution, // 판단 (I이성형/H화합형)
        axis4: axis4Distribution  // 생활 (J정주형/Y유랑형)
    };
}

/**
 * 특정 축이 편향된 경우를 찾아내는 함수
 */
function findBiasedResults(results) {
    const biasedCases = [];

    results.forEach(result => {
        const analysis = result.analysis;

        // 각 축의 판정 근거 분석
        if (analysis.energyDetails) {
            // W/N 축 편향 체크 - 극단적인 에너지 점수
            if (analysis.energyDetails.score >= 8 || analysis.energyDetails.score <= 1) {
                biasedCases.push({
                    ...result,
                    bias: `에너지 점수 극단값: ${analysis.energyDetails.score}`,
                    axis: 'W/N'
                });
            }
        }
    });

    return biasedCases;
}

/**
 * 상세 분석을 위한 사주 계산 함수
 */
function calculateWithDetails(date, hour) {
    try {
        const sajuData = calculateSaju(date, hour);
        const type = determinePaljaType(sajuData);

        // 각 축별 세부 분석
        const ilganOhaengTable = { '甲':'木', '乙':'木', '丙':'火', '丁':'火', '戊':'土', '己':'土', '庚':'金', '辛':'金', '壬':'수', '癸':'수' };
        const ohaengSaengTable = { '水':'木', '木':'火', '火':'土', '土':'金', '金':'水' };

        // 에너지 축 분석
        let energyScore = 0;
        const sibsin = sajuData.sibsin;

        if (sajuData.wolji) {
            const woljiOhaeng = sajuData.wolji.ohaeng;
            const ilganOhaeng = ilganOhaengTable[sajuData.ilgan.han];
            const supportingOhaengKey = Object.keys(ohaengSaengTable).find(key => ohaengSaengTable[key] === ilganOhaeng);

            if (woljiOhaeng === ilganOhaeng || woljiOhaeng === supportingOhaengKey) {
                energyScore += 3;
            }
        }

        const bigeopCount = (sibsin['비견'] || 0) + (sibsin['겁재'] || 0);
        const inseongCount = (sibsin['정인'] || 0) + (sibsin['편인'] || 0);
        energyScore += bigeopCount + inseongCount;

        // 인식 축 분석
        const practicalScore = ((sibsin['식신']||0) + (sibsin['상관']||0) + (sibsin['정재']||0) + (sibsin['편재']||0)) * 1;
        const idealScore = ((sibsin['정인']||0) + (sibsin['편인']||0)) * 2;

        // 판단 축 분석
        const ruleScore = ((sibsin['정관']||0) + (sibsin['편관']||0)) * 2;
        const harmonyScore = ((sibsin['식신']||0) + (sibsin['상관']||0) + (sibsin['비견']||0) + (sibsin['겁재']||0)) * 1;

        // 생활 축 분석
        const ohaeng = sajuData.ohaeng;
        let balanceScore = 0;
        if (Object.keys(ohaeng).length === 5) {
            balanceScore += 2;
        }
        const hasTooMany = Object.values(ohaeng).some(count => count >= 3);
        if (!hasTooMany) {
            balanceScore += 1;
        }

        return {
            type: type,
            sajuData: sajuData,
            analysis: {
                energyDetails: {
                    score: energyScore,
                    bigeopCount: bigeopCount,
                    inseongCount: inseongCount,
                    woljiSupport: sajuData.wolji ? 'yes' : 'no'
                },
                perceptionDetails: {
                    practicalScore: practicalScore,
                    idealScore: idealScore,
                    result: idealScore > practicalScore ? 'G' : 'S'
                },
                judgementDetails: {
                    ruleScore: ruleScore,
                    harmonyScore: harmonyScore,
                    result: ruleScore > harmonyScore ? 'I' : 'H'
                },
                lifestyleDetails: {
                    balanceScore: balanceScore,
                    ohaengCount: Object.keys(ohaeng).length,
                    hasTooMany: hasTooMany,
                    result: balanceScore === 3 ? 'J' : 'Y'
                }
            }
        };
    } catch (error) {
        return {
            error: error.message,
            date: date,
            hour: hour
        };
    }
}

/**
 * 메인 테스트 함수
 */
function runPaljaTypeDistributionTest() {
    console.log('🧪 팔자 유형 분포 테스트 시작...\n');

    const testDates = generateTestDates();
    console.log(`📅 총 ${testDates.length}개의 날짜/시간 조합 생성`);

    const results = [];
    const errors = [];
    const typeDistribution = {};

    // 진행률 표시를 위한 변수
    let processed = 0;
    const total = testDates.length;

    testDates.forEach((testCase, index) => {
        const result = calculateWithDetails(testCase.date, testCase.hour);

        if (result.error) {
            errors.push({
                ...testCase,
                error: result.error
            });
        } else {
            results.push({
                ...testCase,
                ...result
            });

            // 유형별 분포 카운트
            typeDistribution[result.type] = (typeDistribution[result.type] || 0) + 1;
        }

        processed++;

        // 10% 간격으로 진행률 표시
        if (processed % Math.ceil(total / 10) === 0) {
            const progress = Math.round((processed / total) * 100);
            console.log(`⏳ 진행률: ${progress}% (${processed}/${total})`);
        }
    });

    console.log(`\n✅ 테스트 완료! 성공: ${results.length}, 오류: ${errors.length}`);

    // 결과 분석
    console.log('\n📊 === 팔자 유형 분포 결과 ===');
    console.log(`총 ${Object.keys(typeDistribution).length}가지 유형이 발견되었습니다.`);
    console.log('(목표: 16가지 유형 모두 발견되어야 함)\n');

    // 유형별 분포 표시 (빈도순 정렬)
    const sortedTypes = Object.entries(typeDistribution)
        .sort((a, b) => b[1] - a[1]);

    console.log('📈 유형별 분포 (빈도순):');
    sortedTypes.forEach(([type, count]) => {
        const percentage = ((count / results.length) * 100).toFixed(2);
        const bar = '█'.repeat(Math.ceil(percentage / 2));
        console.log(`${type}: ${count.toString().padStart(4)}회 (${percentage.padStart(5)}%) ${bar}`);
    });

    // 누락된 유형 확인
    const foundTypes = Object.keys(typeDistribution);
    const missingTypes = ALL_PALJA_TYPES.filter(type => !foundTypes.includes(type));

    if (missingTypes.length > 0) {
        console.log(`\n❌ 누락된 유형 (${missingTypes.length}개):`);
        missingTypes.forEach(type => {
            console.log(`   ${type}`);
        });
    } else {
        console.log(`\n✅ 모든 16가지 유형이 발견되었습니다!`);
    }

    // 축별 분포 분석
    console.log('\n🔍 === 축별 분포 분석 ===');
    const axisAnalysis = analyzeAxisDistribution(results);

    console.log('축1 (에너지): W(외강형) vs N(내유형)');
    Object.entries(axisAnalysis.axis1).forEach(([key, value]) => {
        const percentage = ((value / results.length) * 100).toFixed(1);
        console.log(`  ${key}: ${value}회 (${percentage}%)`);
    });

    console.log('\n축2 (인식): S(실리형) vs G(관념형)');
    Object.entries(axisAnalysis.axis2).forEach(([key, value]) => {
        const percentage = ((value / results.length) * 100).toFixed(1);
        console.log(`  ${key}: ${value}회 (${percentage}%)`);
    });

    console.log('\n축3 (판단): I(이성형) vs H(화합형)');
    Object.entries(axisAnalysis.axis3).forEach(([key, value]) => {
        const percentage = ((value / results.length) * 100).toFixed(1);
        console.log(`  ${key}: ${value}회 (${percentage}%)`);
    });

    console.log('\n축4 (생활): J(정주형) vs Y(유랑형)');
    Object.entries(axisAnalysis.axis4).forEach(([key, value]) => {
        const percentage = ((value / results.length) * 100).toFixed(1);
        console.log(`  ${key}: ${value}회 (${percentage}%)`);
    });

    // 편향된 케이스 분석
    console.log('\n🎯 === 편향성 분석 ===');

    // 각 축에서 극단적인 편향 체크
    const checkBias = (axis, name) => {
        const keys = Object.keys(axis);
        if (keys.length === 2) {
            const [key1, key2] = keys;
            const total = axis[key1] + axis[key2];
            const ratio1 = axis[key1] / total;
            const ratio2 = axis[key2] / total;

            if (Math.abs(ratio1 - 0.5) > 0.3) {  // 30% 이상 편향
                console.log(`⚠️  ${name} 축 심각한 편향 발견:`);
                console.log(`   ${key1}: ${(ratio1 * 100).toFixed(1)}%, ${key2}: ${(ratio2 * 100).toFixed(1)}%`);
                return true;
            }
        }
        return false;
    };

    let hasBias = false;
    hasBias |= checkBias(axisAnalysis.axis1, '에너지(W/N)');
    hasBias |= checkBias(axisAnalysis.axis2, '인식(S/G)');
    hasBias |= checkBias(axisAnalysis.axis3, '판단(I/H)');
    hasBias |= checkBias(axisAnalysis.axis4, '생활(J/Y)');

    if (!hasBias) {
        console.log('✅ 축별 분포가 비교적 균형적입니다.');
    }

    // 오류 리포트
    if (errors.length > 0) {
        console.log(`\n❌ === 오류 리포트 (${errors.length}건) ===`);
        errors.slice(0, 5).forEach(error => {
            console.log(`${error.dateStr} ${error.hourStr}: ${error.error}`);
        });
        if (errors.length > 5) {
            console.log(`... 외 ${errors.length - 5}건`);
        }
    }

    // 결론 및 권장사항
    console.log('\n🏁 === 결론 및 권장사항 ===');

    if (missingTypes.length > 0) {
        console.log(`🔴 문제 확인: ${missingTypes.length}개 유형이 누락되었습니다.`);
        console.log('📋 권장 조치:');
        console.log('   1. determinePaljaType 함수의 각 축별 판정 로직 검토');
        console.log('   2. 누락된 유형들의 조건을 만족하는 사주 조합 분석');
        console.log('   3. 임계값(threshold) 조정 고려');

        // 누락된 유형의 패턴 분석
        const missingPattern = {};
        missingTypes.forEach(type => {
            [0, 1, 2, 3].forEach(pos => {
                const char = type[pos];
                missingPattern[pos] = missingPattern[pos] || {};
                missingPattern[pos][char] = (missingPattern[pos][char] || 0) + 1;
            });
        });

        console.log('\n📊 누락된 유형의 패턴:');
        Object.entries(missingPattern).forEach(([pos, chars]) => {
            const axisName = ['에너지', '인식', '판단', '생활'][pos];
            console.log(`   ${axisName} 축: ${Object.entries(chars).map(([k,v]) => `${k}(${v}개)`).join(', ')}`);
        });

    } else {
        console.log('🟢 성공: 모든 16가지 유형이 발견되었습니다!');
        console.log('✅ 팔자 유형 추출 알고리즘이 정상적으로 작동하고 있습니다.');
    }

    return {
        totalTests: results.length,
        foundTypes: foundTypes.length,
        missingTypes: missingTypes,
        typeDistribution: typeDistribution,
        axisDistribution: axisAnalysis,
        errors: errors.length
    };
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
    runPaljaTypeDistributionTest();
}

module.exports = {
    runPaljaTypeDistributionTest,
    generateTestDates,
    analyzeAxisDistribution
};