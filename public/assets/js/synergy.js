// Kakao SDK 초기화 (팔자유형 분석과 동일한 패턴)
document.addEventListener('DOMContentLoaded', function() {
    // Kakao SDK는 HTML에서 로드되므로 별도 초기화 불필요
    // 실제 사용 시 카카오 개발자 콘솔에서 JavaScript 키 설정 필요
});

// MBTI 유형 데이터
const mbtiTypes = [
    { value: 'INTJ', label: 'INTJ' },
    { value: 'INTP', label: 'INTP' },
    { value: 'ENTJ', label: 'ENTJ' },
    { value: 'ENTP', label: 'ENTP' },
    { value: 'INFJ', label: 'INFJ' },
    { value: 'INFP', label: 'INFP' },
    { value: 'ENFJ', label: 'ENFJ' },
    { value: 'ENFP', label: 'ENFP' },
    { value: 'ISTJ', label: 'ISTJ' },
    { value: 'ISFJ', label: 'ISFJ' },
    { value: 'ESTJ', label: 'ESTJ' },
    { value: 'ESFJ', label: 'ESFJ' },
    { value: 'ISTP', label: 'ISTP' },
    { value: 'ISFP', label: 'ISFP' },
    { value: 'ESTP', label: 'ESTP' },
    { value: 'ESFP', label: 'ESFP' }
];

// 팔자유형 데이터 (database.json alias 참고)
const paljaTypes = [
    { value: 'WSIJ', label: 'WSIJ - 별을 읽는 책사' },
    { value: 'NGHJ', label: 'NGHJ - 이른 봄의 햇살' },
    { value: 'WSIY', label: 'WSIY - 길을 여는 불꽃' },
    { value: 'NSHJ', label: 'NSHJ - 진심을 담는 공예가' },
    { value: 'WGIJ', label: 'WGIJ - 꿈을 짓는 설계자' },
    { value: 'NGHY', label: 'NGHY - 이야기를 만드는 작가' },
    { value: 'WGHY', label: 'WGHY - 가을 들판의 풍요' },
    { value: 'NSHY', label: 'NSHY - 일상 속 여행자' },
    { value: 'WSHJ', label: 'WSHJ - 숲을 가꾸는 정원사' },
    { value: 'NGIJ', label: 'NGIJ - 고요한 밤의 등대' },
    { value: 'WSHY', label: 'WSHY - 영감을 주는 아티스트' },
    { value: 'NSIJ', label: 'NSIJ - 믿음을 주는 기준점' },
    { value: 'WGHJ', label: 'WGHJ - 마음을 잇는 메신저' },
    { value: 'NGIY', label: 'NGIY - 자신만의 섬을 가진 탐험가' },
    { value: 'WGIY', label: 'WGIY - 세상을 바꾸는 물결' },
    { value: 'NSIY', label: 'NSIY - 자신만의 검을 벼리는 장인' }
];

// MBTI와 팔자유형의 4차원 특성 매핑
const mbtiCharacteristics = {
    // 에너지 차원 (E/I)
    energy: {
        'E': 'external', // 외향: 적극적/사교적
        'I': 'internal'  // 내향: 신중함/내적 성찰
    },
    // 라이프스타일 차원 (J/P)
    lifestyle: {
        'J': 'structured', // 판단: 계획적/체계적
        'P': 'flexible'    // 인식: 즉흥적/자율적
    },
    // 인식방식 차원 (S/N)
    perception: {
        'S': 'realistic', // 감각: 현실/경험 중시
        'N': 'idealistic' // 직관: 이상/가능성 중시
    },
    // 판단방식 차원 (T/F)
    decision: {
        'T': 'logical',   // 사고: 논리/원칙 중시
        'F': 'emotional'  // 감정: 관계/조화 중시
    }
};

const paljaCharacteristics = {
    // 에너지 차원 (W/N)
    energy: {
        'W': 'powerful',  // 외강: 고출력/강력한 힘
        'N': 'stable'     // 내유: 안정적/효율적인 힘
    },
    // 라이프스타일 차원 (Y/J)
    lifestyle: {
        'Y': 'dynamic',   // 유랑: 역동적/변화무쌍
        'J': 'steady'     // 정주: 안정적/예측 가능
    },
    // 인식방식 차원 (G/S)
    perception: {
        'G': 'conceptual', // 관념: 정신적 가치 추구
        'S': 'practical'   // 실리: 구체적인 성과 추구
    },
    // 판단방식 차원 (H/I)
    decision: {
        'H': 'harmony',   // 화합: 사람/소통 중시
        'I': 'systematic' // 이성: 시스템/규율 중시
    }
};

// 4차원 시너지 점수 계산 로직
const synergyScoring = {
    energy: {
        // E+W 또는 I+N → 25점 (환상의 짝)
        'external-powerful': 25,
        'internal-stable': 25,
        // I+W 또는 E+N → 15점 (보완적인 짝)
        'internal-powerful': 15,
        'external-stable': 15
    },
    lifestyle: {
        // J+J 또는 P+Y → 25점 (환상의 짝)
        'structured-steady': 25,
        'flexible-dynamic': 25,
        // J+Y 또는 P+J → 15점 (보완적인 짝)
        'structured-dynamic': 15,
        'flexible-steady': 15
    },
    perception: {
        // S+S 또는 N+G → 25점 (환상의 짝)
        'realistic-practical': 25,
        'idealistic-conceptual': 25,
        // S+G 또는 N+S → 5점 (노력이 필요한 짝)
        'realistic-conceptual': 5,
        'idealistic-practical': 5
    },
    decision: {
        // T+I 또는 F+H → 25점 (환상의 짝)
        'logical-systematic': 25,
        'emotional-harmony': 25,
        // T+H 또는 F+I → 15점 (보완적인 짝)
        'logical-harmony': 15,
        'emotional-systematic': 15
    }
};

// 시너지 타입별 메시지 템플릿
const synergyTypeMessages = {
    fantastic: {
        emoji: '✨',
        type: '환상의 시너지',
        subtitle: (mbti, palja) => generateSubtitle(mbti, palja),
        description: (mbti, palja) => generateDescription(mbti, palja, 'fantastic'),
        advice: (mbti, palja) => generateAdvice(mbti, palja, 'fantastic')
    },
    potential: {
        emoji: '🌱',
        type: '잠재력 폭발',
        subtitle: (mbti, palja) => generateSubtitle(mbti, palja),
        description: (mbti, palja) => generateDescription(mbti, palja, 'potential'),
        advice: (mbti, palja) => generateAdvice(mbti, palja, 'potential')
    },
    caution: {
        emoji: '🚦',
        type: '과부하 주의',
        subtitle: (mbti, palja) => generateSubtitle(mbti, palja),
        description: (mbti, palja) => generateDescription(mbti, palja, 'caution'),
        advice: (mbti, palja) => generateAdvice(mbti, palja, 'caution')
    },
    mismatch: {
        emoji: '🧩',
        type: '엇박자 궁합',
        subtitle: (mbti, palja) => generateSubtitle(mbti, palja),
        description: (mbti, palja) => generateDescription(mbti, palja, 'mismatch'),
        advice: (mbti, palja) => generateAdvice(mbti, palja, 'mismatch')
    }
};

// MBTI와 팔자유형 조합별 개성있는 부제목 생성
function generateSubtitle(mbti, palja) {
    const mbtiNames = {
        'INTJ': '전략가', 'INTP': '논리술사', 'ENTJ': '통솔자', 'ENTP': '변론가',
        'INFJ': '옹호자', 'INFP': '중재자', 'ENFJ': '선도자', 'ENFP': '활동가',
        'ISTJ': '현실주의자', 'ISFJ': '수호자', 'ESTJ': '경영자', 'ESFJ': '집정관',
        'ISTP': '만능재주꾼', 'ISFP': '모험가', 'ESTP': '사업가', 'ESFP': '연예인'
    };
    
    const paljaNames = {
        'WSIJ': '별을 읽는 책사', 'NGHJ': '이른 봄의 햇살', 'WSIY': '길을 여는 불꽃',
        'NSHJ': '진심을 담는 공예가', 'WGIJ': '꿈을 짓는 설계자', 'NGHY': '이야기를 만드는 작가',
        'WGHY': '가을 들판의 풍요', 'NSHY': '일상 속 여행자', 'WSHJ': '숲을 가꾸는 정원사',
        'NGIJ': '고요한 밤의 등대', 'WSHY': '영감을 주는 아티스트', 'NSIJ': '믿음을 주는 기준점',
        'WGHJ': '마음을 잇는 메신저', 'NGIY': '자신만의 섬을 가진 탐험가', 'WGIY': '세상을 바꾸는 물결',
        'NSIY': '자신만의 검을 벼리는 장인'
    };

    const mbtiFullName = `${mbti} (${mbtiNames[mbti]})`;
    const paljaFullName = `${palja} (${paljaNames[palja]})`;
    
    return `타고난 성격: ${mbtiFullName}과<br>운명의 흐름: ${paljaFullName}이 만났을 때`;
}

// 시너지 타입별 토리의 비유 풀이 생성
function generateDescription(mbti, palja, synergyType) {
    const descriptions = {
        fantastic: '하늘이 내린 운전 실력에 최첨단 슈퍼카를 만난 격이구려. 당신의 성격과 운명의 흐름이 완벽한 조화를 이루어, 어떤 목표를 향해 달려도 거침이 없을 것입니다. 이 환상적인 시너지는 당신의 잠재력을 최고조로 이끌어낼 것입니다.',
        potential: '뛰어난 운전자가 아직 길이 들지 않은 야생마를 만난 듯한 모습이오. 처음에는 서로의 리듬을 맞추기 어려울 수 있지만, 일단 합이 맞기 시작하면 그 누구도 따라올 수 없는 폭발적인 에너지를 뿜어낼 것입니다. 당신의 잠재력은 무한합니다.',
        caution: '강력한 힘을 자랑하는 오프로드 트럭에 섬세한 컨트롤이 필요한 스포츠카의 엔진을 얹은 것 같구려. 넘치는 에너지가 때로는 과부하를 일으킬 수 있으니, 자신의 강점을 정확히 이해하고 섬세하게 조율하는 지혜가 필요합니다.',
        mismatch: '편안한 세단을 타고 비포장도로를 달리거나, 스포츠카로 험난한 산길을 오르는 듯한 모습이구려. 각자의 장점이 다른 환경에서 발휘되고 있어 삐걱거릴 수 있습니다. 하지만 이 엇박자 속에서 예상치 못한 새로운 길을 발견할 수도 있습니다.'
    };
    
    return descriptions[synergyType];
}

// 시너지 타입별 토리의 조언 생성
function generateAdvice(mbti, palja, synergyType) {
    const advices = {
        fantastic: '최상의 조합을 손에 넣었으니, 이제는 더 큰 무대로 나아갈 때요. 당신의 능력을 세상에 증명해 보이시오. 단, 자만심은 금물이니 늘 겸손한 마음으로 정진해야 할 것이오.',
        potential: '서로 다른 두 힘을 조화롭게 융합하는 것이 관건이구려. 끊임없는 소통과 성찰을 통해 당신 안에 숨겨진 잠재력을 깨우시오. 머지않아 놀라운 변화가 시작될 것입니다.',
        caution: '강력한 에너지를 다스리는 법을 배워야 하오. 때로는 과감하게 속도를 내고, 때로는 차분하게 자신을 돌아보는 여유를 가지시오. 당신의 힘을 올바르게 사용할 때, 비로소 진정한 가치가 발휘될 것입니다.',
        mismatch: '서로의 다름을 인정하고 존중하는 것에서부터 시작해야 하오. 불편함 속에서 새로운 가능성을 찾고, 부족한 부분은 기꺼이 배우는 자세를 갖춘다면, 이 엇박자는 당신을 더욱 성장시키는 밑거름이 될 것입니다.'
    };
    
    return advices[synergyType];
}

// DOM 요소들
let mbtiSelect, paljaSelect, analyzeBtn;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    mbtiSelect = document.getElementById('mbti-select');
    paljaSelect = document.getElementById('palja-select');
    analyzeBtn = document.getElementById('analyze-synergy');
    
    // 드롭다운 메뉴 채우기
    populateDropdowns();
    
    // 이벤트 리스너 추가
    mbtiSelect.addEventListener('change', checkFormCompletion);
    paljaSelect.addEventListener('change', checkFormCompletion);
    analyzeBtn.addEventListener('click', analyzeSynergy);
    
    // 모바일 메뉴 토글 초기화는 mobile-menu.js에서 처리
    // initializeMobileMenu();
});

// 드롭다운 메뉴 채우기
function populateDropdowns() {
    // MBTI 드롭다운 채우기
    mbtiTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        mbtiSelect.appendChild(option);
    });
    
    // 팔자유형 드롭다운 채우기
    paljaTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        paljaSelect.appendChild(option);
    });
}

// 폼 완성도 체크
function checkFormCompletion() {
    const mbtiSelected = mbtiSelect.value !== '';
    const paljaSelected = paljaSelect.value !== '';
    
    analyzeBtn.disabled = !(mbtiSelected && paljaSelected);
}

// 시너지 분석 실행
function analyzeSynergy() {
    const selectedMbti = mbtiSelect.value;
    const selectedPalja = paljaSelect.value;
    
    if (!selectedMbti || !selectedPalja) return;
    
    // 분석 결과 계산
    const result = calculateSynergy(selectedMbti, selectedPalja);
    
    // 결과 표시
    displaySynergyResult(result);
}

// 4차원 시너지 분석 메인 함수
function calculateSynergy(mbti, palja) {
    // 1. MBTI 특성 추출
    const mbtiTraits = {
        energy: mbtiCharacteristics.energy[mbti[0]], // E 또는 I
        perception: mbtiCharacteristics.perception[mbti[1]], // S 또는 N  
        decision: mbtiCharacteristics.decision[mbti[2]], // T 또는 F
        lifestyle: mbtiCharacteristics.lifestyle[mbti[3]] // J 또는 P
    };
    
    // 2. 팔자유형 특성 추출
    const paljaTraits = {
        energy: paljaCharacteristics.energy[palja[0]], // W 또는 N
        perception: paljaCharacteristics.perception[palja[1]], // G 또는 S
        decision: paljaCharacteristics.decision[palja[2]], // H 또는 I
        lifestyle: paljaCharacteristics.lifestyle[palja[3]] // J 또는 Y
    };
    
    // 3. 각 차원별 점수 계산
    const scores = {
        energy: synergyScoring.energy[`${mbtiTraits.energy}-${paljaTraits.energy}`] || 0,
        lifestyle: synergyScoring.lifestyle[`${mbtiTraits.lifestyle}-${paljaTraits.lifestyle}`] || 0,
        perception: synergyScoring.perception[`${mbtiTraits.perception}-${paljaTraits.perception}`] || 0,
        decision: synergyScoring.decision[`${mbtiTraits.decision}-${paljaTraits.decision}`] || 0
    };
    
    // 4. 총점 계산
    const totalScore = scores.energy + scores.lifestyle + scores.perception + scores.decision;
    
    // 5. 시너지 타입 판별
    let synergyType;
    if (totalScore >= 90) {
        synergyType = 'fantastic';
    } else if (totalScore >= 70) {
        synergyType = 'potential';
    } else if (totalScore >= 50) {
        synergyType = 'caution';
    } else {
        synergyType = 'mismatch';
    }
    
    // 6. 결과 객체 생성
    const template = synergyTypeMessages[synergyType];
    const result = {
        score: totalScore,
        type: `${template.emoji} ${template.type}`,
        subtitle: template.subtitle(mbti, palja),
        description: template.description(mbti, palja, synergyType),
        advice: template.advice(mbti, palja, synergyType),
        breakdown: scores, // 차원별 점수 상세 정보
        synergy_type: { // 이미지 생성에 필요한 데이터 추가
            user1_mbti: mbti,
            user2_palja: palja
        }
    };
    
    return result;
}

// 시너지 결과 표시 (개선된 버전)
function displaySynergyResult(result) {
    const resultSection = document.getElementById('result-section');
    if (!result) {
        resultSection.style.display = 'none';
        resultSection.innerHTML = '';
        return;
    }

    // 시너지 타입에 따른 클래스 결정
    const synergyClass = getSynergyClass(result.score);
    
    const resultHTML = `
        <div class="synergy-score-display">
            <div class="circular-progress">
                <svg viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id="fantasticGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#66BB6A;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="potentialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#FCA311;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="cautionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#FF9800;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#FFB74D;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="mismatchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#F44336;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#EF5350;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <circle class="bg-circle" cx="60" cy="60" r="52"></circle>
                    <circle class="progress-circle ${synergyClass}" cx="60" cy="60" r="52" 
                            stroke-dasharray="0 327" data-target="${(result.score / 100) * 327}"></circle>
                </svg>
                <div class="score-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; pointer-events: none; text-align: center;">
                    <span class="score-number">${result.score}</span><span class="score-label">점</span>
                </div>
            </div>
            <div class="score-type-display">${result.type}</div>
        </div>
        <p class="result-description">${result.subtitle}</p>

        <div class="info-card" style="margin-top: 25px;">
            <h3>[토리가 풀이하는 당신의 시너지]</h3>
            <p>${result.description}</p>
        </div>

        <div class="info-card">
            <h3>[토리가 건네는 조언]</h3>
            <p>${result.advice}</p>
        </div>

        <div class="info-card breakdown-card">
            <h3>[차원별 조화도 분석]</h3>
            <div class="synergy-graph">
                <div class="graph-item">
                    <div class="graph-label">
                        <span class="graph-dimension">에너지</span>
                        <span class="graph-score">${result.breakdown.energy}점</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill score-${result.breakdown.energy}" data-width="${(result.breakdown.energy / 25) * 100}"></div>
                    </div>
                </div>
                <div class="graph-item">
                    <div class="graph-label">
                        <span class="graph-dimension">라이프스타일</span>
                        <span class="graph-score">${result.breakdown.lifestyle}점</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill score-${result.breakdown.lifestyle}" data-width="${(result.breakdown.lifestyle / 25) * 100}"></div>
                    </div>
                </div>
                <div class="graph-item">
                    <div class="graph-label">
                        <span class="graph-dimension">인식방식</span>
                        <span class="graph-score">${result.breakdown.perception}점</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill score-${result.breakdown.perception}" data-width="${(result.breakdown.perception / 25) * 100}"></div>
                    </div>
                </div>
                <div class="graph-item">
                    <div class="graph-label">
                        <span class="graph-dimension">판단방식</span>
                        <span class="graph-score">${result.breakdown.decision}점</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill score-${result.breakdown.decision}" data-width="${(result.breakdown.decision / 25) * 100}"></div>
                    </div>
                </div>
            </div>
            <div class="dimension-explanations" style="margin-top: 20px; padding: 15px; background: rgba(252, 163, 17, 0.1); border-radius: 8px; font-size: 14px; line-height: 1.6;">
                <div style="margin-bottom: 8px;"><strong>에너지:</strong> 내향성(I)과 외향성(E)의 조화 - 혼자만의 시간과 사람들과의 시간 균형</div>
                <div style="margin-bottom: 8px;"><strong>라이프스타일:</strong> 계획성(J)과 유연성(P)의 조화 - 체계적 접근과 즉흥적 대응의 균형</div>
                <div style="margin-bottom: 8px;"><strong>인식방식:</strong> 감각(S)과 직관(N)의 조화 - 현실적 정보와 미래 가능성의 균형</div>
                <div><strong>판단방식:</strong> 사고(T)와 감정(F)의 조화 - 논리적 분석과 감정적 고려의 균형</div>
            </div>
        </div>
    `;

    resultSection.innerHTML = resultHTML;
    resultSection.style.display = 'block';
    
    // 원형 게이지와 진행률 바 애니메이션 실행
    setTimeout(() => {
        animateCircularProgress();
        animateProgressBars();
    }, 100);
    
    // 시너지 결과 공유 버튼 추가
    setTimeout(() => {
        addSynergyShareButtons(result);
    }, 500);
    
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 시너지 점수에 따른 CSS 클래스 결정
function getSynergyClass(score) {
    if (score >= 90) return 'fantastic';
    if (score >= 70) return 'potential';
    if (score >= 50) return 'caution';
    return 'mismatch';
}

// 원형 게이지 애니메이션 함수
function animateCircularProgress() {
    const progressCircle = document.querySelector('.progress-circle');
    if (!progressCircle) return;
    
    const targetValue = progressCircle.getAttribute('data-target');
    
    // 애니메이션 시작
    setTimeout(() => {
        progressCircle.style.strokeDasharray = `${targetValue} 327`;
    }, 300);
}

// 진행률 바 애니메이션 함수
function animateProgressBars() {
    const progressFills = document.querySelectorAll('.progress-fill');
    
    progressFills.forEach(fill => {
        const targetWidth = fill.getAttribute('data-width');
        fill.style.width = '0%';
        
        // 약간의 지연을 두고 애니메이션 시작
        setTimeout(() => {
            fill.style.width = targetWidth + '%';
        }, 200);
    });
}

// 시너지 분석 결과 공유 기능 ("내 팔자 유형 자랑하기" 스타일)
function addSynergyShareButtons(result) {
    const resultSection = document.getElementById('result-section');
    if (!resultSection || resultSection.querySelector('.synergy-share-section')) return;

    const shareButtonsHTML = `
        <div class="synergy-share-section" style="margin-top: 30px; text-align: center;">
            <button class="synergy-share-btn" onclick="openSynergyShareModal()" style="
                background: linear-gradient(135deg, #FCA311, #DAA520);
                color: #1A1A1D;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(252, 163, 17, 0.3);
                transition: all 0.3s ease;
                margin-bottom: 10px;
            ">✨ 내 시너지 자랑하기</button>
        </div>
    `;

    resultSection.insertAdjacentHTML('beforeend', shareButtonsHTML);
    
    // 현재 시너지 결과 저장
    window.currentSynergyResult = result;
    
    // 공유 모달 HTML 추가
    addSynergyShareModal();
}

// 시너지 공유 모달 추가
function addSynergyShareModal() {
    if (document.getElementById('synergy-share-modal')) return;

    const modalHTML = `
        <div id="synergy-share-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>내 시너지 자랑하기</h3>
                    <span class="close-modal" onclick="closeSynergyShareModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="share-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <button id="synergy-share-link" class="share-option-btn link" onclick="copySynergyLink()">
                            <span>🔗 링크 복사</span>
                        </button>
                        <button id="synergy-share-image" class="share-option-btn image" onclick="downloadSynergyImage()">
                            <span>📱 이미지 저장</span>
                        </button>
                    </div>
                    <div class="share-guide-message">
                        <p>💡 <strong>공유 팁:</strong> 이미지를 저장한 후 SNS에 공유하고 링크를 첨부해주세요!</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 시너지 공유 모달 열기 (전역 함수로 선언)
window.openSynergyShareModal = function() {
    const modal = document.getElementById('synergy-share-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 시너지 공유 모달 닫기 (전역 함수로 선언)
window.closeSynergyShareModal = function() {
    const modal = document.getElementById('synergy-share-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 카카오톡 공유 (팔자유형 분석 패턴과 동일하게 수정)
function shareSynergyToKakao() {
    const result = window.currentSynergyResult;
    if (!result) {
        showSynergyToast('공유할 결과가 없습니다.');
        return;
    }

    if (typeof Kakao === 'undefined') {
        showSynergyToast('카카오 SDK가 로드되지 않았습니다.');
        return;
    }

    const shareText = `나의 MBTI × 팔자유형 시너지 분석 결과!\n\n${result.type} (${result.score}점)\n${result.subtitle}\n\n성격팔자에서 나만의 시너지를 확인해보세요!`;

    try {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `나의 시너지 유형: ${result.type}`,
                description: shareText,
                imageUrl: 'https://seonggyeok-palja.web.app/assets/images/logo.png',
                link: {
                    mobileWebUrl: window.location.origin + '/synergy.html',
                    webUrl: window.location.origin + '/synergy.html'
                }
            },
            buttons: [{
                title: '나도 시너지 분석하기',
                link: {
                    mobileWebUrl: window.location.origin + '/synergy.html',
                    webUrl: window.location.origin + '/synergy.html'
                }
            }]
        });
        showSynergyToast('카카오톡으로 공유했습니다! 💬');
    } catch (error) {
        console.error('카카오톡 공유 오류:', error);
        showSynergyToast('카카오톡 공유 중 오류가 발생했습니다.');
    }
}

// 링크 복사 (모달 닫기 추가) - 전역 함수로 선언
window.copySynergyLink = async function() {
    try {
        await navigator.clipboard.writeText(window.location.href);
        showSynergyToast('링크가 복사되었습니다! 📋');
        closeSynergyShareModal();
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSynergyToast('링크가 복사되었습니다! 📋');
        closeSynergyShareModal();
    }
}

// 이미지 다운로드 (모달 닫기 추가) - 전역 함수로 선언
window.downloadSynergyImage = async function() {
    const result = window.currentSynergyResult;
    if (!result) {
        showSynergyToast('저장할 결과가 없습니다.');
        return;
    }

    showSynergyToast('이미지를 생성하고 있습니다... ⏳');
    
    try {
        const blob = await saveSynergyAsImage();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `나의_시너지_분석_${result.type.replace(/[^\w가-힣]/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showSynergyToast('이미지가 저장되었습니다! 📱');
        closeSynergyShareModal();
    } catch (error) {
        console.error('이미지 저장 오류:', error);
        showSynergyToast('이미지 저장 중 오류가 발생했습니다.');
    }
}

// 시너지 분석 결과를 이미지로 저장하는 함수 (팔자유형 분석 스타일)
async function saveSynergyAsImage() {
    const result = window.currentSynergyResult;
    if (!result) {
        showSynergyToast('저장할 결과가 없습니다.');
        return;
    }
    
    // MBTI와 팔자유형 정보 추출
    const mbti = mbtiSelect.value;
    const palja = paljaSelect.value;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 적절한 이미지 크기 (컨텐츠에 맞게 조정)
    canvas.width = 1080;
    canvas.height = 1800;

    // 배경 그라디언트
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#1A1A1D');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별 패턴 추가
    ctx.fillStyle = 'rgba(252, 163, 17, 0.08)';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    const padding = 60;
    const contentWidth = canvas.width - (padding * 2);
    let currentY = 80;

    // 로고/브랜드 영역
    ctx.fillStyle = '#FCA311';
    ctx.font = 'bold 48px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('성격팔자', canvas.width / 2, currentY);
    currentY += 50;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '28px Pretendard, sans-serif';
    ctx.fillText('MBTI × 팔자유형 시너지 분석', canvas.width / 2, currentY);
    currentY += 80;

    // ===== 시너지 점수 섹션 =====
    const scoreSection = 340; // 배경 높이 증가
    drawSectionBackground(ctx, padding, currentY - 40, contentWidth, scoreSection); // 배경 y 위치 조정
    
    // 시너지 유형
    ctx.fillStyle = '#FCA311';
    ctx.font = 'bold 52px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(result.type, canvas.width / 2, currentY); // 제목 y 위치 조정
    currentY += 30; // 제목과 게이지 사이 여백 증가

    // 원형 게이지
    const gaugeX = canvas.width / 2;
    const gaugeY = currentY + 80;
    const gaugeRadius = 70;
    const endAngle = (result.score / 100) * 2 * Math.PI - (0.5 * Math.PI);

    // 게이지 배경
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 10;
    ctx.stroke();

    // 게이지 채우기
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius, -0.5 * Math.PI, endAngle);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 10;
    ctx.stroke();

    // 점수 (게이지 내부, 한 줄로)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Pretendard, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${result.score}점`, gaugeX, gaugeY);
    ctx.textBaseline = 'alphabetic'; // 텍스트 기준선 복원

    currentY = gaugeY + gaugeRadius + 40; // 게이지와 다음 내용 사이 여백

    // 서브타이틀 (게이지 아래로 이동)
    ctx.fillStyle = '#DAA520';
    ctx.font = 'bold 24px Pretendard, sans-serif';
    
    // MBTI와 팔자유형 이름 매핑
    const mbtiNames = {
        'INTJ': '전략가', 'INTP': '논리술사', 'ENTJ': '통솔자', 'ENTP': '변론가',
        'INFJ': '옹호자', 'INFP': '중재자', 'ENFJ': '선도자', 'ENFP': '활동가',
        'ISTJ': '현실주의자', 'ISFJ': '수호자', 'ESTJ': '경영자', 'ESFJ': '집정관',
        'ISTP': '만능재주꾼', 'ISFP': '모험가', 'ESTP': '사업가', 'ESFP': '연예인'
    };
    const paljaNames = {
        'WSIJ': '별을 읽는 책사', 'NGHJ': '이른 봄의 햇살', 'WSIY': '길을 여는 불꽃',
        'NSHJ': '진심을 담는 공예가', 'WGIJ': '꿈을 짓는 설계자', 'NGHY': '이야기를 만드는 작가',
        'WGHY': '가을 들판의 풍요', 'NSHY': '일상 속 여행자', 'WSHJ': '숲을 가꾸는 정원사',
        'NGIJ': '고요한 밤의 등대', 'WSHY': '영감을 주는 아티스트', 'NSIJ': '믿음을 주는 기준점',
        'WGHJ': '마음을 잇는 메신저', 'NGIY': '자신만의 섬을 가진 탐험가', 'WGIY': '세상을 바꾸는 물결',
        'NSIY': '자신만의 검을 벼리는 장인'
    };

    const subtitle1 = `타고난 성격: ${result.synergy_type.user1_mbti} (${mbtiNames[result.synergy_type.user1_mbti] || ''})`;
    const subtitle2 = `운명의 흐름: ${result.synergy_type.user2_palja} (${paljaNames[result.synergy_type.user2_palja] || ''})`;
    const subtitle3 = '이 만났을 때';

    ctx.fillText(subtitle1, canvas.width / 2, currentY);
    currentY += 40;
    ctx.fillText(subtitle2, canvas.width / 2, currentY);
    currentY += 40;
    ctx.fillText(subtitle3, canvas.width / 2, currentY);

    currentY += 50; // 서브타이틀과 다음 섹션 사이 여백

    // ===== 토리가 풀이하는 당신의 시너지 섹션 =====
    const descriptionHeight = calculateTextHeight(ctx, result.description, contentWidth - 40, '24px Pretendard, sans-serif') + 100;
    drawSectionBackground(ctx, padding, currentY - 20, contentWidth, descriptionHeight);
    
    ctx.fillStyle = '#FCA311';
    ctx.font = 'bold 32px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('토리가 풀이하는 당신의 시너지', canvas.width / 2, currentY + 10);
    currentY += 60; // 섹션 제목과 내용 사이 여백 증가

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Pretendard, sans-serif';
    ctx.textAlign = 'left';
    const descriptionLines = wrapText(ctx, result.description, contentWidth - 40);
    descriptionLines.forEach(line => {
        ctx.fillText(line, padding + 20, currentY);
        currentY += 35;
    });

    currentY += 50; // '풀이' 섹션과 다음 섹션 사이 여백 추가

    // ===== 토리가 건네는 조언 섹션 =====
    const adviceHeight = calculateTextHeight(ctx, result.advice, contentWidth - 40, '24px Pretendard, sans-serif') + 100;
    drawSectionBackground(ctx, padding, currentY - 20, contentWidth, adviceHeight);
    
    ctx.fillStyle = '#FCA311';
    ctx.font = 'bold 32px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('토리가 건네는 조언', canvas.width / 2, currentY + 10);
    currentY += 60; // 섹션 제목과 내용 사이 여백 증가

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Pretendard, sans-serif';
    ctx.textAlign = 'left';
    const adviceLines = wrapText(ctx, result.advice, contentWidth - 40);
    adviceLines.forEach(line => {
        ctx.fillText(line, padding + 20, currentY);
        currentY += 35;
    });

    currentY += 60; // '조언' 섹션과 다음 섹션 사이 여백 추가

    // ===== 차원별 조화도 분석 섹션 =====
    const breakdownHeight = (4 * 100) + 100; // 4개 차원 * 100px 간격 + 여백
    drawSectionBackground(ctx, padding, currentY - 20, contentWidth, breakdownHeight);
    
    ctx.fillStyle = '#FCA311';
    ctx.font = 'bold 32px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('차원별 조화도 분석', canvas.width / 2, currentY + 10);
    currentY += 70; // 섹션 제목과 내용 사이 여백 증가

    // 차원별 분석 그래프
    const dimensions = [
        { name: '에너지', score: result.breakdown.energy, desc: '내향성과 외향성의 조화' },
        { name: '라이프스타일', score: result.breakdown.lifestyle, desc: '계획성과 유연성의 조화' },
        { name: '인식방식', score: result.breakdown.perception, desc: '감각과 직관의 조화' },
        { name: '판단방식', score: result.breakdown.decision, desc: '사고와 감정의 조화' }
    ];

    const barWidth = contentWidth - 60;
    const barHeight = 20;
    const barSpacing = 100; // 차원별 분석 항목 간격 증가
    const startX = padding + 30;

    dimensions.forEach((dim, index) => {
        const barY = currentY + (index * barSpacing);
        
        // 차원 이름과 점수
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Pretendard, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(dim.name, startX, barY - 8);

        // 설명 텍스트 (차원 이름 아래)
        ctx.fillStyle = '#AAA';
        ctx.font = '18px Pretendard, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(dim.desc, startX, barY + 22);
        
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Pretendard, sans-serif'; // 폰트 원상복구
        ctx.fillStyle = '#FFFFFF'; // 색상 원상복구
        ctx.fillText(`${dim.score}점`, startX + barWidth, barY - 8);
        
        // 진행률 바 배경 (설명 텍스트 아래로 위치 조정)
        const barTopY = barY + 40;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(startX, barTopY, barWidth, barHeight);
        
        // 진행률 바
        const fillWidth = (dim.score / 25) * barWidth;
        const barColor = dim.score >= 20 ? '#4CAF50' : 
                        dim.score >= 15 ? '#FCA311' : 
                        dim.score >= 10 ? '#FF9800' : '#F44336';
        ctx.fillStyle = barColor;
        ctx.fillRect(startX, barTopY, fillWidth, barHeight);
    });

    currentY += (dimensions.length * barSpacing) + 30;

    // 하단 정보 (여백 줄임)
    ctx.fillStyle = 'rgba(252, 163, 17, 0.8)';
    ctx.font = '22px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.font = '24px Pretendard, sans-serif'; // 주소 폰트 크기 증가
    ctx.fillText('seonggyeok-palja.web.app', canvas.width / 2, currentY);
    currentY += 35;
    ctx.font = '22px Pretendard, sans-serif';
    ctx.fillText('나만의 시너지를 확인해보세요!', canvas.width / 2, currentY);
    
    // 캔버스 높이를 실제 컨텐츠에 맞게 조정
    const finalHeight = currentY + 40;
    if (finalHeight < canvas.height) {
        const newCanvas = document.createElement('canvas');
        const newCtx = newCanvas.getContext('2d');
        newCanvas.width = canvas.width;
        newCanvas.height = finalHeight;
        newCtx.drawImage(canvas, 0, 0);
        canvas.width = newCanvas.width;
        canvas.height = newCanvas.height;
        ctx.drawImage(newCanvas, 0, 0);
    }

    return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 1.0);
    });
}

// 섹션 배경 그리기 함수
function drawSectionBackground(ctx, x, y, width, height) {
    ctx.fillStyle = 'rgba(252, 163, 17, 0.05)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'rgba(252, 163, 17, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
}

// 텍스트 줄바꿈 함수
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

// 텍스트 높이 계산 함수
function calculateTextHeight(ctx, text, maxWidth, font) {
    const originalFont = ctx.font;
    ctx.font = font;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 35; // 줄 간격
    ctx.font = originalFont;
    return lines.length * lineHeight;
}

// 섹션 높이 계산 함수
function calculateSectionHeight(title, score, baseHeight) {
    // 기본 높이에 컨텐츠에 따른 추가 높이 계산
    return baseHeight;
}

// 페이스북 공유 (팔자유형 분석 패턴과 동일하게 수정)
function shareSynergyToFacebook() {
    const result = window.currentSynergyResult;
    if (!result) {
        showSynergyToast('공유할 결과가 없습니다.');
        return;
    }

    const shareText = `나의 MBTI × 팔자유형 시너지: ${result.type} (${result.score}점)\n\n${result.subtitle}`;
    const url = encodeURIComponent(window.location.origin + '/synergy.html');
    const text = encodeURIComponent(shareText);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    
    try {
        window.open(shareUrl, 'facebook-share', 'width=600,height=400');
        showSynergyToast('페이스북으로 공유했습니다! 📘');
    } catch (error) {
        console.error('페이스북 공유 오류:', error);
        showSynergyToast('페이스북 공유 중 오류가 발생했습니다.');
    }
}

// 트위터 공유 (팔자유형 분석 패턴과 동일하게 수정)
function shareSynergyToTwitter() {
    const result = window.currentSynergyResult;
    if (!result) {
        showSynergyToast('공유할 결과가 없습니다.');
        return;
    }

    const shareText = `나의 MBTI × 팔자유형 시너지: ${result.type} (${result.score}점)\n\n${result.subtitle}\n\n#성격팔자 #MBTI #시너지분석`;
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(window.location.origin + '/synergy.html');
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    
    try {
        window.open(shareUrl, 'twitter-share', 'width=600,height=400');
        showSynergyToast('트위터로 공유했습니다! 🐦');
    } catch (error) {
        console.error('트위터 공유 오류:', error);
        showSynergyToast('트위터 공유 중 오류가 발생했습니다.');
    }
}

// 토스트 메시지
function showSynergyToast(message, duration = 3000) {
    const existingToast = document.querySelector('.synergy-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'synergy-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #FCA311;
        color: #1A1A1D;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(252, 163, 17, 0.3);
        animation: toastSlideUp 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideUp 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// 모바일 메뉴 토글 초기화 (mobile-menu.js와 중복 방지를 위해 제거)
// function initializeMobileMenu() {
//     const mobileMenuToggle = document.getElementById('mobileMenuToggle');
//     const mobileNav = document.getElementById('mobileNav');
//     
//     if (mobileMenuToggle && mobileNav) {
//         mobileMenuToggle.addEventListener('click', function() {
//             const isExpanded = this.getAttribute('aria-expanded') === 'true';
//             this.setAttribute('aria-expanded', !isExpanded);
//             mobileNav.classList.toggle('active');
//         });
//     }
// }
