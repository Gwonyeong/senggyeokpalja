'use client';

import { useState } from 'react';
import { calculateSaju, determinePaljaType } from '../../lib/saju-utils';

export default function AnalyzePage() {
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    month: '',
    day: '',
    hour: 'unknown',
    gender: 'male',
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
        parseInt(formData.month) - 1,
        parseInt(formData.day)
      );

      // 시간 인덱스 변환
      let timeIndex = 0;
      if (formData.hour !== 'unknown') {
        timeIndex = parseInt(formData.hour);
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
          name: formData.name,
          year: formData.year,
          month: formData.month,
          day: formData.day,
          hour: formData.hour,
          gender: formData.gender,
          calendar: formData.calendar
        }
      };

      setResult(resultData);

      // 로컬 스토리지에 결과 저장
      const savedResults = JSON.parse(localStorage.getItem('sajuResults') || '[]');
      savedResults.unshift(resultData);
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
      <main>
        <section id="analyzer">
          <div className="container">
            <div className="analyzer-layout">
              <div className="card analyzer-card">
                <div className="card-header">
                  <h2 className="card-title sage-title">
                    <span className="sage-subtitle">그대의 이야기를 듣고자 하네.</span>
                  </h2>
                  <p className="sage-description">차 한 잔의 여유로 그대의 운명을 살펴보자.</p>
                </div>

                <form onSubmit={handleSubmit} className="analyzer-form" id="saju-form">
                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="name">이름 (선택)</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="토리가 부를 이름을 알려주게"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="birth-year">생년월일</label>
                      <div className="date-picker-container">
                        <select
                          id="birth-year"
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          required
                          autoComplete="bday-year"
                        >
                          <option value="">년</option>
                          {Array.from({length: 124}, (_, i) => 2024 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <select
                          id="birth-month"
                          value={formData.month}
                          onChange={(e) => setFormData({...formData, month: e.target.value})}
                          required
                          autoComplete="bday-month"
                        >
                          <option value="">월</option>
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                        <select
                          id="birth-day"
                          value={formData.day}
                          onChange={(e) => setFormData({...formData, day: e.target.value})}
                          required
                          autoComplete="bday-day"
                        >
                          <option value="">일</option>
                          {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="input-group">
                      <label htmlFor="birthtime">태어난 시간</label>
                      <select
                        id="birthtime"
                        name="birthtime"
                        value={formData.hour}
                        onChange={(e) => setFormData({...formData, hour: e.target.value})}
                      >
                        <option value="unknown">⏰ 시간을 몰라요</option>
                        <option value="0">🐭 23:30 ~ 01:29 (자시)</option>
                        <option value="1">🐮 01:30 ~ 03:29 (축시)</option>
                        <option value="2">🐯 03:30 ~ 05:29 (인시)</option>
                        <option value="3">🐰 05:30 ~ 07:29 (묘시)</option>
                        <option value="4">🐲 07:30 ~ 09:29 (진시)</option>
                        <option value="5">🐍 09:30 ~ 11:29 (사시)</option>
                        <option value="6">🐴 11:30 ~ 13:29 (오시)</option>
                        <option value="7">🐑 13:30 ~ 15:29 (미시)</option>
                        <option value="8">🐵 15:30 ~ 17:29 (신시)</option>
                        <option value="9">🐔 17:30 ~ 19:29 (유시)</option>
                        <option value="10">🐶 19:30 ~ 21:29 (술시)</option>
                        <option value="11">🐷 21:30 ~ 23:29 (해시)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="form-row">
                      <div className="input-group">
                        <label>성별</label>
                        <div className="radio-group">
                          <input
                            type="radio"
                            id="male"
                            name="gender"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            autoComplete="sex"
                          />
                          <label htmlFor="male">남자</label>
                          <input
                            type="radio"
                            id="female"
                            name="gender"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            autoComplete="sex"
                          />
                          <label htmlFor="female">여자</label>
                        </div>
                      </div>
                      <div className="input-group">
                        <label>양력/음력</label>
                        <div className="radio-group">
                          <input
                            type="radio"
                            id="solar"
                            name="calendar"
                            value="solar"
                            checked={formData.calendar === 'solar'}
                            onChange={(e) => setFormData({...formData, calendar: e.target.value})}
                          />
                          <label htmlFor="solar">양력</label>
                          <input
                            type="radio"
                            id="lunar"
                            name="calendar"
                            value="lunar"
                            checked={formData.calendar === 'lunar'}
                            onChange={(e) => setFormData({...formData, calendar: e.target.value})}
                          />
                          <label htmlFor="lunar">음력</label>
                          {formData.calendar === 'lunar' && (
                            <>
                              <input
                                type="checkbox"
                                id="isLeapMonth"
                                checked={formData.isLeapMonth}
                                onChange={(e) => setFormData({...formData, isLeapMonth: e.target.checked})}
                                style={{ marginLeft: '10px' }}
                              />
                              <label htmlFor="isLeapMonth">윤달</label>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-footer">
                    <div className="sage-advice">
                      <div>"그대의 이야기,</div>
                      <div>토리가 차 한 잔과 함께 들어보겠네."</div>
                    </div>
                    <button
                      type="submit"
                      className="cta-button ink-brush-effect"
                      disabled={loading}
                    >
                      {loading ? '🔮 해석 중...' : '나의 길, 묻기'}
                    </button>
                  </div>
                </form>
              </div>

              {result && (
                <div className="card result-card" id="result-section">
                  <div className="result-header">
                    <h3>🎭 {result.personalityType}</h3>
                    <p>토리가 들려주는 그대의 이야기</p>
                  </div>

                  <div className="result-content">
                    <div className="info-card">
                      <h3>📊 사주팔자 정보</h3>
                      <div className="palja-grid">
                        <div className="palja-item">
                          <div className="palja-label">년주</div>
                          <div className="palja-value">{result.sajuData.palja.yeonju.gan.han}{result.sajuData.palja.yeonju.ji.han}</div>
                        </div>
                        <div className="palja-item">
                          <div className="palja-label">월주</div>
                          <div className="palja-value">{result.sajuData.palja.wolju.gan.han}{result.sajuData.palja.wolju.ji.han}</div>
                        </div>
                        <div className="palja-item">
                          <div className="palja-label">일주</div>
                          <div className="palja-value">{result.sajuData.palja.ilju.gan.han}{result.sajuData.palja.ilju.ji.han}</div>
                        </div>
                        <div className="palja-item">
                          <div className="palja-label">시주</div>
                          <div className="palja-value">{result.sajuData.palja.siju.gan.han}{result.sajuData.palja.siju.ji.han}</div>
                        </div>
                      </div>
                    </div>

                    <div className="info-card">
                      <h3>🌟 오행 분포</h3>
                      <div className="ohaeng-grid">
                        {Object.entries(result.sajuData.ohaeng).map(([ohaeng, count]) => (
                          <div key={ohaeng} className="ohaeng-item">
                            <span className="ohaeng-name">{ohaeng}</span>
                            <span className="ohaeng-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="share-card">
                      <h3>📱 결과 공유하기</h3>
                      <p>토리의 분석 결과를 친구들과 공유해보세요!</p>
                      <button className="btn btn-secondary">공유하기</button>
                    </div>

                    <div className="save-to-mypage-card" style={{ marginTop: '20px', textAlign: 'center' }}>
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