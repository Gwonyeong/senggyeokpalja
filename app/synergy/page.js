'use client';

import { useState } from 'react';
import { calculateSaju, determinePaljaType } from '../../lib/saju-utils';

export default function SynergyPage() {
  const [person1Data, setPerson1Data] = useState({
    name: '',
    year: '',
    month: '',
    day: '',
    hour: '',
    calendar: 'solar'
  });

  const [person2Data, setPerson2Data] = useState({
    name: '',
    year: '',
    month: '',
    day: '',
    hour: '',
    calendar: 'solar'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 첫 번째 사람 분석
      const birthDate1 = new Date(
        parseInt(person1Data.year),
        parseInt(person1Data.month) - 1,
        parseInt(person1Data.day)
      );

      let timeIndex1 = 0;
      if (person1Data.hour) {
        const hourValue = parseInt(person1Data.hour);
        const timeMap = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
        timeIndex1 = timeMap.findIndex(h => h === hourValue);
        if (timeIndex1 === -1) timeIndex1 = 0;
      }

      const sajuData1 = calculateSaju(birthDate1, timeIndex1);
      const personalityType1 = determinePaljaType(sajuData1);

      // 두 번째 사람 분석
      const birthDate2 = new Date(
        parseInt(person2Data.year),
        parseInt(person2Data.month) - 1,
        parseInt(person2Data.day)
      );

      let timeIndex2 = 0;
      if (person2Data.hour) {
        const hourValue = parseInt(person2Data.hour);
        const timeMap = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
        timeIndex2 = timeMap.findIndex(h => h === hourValue);
        if (timeIndex2 === -1) timeIndex2 = 0;
      }

      const sajuData2 = calculateSaju(birthDate2, timeIndex2);
      const personalityType2 = determinePaljaType(sajuData2);

      // 궁합 점수 계산 (간단한 로직)
      const compatibilityScore = calculateCompatibility(personalityType1, personalityType2);

      setResult({
        person1: { ...person1Data, sajuData: sajuData1, personalityType: personalityType1 },
        person2: { ...person2Data, sajuData: sajuData2, personalityType: personalityType2 },
        compatibilityScore,
        analysis: getCompatibilityAnalysis(personalityType1, personalityType2, compatibilityScore)
      });
    } catch (error) {
      console.error('궁합 분석 중 오류 발생:', error);
      alert('궁합 분석 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompatibility = (type1, type2) => {
    // 기본 점수 50점에서 시작
    let score = 50;

    // 각 축별 호환성 검사
    const axes = [
      [type1[0], type2[0]], // Energy (W/N)
      [type1[1], type2[1]], // Perception (G/S)
      [type1[2], type2[2]], // Judgement (I/H)
      [type1[3], type2[3]]  // Lifestyle (J/Y)
    ];

    // 같은 특성이면 +10, 다르면 +5 (다양성의 가치)
    axes.forEach(([a, b]) => {
      if (a === b) {
        score += 10; // 같은 성향은 이해하기 쉬움
      } else {
        score += 5; // 다른 성향은 보완 관계
      }
    });

    // 특별한 조합 보너스
    if ((type1.includes('W') && type2.includes('N')) || (type1.includes('N') && type2.includes('W'))) {
      score += 10; // 에너지 보완
    }

    if ((type1.includes('G') && type2.includes('S')) || (type1.includes('S') && type2.includes('G'))) {
      score += 10; // 인식 보완
    }

    // 80점을 넘지 않도록 제한
    return Math.min(score, 95);
  };

  const getCompatibilityAnalysis = (type1, type2, score) => {
    if (score >= 80) {
      return "🌟 환상의 조합! 서로를 깊이 이해하고 지지하는 최고의 파트너십입니다.";
    } else if (score >= 70) {
      return "💫 좋은 궁합! 서로 다른 점을 존중하며 성장할 수 있는 관계입니다.";
    } else if (score >= 60) {
      return "🌱 보통 궁합! 노력한다면 좋은 관계를 만들어 갈 수 있습니다.";
    } else {
      return "🤔 도전적인 궁합! 서로를 이해하기 위해 더 많은 소통이 필요합니다.";
    }
  };

  return (
    <div className="analyze-page">
      <div className="container">
        <div className="analyze-header">
          <h1>💫 시너지 분석</h1>
          <p>두 사람의 궁합을 확인해보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="saju-form">
          <div className="form-section">
            <h2>👤 첫 번째 사람</h2>

            <div style={{marginBottom: '20px'}}>
              <input
                type="text"
                placeholder="이름"
                value={person1Data.name}
                onChange={(e) => setPerson1Data({...person1Data, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  fontSize: '16px'
                }}
                required
              />
            </div>

            <div className="date-inputs">
              <select
                value={person1Data.year}
                onChange={(e) => setPerson1Data({...person1Data, year: e.target.value})}
                required
              >
                <option value="">년</option>
                {Array.from({length: 124}, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={person1Data.month}
                onChange={(e) => setPerson1Data({...person1Data, month: e.target.value})}
                required
              >
                <option value="">월</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>

              <select
                value={person1Data.day}
                onChange={(e) => setPerson1Data({...person1Data, day: e.target.value})}
                required
              >
                <option value="">일</option>
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="time-selection">
              <label>🕐 태어난 시간</label>
              <select
                value={person1Data.hour}
                onChange={(e) => setPerson1Data({...person1Data, hour: e.target.value})}
              >
                <option value="">시간을 모르겠어요</option>
                <option value="1">01시 (자시)</option>
                <option value="3">03시 (축시)</option>
                <option value="5">05시 (인시)</option>
                <option value="7">07시 (묘시)</option>
                <option value="9">09시 (진시)</option>
                <option value="11">11시 (사시)</option>
                <option value="13">13시 (오시)</option>
                <option value="15">15시 (미시)</option>
                <option value="17">17시 (신시)</option>
                <option value="19">19시 (유시)</option>
                <option value="21">21시 (술시)</option>
                <option value="23">23시 (해시)</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>👥 두 번째 사람</h2>

            <div style={{marginBottom: '20px'}}>
              <input
                type="text"
                placeholder="이름"
                value={person2Data.name}
                onChange={(e) => setPerson2Data({...person2Data, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  fontSize: '16px'
                }}
                required
              />
            </div>

            <div className="date-inputs">
              <select
                value={person2Data.year}
                onChange={(e) => setPerson2Data({...person2Data, year: e.target.value})}
                required
              >
                <option value="">년</option>
                {Array.from({length: 124}, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={person2Data.month}
                onChange={(e) => setPerson2Data({...person2Data, month: e.target.value})}
                required
              >
                <option value="">월</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>

              <select
                value={person2Data.day}
                onChange={(e) => setPerson2Data({...person2Data, day: e.target.value})}
                required
              >
                <option value="">일</option>
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="time-selection">
              <label>🕐 태어난 시간</label>
              <select
                value={person2Data.hour}
                onChange={(e) => setPerson2Data({...person2Data, hour: e.target.value})}
              >
                <option value="">시간을 모르겠어요</option>
                <option value="1">01시 (자시)</option>
                <option value="3">03시 (축시)</option>
                <option value="5">05시 (인시)</option>
                <option value="7">07시 (묘시)</option>
                <option value="9">09시 (진시)</option>
                <option value="11">11시 (사시)</option>
                <option value="13">13시 (오시)</option>
                <option value="15">15시 (미시)</option>
                <option value="17">17시 (신시)</option>
                <option value="19">19시 (유시)</option>
                <option value="21">21시 (술시)</option>
                <option value="23">23시 (해시)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn primary-btn"
            disabled={loading}
          >
            {loading ? '💫 분석 중...' : '💫 궁합 확인하기'}
          </button>
        </form>

        {result && (
          <div className="result-section">
            <div className="result-content">
              <h2>💫 궁합 분석 결과</h2>

              <div style={{textAlign: 'center', marginBottom: '30px'}}>
                <div style={{fontSize: '48px', fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '10px'}}>
                  {result.compatibilityScore}점
                </div>
                <p style={{fontSize: '18px', lineHeight: '1.6'}}>
                  {result.analysis}
                </p>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px'}}>
                <div style={{background: 'var(--card-bg-color)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)'}}>
                  <h3 style={{color: 'var(--accent-color)', marginBottom: '15px'}}>👤 {result.person1.name}</h3>
                  <div style={{marginBottom: '15px'}}>
                    <strong>성격 유형:</strong> {result.person1.personalityType}
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px'}}>
                    {Object.entries(result.person1.sajuData.palja).map(([ju, data]) => (
                      <div key={ju} style={{
                        textAlign: 'center',
                        padding: '8px',
                        background: 'rgba(252, 163, 17, 0.1)',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}>
                        {data.gan.han}{data.ji.han}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{background: 'var(--card-bg-color)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)'}}>
                  <h3 style={{color: 'var(--accent-color)', marginBottom: '15px'}}>👥 {result.person2.name}</h3>
                  <div style={{marginBottom: '15px'}}>
                    <strong>성격 유형:</strong> {result.person2.personalityType}
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px'}}>
                    {Object.entries(result.person2.sajuData.palja).map(([ju, data]) => (
                      <div key={ju} style={{
                        textAlign: 'center',
                        padding: '8px',
                        background: 'rgba(252, 163, 17, 0.1)',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}>
                        {data.gan.han}{data.ji.han}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}