'use client';

import { useState, useEffect } from 'react';

export default function MyPage() {
  const [savedResults, setSavedResults] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 로컬 스토리지에서 저장된 결과 불러오기
    const results = JSON.parse(localStorage.getItem('sajuResults') || '[]');
    setSavedResults(results);

    // 사용자 정보 (임시)
    setUser({
      name: '토리',
      email: 'tori@example.com',
      joinDate: '2024-01-01'
    });
  }, []);

  const deleteResult = (index) => {
    if (confirm('이 결과를 삭제하시겠습니까?')) {
      const updatedResults = savedResults.filter((_, i) => i !== index);
      setSavedResults(updatedResults);
      localStorage.setItem('sajuResults', JSON.stringify(updatedResults));
    }
  };

  const exportResults = () => {
    if (savedResults.length === 0) {
      alert('내보낼 결과가 없습니다.');
      return;
    }

    const dataStr = JSON.stringify(savedResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `사주_분석_결과_${new Date().getTime()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="analyze-page">
      <div className="container">
        <div className="analyze-header">
          <h1>👤 마이페이지</h1>
          <p>당신의 분석 결과와 정보를 관리하세요</p>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px'}}>
          {/* 사용자 정보 카드 */}
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>프로필 정보</h3>
            {user && (
              <div style={{textAlign: 'left', marginTop: '15px'}}>
                <p><strong>이름:</strong> {user.name}</p>
                <p><strong>이메일:</strong> {user.email}</p>
                <p><strong>가입일:</strong> {user.joinDate}</p>
              </div>
            )}
          </div>

          {/* 통계 카드 */}
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>분석 통계</h3>
            <div style={{textAlign: 'left', marginTop: '15px'}}>
              <p><strong>총 분석 횟수:</strong> {savedResults.length}회</p>
              <p><strong>가장 최근 분석:</strong> {savedResults.length > 0 ? new Date(savedResults[0].date).toLocaleDateString() : '-'}</p>
            </div>
          </div>

          {/* 빠른 액션 카드 */}
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>빠른 액션</h3>
            <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <button
                className="secondary-btn"
                style={{width: '100%'}}
                onClick={exportResults}
              >
                📥 결과 내보내기
              </button>
              <button
                className="primary-btn"
                style={{width: '100%'}}
                onClick={() => window.location.href = '/analyze'}
              >
                🔮 새 분석하기
              </button>
            </div>
          </div>
        </div>

        {/* 저장된 결과 목록 */}
        <div className="result-section">
          <div className="result-content">
            <h2>📋 저장된 분석 결과</h2>

            {savedResults.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted-color)'}}>
                <p>아직 저장된 분석 결과가 없습니다.</p>
                <button
                  className="primary-btn"
                  onClick={() => window.location.href = '/analyze'}
                  style={{marginTop: '20px'}}
                >
                  첫 분석하러 가기
                </button>
              </div>
            ) : (
              <div style={{display: 'grid', gap: '20px', marginTop: '25px'}}>
                {savedResults.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--card-bg-color)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '20px',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{fontSize: '36px'}}>🎭</div>

                    <div>
                      <h4 style={{color: 'var(--accent-color)', marginBottom: '8px'}}>
                        {result.personalityType || 'Unknown'}
                      </h4>
                      <p style={{color: 'var(--text-muted-color)', fontSize: '14px', marginBottom: '5px'}}>
                        분석일: {new Date(result.date).toLocaleDateString()}
                      </p>
                      {result.birthInfo && (
                        <p style={{color: 'var(--text-muted-color)', fontSize: '14px'}}>
                          생년월일: {result.birthInfo.year}.{result.birthInfo.month}.{result.birthInfo.day}
                        </p>
                      )}
                    </div>

                    <div style={{display: 'flex', gap: '10px'}}>
                      <button
                        className="secondary-btn"
                        style={{padding: '8px 12px', fontSize: '12px'}}
                        onClick={() => {
                          alert('상세 보기 기능은 추후 구현 예정입니다.');
                        }}
                      >
                        👁️ 보기
                      </button>
                      <button
                        className="secondary-btn"
                        style={{padding: '8px 12px', fontSize: '12px', background: 'var(--accent-color)', color: 'var(--ink-black)'}}
                        onClick={() => deleteResult(index)}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}