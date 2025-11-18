/**
 * 개선된 팔자 유형 알고리즘 테스트
 *
 * 기존 알고리즘과 개선된 알고리즘의 분포 비교 테스트
 */

const { calculateSaju, determinePaljaType: originalDetermine } = require('../lib/saju-utils.js');
const { determinePaljaTypeImproved, testImprovedDistribution } = require('../lib/saju-utils-improved.js');

/**
 * 기존 알고리즘과 개선 알고리즘 비교 테스트
 */
function compareAlgorithms() {
    console.log('🔬 기존 vs 개선 알고리즘 비교 테스트\n');

    const testCases = 2000;
    const originalResults = { types: {}, axes: { W: 0, N: 0, S: 0, G: 0, I: 0, H: 0, J: 0, Y: 0 } };
    const improvedResults = { types: {}, axes: { W: 0, N: 0, S: 0, G: 0, I: 0, H: 0, J: 0, Y: 0 } };

    console.log(`📊 ${testCases}개 테스트 케이스로 비교 분석 중...\n`);

    for (let i = 0; i < testCases; i++) {
        // 랜덤 생년월일 생성
        const year = 1960 + Math.floor(Math.random() * 50);
        const month = 1 + Math.floor(Math.random() * 12);
        const day = 1 + Math.floor(Math.random() * 28);
        const hour = Math.floor(Math.random() * 12);

        const birthDate = new Date(year, month - 1, day);
        const sajuData = calculateSaju(birthDate, hour);

        // 기존 알고리즘
        const originalType = originalDetermine(sajuData);
        originalResults.types[originalType] = (originalResults.types[originalType] || 0) + 1;
        originalType.split('').forEach(char => originalResults.axes[char]++);

        // 개선 알고리즘
        const improvedType = determinePaljaTypeImproved(sajuData);
        improvedResults.types[improvedType] = (improvedResults.types[improvedType] || 0) + 1;
        improvedType.split('').forEach(char => improvedResults.axes[char]++);
    }

    // 결과 출력
    console.log('='.repeat(80));
    console.log('📈 유형별 분포 비교');
    console.log('='.repeat(80));

    const allTypes = new Set([...Object.keys(originalResults.types), ...Object.keys(improvedResults.types)]);
    const sortedTypes = Array.from(allTypes).sort();

    console.log('유형'.padEnd(8) + '기존 알고리즘'.padEnd(15) + '개선 알고리즘'.padEnd(15) + '개선율');
    console.log('-'.repeat(60));

    sortedTypes.forEach(type => {
        const original = originalResults.types[type] || 0;
        const improved = improvedResults.types[type] || 0;
        const originalPct = ((original / testCases) * 100).toFixed(1);
        const improvedPct = ((improved / testCases) * 100).toFixed(1);
        const change = improved - original;
        const changeStr = change > 0 ? `+${change}` : `${change}`;

        console.log(`${type}`.padEnd(8) +
                   `${original}회 (${originalPct}%)`.padEnd(15) +
                   `${improved}회 (${improvedPct}%)`.padEnd(15) +
                   `${changeStr}회`);
    });

    // 축별 분포 비교
    console.log('\n' + '='.repeat(80));
    console.log('🎯 축별 분포 비교 (균형도 분석)');
    console.log('='.repeat(80));

    const axes = [
        { name: '에너지(W/N)', chars: ['W', 'N'] },
        { name: '인식(S/G)', chars: ['S', 'G'] },
        { name: '판단(I/H)', chars: ['I', 'H'] },
        { name: '생활(J/Y)', chars: ['J', 'Y'] }
    ];

    axes.forEach(axis => {
        console.log(`\n${axis.name}:`);

        axis.chars.forEach(char => {
            const original = originalResults.axes[char];
            const improved = improvedResults.axes[char];
            const originalPct = ((original / testCases) * 100).toFixed(1);
            const improvedPct = ((improved / testCases) * 100).toFixed(1);

            console.log(`  ${char}: ${original}회 (${originalPct}%) → ${improved}회 (${improvedPct}%)`);
        });

        // 균형도 계산 (50%에서 얼마나 벗어났는지)
        const [char1, char2] = axis.chars;
        const originalBalance = Math.abs((originalResults.axes[char1] / testCases) - 0.5);
        const improvedBalance = Math.abs((improvedResults.axes[char1] / testCases) - 0.5);
        const improvement = originalBalance - improvedBalance;

        const status = improvement > 0 ? '✅ 개선됨' : improvement < 0 ? '❌ 악화됨' : '➡️ 변화없음';
        console.log(`     균형도: ${(originalBalance * 100).toFixed(1)}% → ${(improvedBalance * 100).toFixed(1)}% 편향 ${status}`);
    });

    // 전체 요약
    console.log('\n' + '='.repeat(80));
    console.log('📋 요약');
    console.log('='.repeat(80));

    const originalTypesCount = Object.keys(originalResults.types).length;
    const improvedTypesCount = Object.keys(improvedResults.types).length;

    console.log(`발견된 유형 수: ${originalTypesCount} → ${improvedTypesCount} (목표: 16)`);

    // 가장 심각했던 J/Y 축 개선도 확인
    const originalJRatio = originalResults.axes.J / testCases;
    const improvedJRatio = improvedResults.axes.J / testCases;
    const jImprovement = ((improvedJRatio - originalJRatio) * 100).toFixed(1);

    console.log(`J형 비율 개선: ${(originalJRatio * 100).toFixed(1)}% → ${(improvedJRatio * 100).toFixed(1)}% (${jImprovement}%p 증가)`);

    if (improvedJRatio > 0.3) {
        console.log('✅ J/Y 축 심각한 편향 문제가 크게 개선되었습니다!');
    } else if (improvedJRatio > 0.25) {
        console.log('🔶 J/Y 축 편향이 일부 개선되었지만 추가 조정이 필요합니다.');
    } else {
        console.log('❌ J/Y 축 편향 문제가 여전히 심각합니다. 알고리즘 재검토 필요.');
    }

    return {
        original: originalResults,
        improved: improvedResults,
        testCases: testCases
    };
}

/**
 * 개선 알고리즘만으로 상세 분석
 */
function analyzeImprovedAlgorithm() {
    console.log('\n\n🔍 개선된 알고리즘 상세 분석\n');

    const result = testImprovedDistribution(5000);

    console.log(`📊 총 ${result.totalTests}회 테스트, ${result.foundTypes}/16 유형 발견\n`);

    // 유형별 분포 (빈도순 정렬)
    const sortedTypes = Object.entries(result.typeDistribution)
        .sort((a, b) => b[1] - a[1]);

    console.log('📈 유형별 분포 (빈도순):');
    sortedTypes.forEach(([type, count]) => {
        const percentage = ((count / result.totalTests) * 100).toFixed(2);
        const bar = '█'.repeat(Math.ceil(percentage / 3));
        console.log(`${type}: ${count.toString().padStart(4)}회 (${percentage.padStart(5)}%) ${bar}`);
    });

    // 축별 분포
    console.log('\n🎯 축별 균형도:');

    Object.entries(result.axisDistribution).forEach(([axisName, distribution]) => {
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        const keys = Object.keys(distribution);

        console.log(`\n${axisName}:`);
        keys.forEach(key => {
            const count = distribution[key];
            const percentage = ((count / total) * 100).toFixed(1);
            console.log(`  ${key}: ${count}회 (${percentage}%)`);
        });

        // 균형도 (50%에서의 편향도)
        if (keys.length === 2) {
            const ratio1 = distribution[keys[0]] / total;
            const bias = Math.abs(ratio1 - 0.5) * 100;
            const status = bias < 5 ? '✅ 매우 균형' : bias < 10 ? '🔶 양호' : '❌ 편향됨';
            console.log(`     편향도: ${bias.toFixed(1)}% ${status}`);
        }
    });

    return result;
}

// 메인 실행
if (require.main === module) {
    const comparisonResult = compareAlgorithms();
    const detailedResult = analyzeImprovedAlgorithm();

    console.log('\n' + '='.repeat(80));
    console.log('🏁 최종 결론');
    console.log('='.repeat(80));

    if (detailedResult.foundTypes === 16) {
        console.log('✅ 모든 16가지 유형이 발견되었습니다.');
    } else {
        console.log(`❌ ${16 - detailedResult.foundTypes}개 유형이 누락되었습니다.`);
    }

    const improvedJRatio = comparisonResult.improved.axes.J / comparisonResult.testCases;
    if (improvedJRatio >= 0.3 && improvedJRatio <= 0.7) {
        console.log('✅ J/Y 축 편향 문제가 해결되었습니다.');
    } else {
        console.log('🔧 J/Y 축이 여전히 조정이 필요합니다.');
    }
}

module.exports = {
    compareAlgorithms,
    analyzeImprovedAlgorithm
};