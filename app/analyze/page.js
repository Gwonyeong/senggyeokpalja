'use client';

import { useState } from 'react';
import { calculateSaju, determinePaljaType } from '../../lib/saju-utils';

export default function AnalyzePage() {
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    calendar: 'solar',
    isLeapMonth: false
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 날짜 객체 생성
      const birthDate = new Date(
        parseInt(formData.year),
        parseInt(formData.month) - 1, // JavaScript Date는 0부터 시작
        parseInt(formData.day)
      );

      // 시간 인덱스 변환 (1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23 -> 0-11)
      let timeIndex = 0;
      if (formData.hour) {
        const hourValue = parseInt(formData.hour);
        const timeMap = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
        timeIndex = timeMap.findIndex(h => h === hourValue);
        if (timeIndex === -1) timeIndex = 0; // 기본값
      }

      // 사주팔자 계산
      const sajuData = calculateSaju(birthDate, timeIndex);

      // 성격 유형 결정
      const personalityType = determinePaljaType(sajuData);

      const resultData = {
        sajuData,
        personalityType,
        date: new Date().toISOString(),
        birthInfo: {
          year: formData.year,
          month: formData.month,
          day: formData.day,
          hour: formData.hour
        }
      };

      setResult(resultData);

      // 로컬 스토리지에 결과 저장
      const savedResults = JSON.parse(localStorage.getItem('sajuResults') || '[]');
      savedResults.unshift(resultData); // 최신 결과를 맨 앞에 추가
      localStorage.setItem('sajuResults', JSON.stringify(savedResults));
    } catch (error) {
      console.error('분석 중 오류 발생:', error);
      alert('분석 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyze-page">
      <div className="container">
        <div className="analyze-header">
          <h1>🔮 토리의 찻집</h1>
          <p>생년월일시를 알려주시면, 토리가 당신의 이야기를 들려드릴게요</p>
        </div>

        <form onSubmit={handleSubmit} className="saju-form" id="saju-form">
          <div className="form-section">
            <h2>📅 생년월일 정보</h2>

            <div className="date-inputs">
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                required
              >
                <option value="">년</option>
                {Array.from({length: 124}, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
                required
              >
                <option value="">월</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>

              <select
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: e.target.value})}
                required
              >
                <option value="">일</option>
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="calendar-selection">
              <label>
                <input
                  type="radio"
                  name="calendar"
                  value="solar"
                  checked={formData.calendar === 'solar'}
                  onChange={(e) => setFormData({...formData, calendar: e.target.value})}
                />
                양력
              </label>
              <label>
                <input
                  type="radio"
                  name="calendar"
                  value="lunar"
                  checked={formData.calendar === 'lunar'}
                  onChange={(e) => setFormData({...formData, calendar: e.target.value})}
                />
                음력
              </label>
            </div>

            {formData.calendar === 'lunar' && (
              <div className="leap-month">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isLeapMonth}
                    onChange={(e) => setFormData({...formData, isLeapMonth: e.target.checked})}
                  />
                  윤달
                </label>
              </div>
            )}

            <div className="time-selection">
              <label htmlFor="birthtime">🕐 태어난 시간</label>
              <select
                id="birthtime"
                value={formData.hour}
                onChange={(e) => setFormData({...formData, hour: e.target.value})}
              >
                <option value="">시간을 모르겠어요</option>
                <option value="1">01시 (자시 - 23:30~01:29)</option>
                <option value="3">03시 (축시 - 01:30~03:29)</option>
                <option value="5">05시 (인시 - 03:30~05:29)</option>
                <option value="7">07시 (묘시 - 05:30~07:29)</option>
                <option value="9">09시 (진시 - 07:30~09:29)</option>
                <option value="11">11시 (사시 - 09:30~11:29)</option>
                <option value="13">13시 (오시 - 11:30~13:29)</option>
                <option value="15">15시 (미시 - 13:30~15:29)</option>
                <option value="17">17시 (신시 - 15:30~17:29)</option>
                <option value="19">19시 (유시 - 17:30~19:29)</option>
                <option value="21">21시 (술시 - 19:30~21:29)</option>
                <option value="23">23시 (해시 - 21:30~23:29)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn primary-btn"
            disabled={loading}
          >
            {loading ? '🔮 해석 중...' : '🔮 토리에게 이야기 듣기'}
          </button>
        </form>

        {result && (
          <div className="result-section" id="result-section">
            <div className="result-content">
              <h2>🎭 당신의 성격 유형</h2>
              <div className="personality-result">
                <h3>{result.personalityType}</h3>
                <p>사주팔자 분석을 통해 도출된 성격 유형입니다.</p>

                <div style={{marginTop: '30px', textAlign: 'left'}}>
                  <h4>📊 사주팔자 정보</h4>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px'}}>
                    <div style={{textAlign: 'center', padding: '10px', background: 'rgba(252, 163, 17, 0.1)', borderRadius: '8px'}}>
                      <div style={{fontSize: '14px', color: 'var(--text-muted-color)'}}>년주</div>
                      <div style={{fontSize: '18px', fontWeight: 'bold'}}>{result.sajuData.palja.yeonju.gan.han}{result.sajuData.palja.yeonju.ji.han}</div>
                    </div>
                    <div style={{textAlign: 'center', padding: '10px', background: 'rgba(252, 163, 17, 0.1)', borderRadius: '8px'}}>
                      <div style={{fontSize: '14px', color: 'var(--text-muted-color)'}}>월주</div>
                      <div style={{fontSize: '18px', fontWeight: 'bold'}}>{result.sajuData.palja.wolju.gan.han}{result.sajuData.palja.wolju.ji.han}</div>
                    </div>
                    <div style={{textAlign: 'center', padding: '10px', background: 'rgba(252, 163, 17, 0.1)', borderRadius: '8px'}}>
                      <div style={{fontSize: '14px', color: 'var(--text-muted-color)'}}>일주</div>
                      <div style={{fontSize: '18px', fontWeight: 'bold'}}>{result.sajuData.palja.ilju.gan.han}{result.sajuData.palja.ilju.ji.han}</div>
                    </div>
                    <div style={{textAlign: 'center', padding: '10px', background: 'rgba(252, 163, 17, 0.1)', borderRadius: '8px'}}>
                      <div style={{fontSize: '14px', color: 'var(--text-muted-color)'}}>시주</div>
                      <div style={{fontSize: '18px', fontWeight: 'bold'}}>{result.sajuData.palja.siju.gan.han}{result.sajuData.palja.siju.ji.han}</div>
                    </div>
                  </div>

                  <h4 style={{marginTop: '25px'}}>🌟 오행 분포</h4>
                  <div style={{marginTop: '10px'}}>
                    {Object.entries(result.sajuData.ohaeng).map(([ohaeng, count]) => (
                      <span key={ohaeng} style={{
                        display: 'inline-block',
                        margin: '4px',
                        padding: '4px 8px',
                        background: 'var(--surface-color)',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        {ohaeng}: {count}
                      </span>
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