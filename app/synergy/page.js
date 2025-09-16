"use client";

import { useState, useEffect } from "react";

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

  // 팔자 유형 목록 (예시)
  const paljaTypes = [
    "용띠형",
    "봉황형",
    "호랑이형",
    "거북이형",
    "매형",
    "늑대형",
    "사자형",
    "여우형",
    "뱀형",
    "말형",
    "원숭이형",
    "닭형",
    "개형",
    "돼지형",
    "쥐형",
    "소형",
  ];

  useEffect(() => {
    // MBTI와 팔자유형 모두 선택되었을 때 버튼 활성화
    const button = document.getElementById("analyze-synergy");
    if (button) {
      button.disabled = !selectedMBTI || !selectedPalja;
    }
  }, [selectedMBTI, selectedPalja]);

  const handleAnalyze = async () => {
    if (!selectedMBTI || !selectedPalja) return;

    setLoading(true);

    try {
      // 시뮬레이션된 분석 결과 생성
      const compatibilityScore = calculateCompatibility(
        selectedMBTI,
        selectedPalja
      );
      const analysis = getCompatibilityAnalysis(
        selectedMBTI,
        selectedPalja,
        compatibilityScore
      );

      setResult({
        mbti: selectedMBTI,
        palja: selectedPalja,
        compatibilityScore,
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

  const calculateCompatibility = (mbti, palja) => {
    // MBTI와 팔자유형의 조화 점수를 계산하는 로직
    let score = 70; // 기본 점수

    // MBTI 성향별 보정
    if (mbti.includes("E") && ["사자형", "호랑이형", "매형"].includes(palja)) {
      score += 10; // 외향적 성격과 강한 팔자의 조화
    }
    if (mbti.includes("I") && ["거북이형", "뱀형", "여우형"].includes(palja)) {
      score += 10; // 내향적 성격과 신중한 팔자의 조화
    }
    if (
      mbti.includes("N") &&
      ["용띠형", "봉황형", "원숭이형"].includes(palja)
    ) {
      score += 8; // 직관형과 변화를 추구하는 팔자
    }
    if (mbti.includes("S") && ["소형", "개형", "말형"].includes(palja)) {
      score += 8; // 감각형과 안정적인 팔자
    }

    // 랜덤 요소 추가로 자연스러운 점수 생성
    score += Math.floor(Math.random() * 10) - 5;

    return Math.max(60, Math.min(95, score));
  };

  const getCompatibilityAnalysis = (mbti, palja, score) => {
    if (score >= 85) {
      return `🌟 ${mbti}와 ${palja}의 완벽한 조화! 성격과 운명이 서로를 강화시키는 최상의 시너지입니다.`;
    } else if (score >= 75) {
      return `✨ ${mbti}의 특성이 ${palja}와 잘 어우러집니다. 균형 잡힌 발전이 기대됩니다.`;
    } else if (score >= 65) {
      return `🌱 ${mbti}와 ${palja}가 만나 새로운 가능성을 열어갑니다. 조화로운 성장이 가능합니다.`;
    } else {
      return `🤔 ${mbti}와 ${palja}의 만남은 도전적이지만, 그만큼 큰 성장의 기회가 됩니다.`;
    }
  };

  const getDetailedAnalysis = (mbti, palja) => {
    return {
      strengths: [
        `${mbti}의 분석적 사고와 ${palja}의 직관이 조화를 이룹니다.`,
        `타고난 리더십과 판단력이 돋보입니다.`,
        `변화에 대한 적응력이 뛰어납니다.`,
      ],
      challenges: [
        `때로는 완벽주의 성향이 스트레스가 될 수 있습니다.`,
        `감정 표현에 있어 균형이 필요합니다.`,
      ],
      advice: [
        `${mbti}의 장점을 ${palja}의 에너지로 더욱 발전시켜보세요.`,
        `주변 사람들과의 소통을 늘려 시너지를 극대화하세요.`,
        `새로운 도전을 두려워하지 말고 적극적으로 임하세요.`,
      ],
    };
  };

  return (
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
                          <option key={palja} value={palja}>
                            {palja}
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
                      🎭 {result.mbti} × {result.palja}
                    </h3>
                    <p>토리가 들려주는 시너지 이야기</p>
                  </div>

                  <div className="result-content">
                    <div
                      className="synergy-score"
                      style={{
                        textAlign: "center",
                        marginBottom: "30px",
                        padding: "25px",
                        background: "rgba(252, 163, 17, 0.1)",
                        borderRadius: "15px",
                        border: "1px solid rgba(252, 163, 17, 0.2)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "3rem",
                          fontWeight: "bold",
                          color: "var(--starlight-orange)",
                          marginBottom: "10px",
                        }}
                      >
                        {result.compatibilityScore}점
                      </div>
                      <p
                        style={{
                          fontSize: "1.1rem",
                          lineHeight: "1.6",
                          color: "var(--text-color)",
                          margin: 0,
                        }}
                      >
                        {result.analysis}
                      </p>
                    </div>

                    <div className="synergy-details">
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

                      <div className="info-card">
                        <h3>🌟 토리의 조언</h3>
                        <ul>
                          {result.detailedAnalysis.advice.map(
                            (advice, index) => (
                              <li key={index}>{advice}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="share-card">
                      <h3>📱 결과 공유하기</h3>
                      <p>토리의 시너지 분석 결과를 친구들과 공유해보세요!</p>
                      <button className="btn btn-secondary">공유하기</button>
                    </div>

                    <div
                      className="save-to-mypage-card"
                      style={{ marginTop: "20px", textAlign: "center" }}
                    >
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
  );
}
