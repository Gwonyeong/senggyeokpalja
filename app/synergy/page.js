"use client";

import { useState, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";

export default function SynergyPage() {
  const [selectedMBTI, setSelectedMBTI] = useState("");
  const [selectedPalja, setSelectedPalja] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // MBTI 유형 목록
  const mbtiTypes = [
    "INTJ",
    "INTP",
    "ENTJ",
    "ENTP",
    "INFJ",
    "INFP",
    "ENFJ",
    "ENFP",
    "ISTJ",
    "ISFJ",
    "ESTJ",
    "ESFJ",
    "ISTP",
    "ISFP",
    "ESTP",
    "ESFP",
  ];

  // 팔자 유형 목록 (4글자 알파벳 코드)
  const paljaTypes = [
    { code: "NGHJ", name: "이른 봄의 햇살", description: "타인을 배려하며 조화로운 관계를 추구하는 따뜻한 마음의 소유자" },
    { code: "NGHY", name: "이야기를 만드는 작가", description: "감성이 풍부하고 창의적이며 자유로운 영혼을 가진 예술가 기질" },
    { code: "NGIJ", name: "고요한 밤의 등대", description: "깊은 통찰력으로 타인을 이해하고 조언하는 지혜로운 상담자" },
    { code: "NGIY", name: "자신만의 섬을 가진 탐험가", description: "이상을 추구하며 세상을 더 나은 곳으로 만들고자 하는 꿈꾸는 이상주의자" },
    { code: "NSHJ", name: "진심을 담는 공예가", description: "체계적이고 신중하게 일을 처리하는 믿음직한 관리자" },
    { code: "NSHY", name: "일상 속 여행자", description: "조용하지만 따뜻하게 주변을 돌보는 온화한 수호자" },
    { code: "NSIJ", name: "믿음을 주는 기준점", description: "세심하고 완벽을 추구하는 뛰어난 기술과 감각의 장인" },
    { code: "NSIY", name: "자신만의 검을 벼리는 장인", description: "새로운 경험을 추구하며 순간을 즐기는 모험심 넘치는 탐험가" },
    { code: "WGHJ", name: "마음을 잇는 메신저", description: "타인을 이끌고 동기부여하는 천부적인 카리스마를 가진 리더" },
    { code: "WGHY", name: "가을 들판의 풍요", description: "사교적이고 활발하며 주변을 즐겁게 만드는 연예인 기질" },
    { code: "WGIJ", name: "꿈을 짓는 설계자", description: "신념을 가지고 세상을 변화시키려는 열정적인 활동가" },
    { code: "WGIY", name: "세상을 바꾸는 물결", description: "창의적 아이디어로 새로운 가능성을 제시하는 영감을 주는 혁신가" },
    { code: "WSHJ", name: "숲을 가꾸는 정원사", description: "현실적이고 효율적으로 목표를 달성하는 실용적인 경영자" },
    { code: "WSHY", name: "영감을 주는 아티스트", description: "팀워크를 중시하며 모두와 잘 어울리는 친근한 협력자" },
    { code: "WSIJ", name: "별을 읽는 책사", description: "체계적 사고로 문제를 해결하는 논리적이고 객관적인 분석가" },
    { code: "WSIY", name: "길을 여는 불꽃", description: "위험을 감수하며 새로운 기회를 창출하는 도전정신 넘치는 기업가" },
  ];

  useEffect(() => {
    // MBTI와 팔자유형 모두 선택되었을 때 버튼 활성화
    const button = document.getElementById("analyze-synergy");
    if (button) {
      button.disabled = !selectedMBTI || !selectedPalja;
    }
  }, [selectedMBTI, selectedPalja]);

  // 결과가 표시될 때 애니메이션 효과
  useEffect(() => {
    if (result) {
      // 원형 게이지 애니메이션
      setTimeout(() => {
        const progressCircle = document.querySelector('.progress-circle');
        if (progressCircle) {
          const targetValue = progressCircle.getAttribute('data-target');
          progressCircle.style.strokeDasharray = `${targetValue} 327`;
        }
      }, 300);

      // 진행률 바 애니메이션
      setTimeout(() => {
        const progressFills = document.querySelectorAll('.progress-fill');
        progressFills.forEach(fill => {
          const targetWidth = fill.getAttribute('data-width');
          fill.style.width = '0%';
          setTimeout(() => {
            fill.style.width = targetWidth + '%';
          }, 200);
        });
      }, 500);
    }
  }, [result]);

  const handleAnalyze = async () => {
    if (!selectedMBTI || !selectedPalja) return;

    setLoading(true);

    try {
      // 4차원 시너지 분석 결과 생성
      const compatibilityResult = calculateCompatibility(
        selectedMBTI,
        selectedPalja
      );
      const analysis = getCompatibilityAnalysis(
        selectedMBTI,
        selectedPalja,
        compatibilityResult.totalScore
      );

      setResult({
        mbti: selectedMBTI,
        palja: selectedPalja,
        compatibilityScore: compatibilityResult.totalScore,
        breakdown: compatibilityResult.breakdown,
        analysis,
        detailedAnalysis: getDetailedAnalysis(selectedMBTI, selectedPalja),
      });
    } catch (error) {
      console.error("시너지 분석 중 오류 발생:", error);
      alert("시너지 분석 중 오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // MBTI와 팔자유형의 4차원 특성 매핑
  const mbtiCharacteristics = {
    energy: {
      'E': 'external', // 외향: 적극적/사교적
      'I': 'internal'  // 내향: 신중함/내적 성찰
    },
    lifestyle: {
      'J': 'structured', // 판단: 계획적/체계적
      'P': 'flexible'    // 인식: 즉흥적/자율적
    },
    perception: {
      'S': 'realistic', // 감각: 현실/경험 중시
      'N': 'idealistic' // 직관: 이상/가능성 중시
    },
    decision: {
      'T': 'logical',   // 사고: 논리/원칙 중시
      'F': 'emotional'  // 감정: 관계/조화 중시
    }
  };

  const paljaCharacteristics = {
    energy: {
      'W': 'powerful',  // 외강: 고출력/강력한 힘
      'N': 'stable'     // 내유: 안정적/효율적인 힘
    },
    lifestyle: {
      'Y': 'dynamic',   // 유랑: 역동적/변화무쌍
      'J': 'steady'     // 정주: 안정적/예측 가능
    },
    perception: {
      'G': 'conceptual', // 관념: 정신적 가치 추구
      'S': 'practical'   // 실리: 구체적인 성과 추구
    },
    decision: {
      'H': 'harmony',   // 화합: 사람/소통 중시
      'I': 'systematic' // 이성: 시스템/규율 중시
    }
  };

  // 4차원 시너지 점수 계산 로직
  const synergyScoring = {
    energy: {
      'external-powerful': 25,
      'internal-stable': 25,
      'internal-powerful': 15,
      'external-stable': 15
    },
    lifestyle: {
      'structured-steady': 25,
      'flexible-dynamic': 25,
      'structured-dynamic': 15,
      'flexible-steady': 15
    },
    perception: {
      'realistic-practical': 25,
      'idealistic-conceptual': 25,
      'realistic-conceptual': 5,
      'idealistic-practical': 5
    },
    decision: {
      'logical-systematic': 25,
      'emotional-harmony': 25,
      'logical-harmony': 15,
      'emotional-systematic': 15
    }
  };

  const calculateCompatibility = (mbti, paljaCode) => {
    // 1. MBTI 특성 추출
    const mbtiTraits = {
      energy: mbtiCharacteristics.energy[mbti[0]], // E 또는 I
      perception: mbtiCharacteristics.perception[mbti[1]], // S 또는 N
      decision: mbtiCharacteristics.decision[mbti[2]], // T 또는 F
      lifestyle: mbtiCharacteristics.lifestyle[mbti[3]] // J 또는 P
    };

    // 2. 팔자유형 특성 추출
    const paljaTraits = {
      energy: paljaCharacteristics.energy[paljaCode[0]], // W 또는 N
      perception: paljaCharacteristics.perception[paljaCode[1]], // G 또는 S
      decision: paljaCharacteristics.decision[paljaCode[2]], // H 또는 I
      lifestyle: paljaCharacteristics.lifestyle[paljaCode[3]] // J 또는 Y
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

    return {
      totalScore: Math.max(20, Math.min(100, totalScore)),
      breakdown: scores
    };
  };

  const getCompatibilityAnalysis = (mbti, paljaCode, score) => {
    const paljaType = paljaTypes.find(p => p.code === paljaCode);
    const paljaName = paljaType ? paljaType.name : paljaCode;

    if (score >= 85) {
      return `🌟 ${mbti}와 ${paljaName}의 완벽한 조화! 성격과 운명이 서로를 강화시키는 최상의 시너지입니다.`;
    } else if (score >= 75) {
      return `✨ ${mbti}의 특성이 ${paljaName}와 잘 어우러집니다. 균형 잡힌 발전이 기대됩니다.`;
    } else if (score >= 65) {
      return `🌱 ${mbti}와 ${paljaName}가 만나 새로운 가능성을 열어갑니다. 조화로운 성장이 가능합니다.`;
    } else {
      return `🤔 ${mbti}와 ${paljaName}의 만남은 도전적이지만, 그만큼 큰 성장의 기회가 됩니다.`;
    }
  };

  const getDetailedAnalysis = (mbti, paljaCode) => {
    const paljaType = paljaTypes.find(p => p.code === paljaCode);
    const paljaName = paljaType ? paljaType.name : paljaCode;

    return {
      strengths: [
        `${mbti}의 분석적 사고와 ${paljaName}의 직관이 조화를 이룹니다.`,
        `타고난 리더십과 판단력이 돋보입니다.`,
        `변화에 대한 적응력이 뛰어납니다.`,
      ],
      challenges: [
        `때로는 완벽주의 성향이 스트레스가 될 수 있습니다.`,
        `감정 표현에 있어 균형이 필요합니다.`,
      ],
      advice: [
        `${mbti}의 장점을 ${paljaName}의 에너지로 더욱 발전시켜보세요.`,
        `주변 사람들과의 소통을 늘려 시너지를 극대화하세요.`,
        `새로운 도전을 두려워하지 말고 적극적으로 임하세요.`,
      ],
    };
  };

  const getSynergyClass = (score) => {
    if (score >= 90) return 'fantastic';
    if (score >= 70) return 'potential';
    if (score >= 50) return 'caution';
    return 'mismatch';
  };

  const getSynergyTypeDisplay = (score) => {
    if (score >= 90) return '✨ 환상의 시너지';
    if (score >= 70) return '🌱 잠재력 폭발';
    if (score >= 50) return '🚦 과부하 주의';
    return '🧩 엇박자 궁합';
  };

  return (
    <PageWrapper>
      <div className="analyze-page">
      <main>
        <section id="analyzer">
          <div className="container">
            <div className="analyzer-layout">
              <div className="card analyzer-card">
                <div className="card-header">
                  <h2 className="card-title sage-title">
                    <span className="sage-subtitle">
                      내 안의 두 자아, 조화를 이루다.
                    </span>
                  </h2>
                  <p className="sage-description">
                    그대의 성격(MBTI)과 운명(팔자유형)이 만나 어떤 이야기를
                    만드는지 살펴보자.
                  </p>
                </div>

                <form className="analyzer-form">
                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="mbti-select">성격 (MBTI)</label>
                      <select
                        id="mbti-select"
                        value={selectedMBTI}
                        onChange={(e) => setSelectedMBTI(e.target.value)}
                        required
                      >
                        <option value="">성격을 선택하세요</option>
                        {mbtiTypes.map((mbti) => (
                          <option key={mbti} value={mbti}>
                            {mbti}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="palja-select">운명 (팔자유형)</label>
                      <select
                        id="palja-select"
                        value={selectedPalja}
                        onChange={(e) => setSelectedPalja(e.target.value)}
                        required
                      >
                        <option value="">운명을 선택하세요</option>
                        {paljaTypes.map((palja) => (
                          <option key={palja.code} value={palja.code}>
                            {palja.code} - {palja.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-footer">
                    <div className="sage-advice">
                      <div>"두 자아의 만남,</div>
                      <div>그대의 새로운 길이 열릴지니."</div>
                    </div>
                    <button
                      type="button"
                      id="analyze-synergy"
                      className="cta-button ink-brush-effect"
                      onClick={handleAnalyze}
                      disabled={!selectedMBTI || !selectedPalja || loading}
                    >
                      {loading ? "🔮 분석 중..." : "이야기 듣기"}
                    </button>
                  </div>
                </form>
              </div>

              {result && (
                <div className="card result-card">
                  <div className="result-header">
                    <h3>
                      🎭 {result.mbti} × {paljaTypes.find(p => p.code === result.palja)?.name || result.palja}
                    </h3>
                    <p>토리가 들려주는 시너지 이야기</p>
                  </div>

                  <div className="result-content">
                    <div className="synergy-score-display">
                      <div className="circular-progress">
                        <svg viewBox="0 0 120 120">
                          <defs>
                            <linearGradient id="fantasticGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" style={{stopColor: "#4CAF50", stopOpacity: 1}} />
                              <stop offset="100%" style={{stopColor: "#66BB6A", stopOpacity: 1}} />
                            </linearGradient>
                            <linearGradient id="potentialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" style={{stopColor: "#FCA311", stopOpacity: 1}} />
                              <stop offset="100%" style={{stopColor: "#DAA520", stopOpacity: 1}} />
                            </linearGradient>
                            <linearGradient id="cautionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" style={{stopColor: "#FF9800", stopOpacity: 1}} />
                              <stop offset="100%" style={{stopColor: "#FFB74D", stopOpacity: 1}} />
                            </linearGradient>
                            <linearGradient id="mismatchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" style={{stopColor: "#F44336", stopOpacity: 1}} />
                              <stop offset="100%" style={{stopColor: "#EF5350", stopOpacity: 1}} />
                            </linearGradient>
                          </defs>
                          <circle className="bg-circle" cx="60" cy="60" r="52"></circle>
                          <circle
                            className={`progress-circle ${getSynergyClass(result.compatibilityScore)}`}
                            cx="60"
                            cy="60"
                            r="52"
                            strokeDasharray="0 327"
                            data-target={(result.compatibilityScore / 100) * 327}
                          ></circle>
                        </svg>
                        <div className="score-text">
                          <span className="score-number">{result.compatibilityScore}</span>
                          <span className="score-label">점</span>
                        </div>
                      </div>
                      <div className="score-type-display">
                        {getSynergyTypeDisplay(result.compatibilityScore)}
                      </div>
                    </div>

                    <p className="result-description">
                      타고난 성격: {result.mbti}와<br />
                      운명의 흐름: {paljaTypes.find(p => p.code === result.palja)?.name || result.palja}이 만났을 때
                    </p>

                    <div className="info-card" style={{marginTop: "25px"}}>
                      <h3>[토리가 풀이하는 당신의 시너지]</h3>
                      <p>{result.analysis}</p>
                    </div>

                    <div className="info-card">
                      <h3>[토리가 건네는 조언]</h3>
                      <ul>
                        {result.detailedAnalysis.advice.map(
                          (advice, index) => (
                            <li key={index}>{advice}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="info-card breakdown-card">
                      <h3>[차원별 조화도 분석]</h3>
                      <div className="synergy-graph">
                        <div className="graph-item">
                          <div className="graph-label">
                            <span className="graph-dimension">에너지</span>
                            <span className="graph-score">{result.breakdown.energy}점</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill score-${result.breakdown.energy}`}
                              data-width={(result.breakdown.energy / 25) * 100}
                            ></div>
                          </div>
                        </div>
                        <div className="graph-item">
                          <div className="graph-label">
                            <span className="graph-dimension">라이프스타일</span>
                            <span className="graph-score">{result.breakdown.lifestyle}점</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill score-${result.breakdown.lifestyle}`}
                              data-width={(result.breakdown.lifestyle / 25) * 100}
                            ></div>
                          </div>
                        </div>
                        <div className="graph-item">
                          <div className="graph-label">
                            <span className="graph-dimension">인식방식</span>
                            <span className="graph-score">{result.breakdown.perception}점</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill score-${result.breakdown.perception}`}
                              data-width={(result.breakdown.perception / 25) * 100}
                            ></div>
                          </div>
                        </div>
                        <div className="graph-item">
                          <div className="graph-label">
                            <span className="graph-dimension">판단방식</span>
                            <span className="graph-score">{result.breakdown.decision}점</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill score-${result.breakdown.decision}`}
                              data-width={(result.breakdown.decision / 25) * 100}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="dimension-explanations">
                        <div><strong>에너지:</strong> 내향성(I)과 외향성(E)의 조화 - 혼자만의 시간과 사람들과의 시간 균형</div>
                        <div><strong>라이프스타일:</strong> 계획성(J)과 유연성(P)의 조화 - 체계적 접근과 즉흥적 대응의 균형</div>
                        <div><strong>인식방식:</strong> 감각(S)과 직관(N)의 조화 - 현실적 정보와 미래 가능성의 균형</div>
                        <div><strong>판단방식:</strong> 사고(T)와 감정(F)의 조화 - 논리적 분석과 감정적 고려의 균형</div>
                      </div>
                    </div>

                    <div className="info-card">
                      <h3>💪 시너지 강점</h3>
                      <ul>
                        {result.detailedAnalysis.strengths.map(
                          (strength, index) => (
                            <li key={index}>{strength}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="info-card">
                      <h3>⚠️ 주의할 점</h3>
                      <ul>
                        {result.detailedAnalysis.challenges.map(
                          (challenge, index) => (
                            <li key={index}>{challenge}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="share-card">
                      <h3>📱 결과 공유하기</h3>
                      <p>토리의 시너지 분석 결과를 친구들과 공유해보세요!</p>
                      <button className="btn btn-secondary">공유하기</button>
                    </div>

                    <div className="save-to-mypage-card">
                      <button className="btn btn-primary">
                        📝 마이페이지에 저장하기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      </div>
    </PageWrapper>
  );
}
