// 오행별 설명을 불러오는 유틸리티 함수

/**
 * 오행 속성에 따른 설명 데이터 불러오기
 * @param {string} dominantElement - 가장 강한 오행 속성 (木, 火, 土, 金, 水)
 * @returns {Object|null} 해당 오행의 설명 데이터
 */
export const getFiveElementDescription = async (dominantElement) => {
  if (!dominantElement) return null;

  // 한자를 한글로 매핑
  const elementMapping = {
    '木': '목',
    '火': '화',
    '土': '토',
    '金': '금',
    '水': '수'
  };

  const koreanElement = elementMapping[dominantElement];
  if (!koreanElement) return null;

  try {
    const response = await fetch(`/documents/오행/${koreanElement}_description.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${koreanElement} description`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading five elements description:', error);
    return null;
  }
};

/**
 * 오행별 기본 특성 설명
 */
export const getFiveElementBasicInfo = (element) => {
  const basicInfo = {
    '木': {
      name: '목(木)',
      characteristic: '성장과 창조의 에너지',
      color: '#22c55e',
      personality: '독립적이고 자주적인 성향, 성장 지향적'
    },
    '火': {
      name: '화(火)',
      characteristic: '열정과 활동의 에너지',
      color: '#ef4444',
      personality: '활동적이고 표현력이 뛰어난 성향, 리더십'
    },
    '土': {
      name: '토(土)',
      characteristic: '안정과 포용의 에너지',
      color: '#eab308',
      personality: '안정적이고 신뢰할 수 있는 성향, 중재자'
    },
    '金': {
      name: '금(金)',
      characteristic: '정의와 절제의 에너지',
      color: '#e5e7eb',
      personality: '원칙적이고 체계적인 성향, 완벽주의'
    },
    '水': {
      name: '수(水)',
      characteristic: '지혜와 적응의 에너지',
      color: '#3b82f6',
      personality: '지혜롭고 적응력이 뛰어난 성향, 통찰력'
    }
  };

  return basicInfo[element] || null;
};