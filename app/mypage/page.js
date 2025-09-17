'use client';

import { useState, useEffect } from 'react';
import { onAuthChange, getCurrentUser, signOutUser } from '../../lib/firebase-config';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const [savedResults, setSavedResults] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Firebase 인증 상태 감시
    const unsubscribe = onAuthChange((authUser) => {
      if (authUser) {
        setUser({
          name: authUser.displayName || 'Unknown',
          email: authUser.email,
          photoURL: authUser.photoURL || '',
          joinDate: authUser.metadata.creationTime
        });

        // 사용자별 저장된 결과 불러오기
        const userResults = JSON.parse(
          localStorage.getItem(`sajuResults_${authUser.uid}`) || '[]'
        );
        setSavedResults(userResults);

        setLoading(false);
      } else {
        // 로그인하지 않은 경우 로그인 페이지로 리디렉트
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const deleteResult = (index) => {
    if (confirm('이 결과를 삭제하시겠습니까?')) {
      const updatedResults = savedResults.filter((_, i) => i !== index);
      setSavedResults(updatedResults);

      // Firebase 사용자 ID로 저장
      const currentUser = getCurrentUser();
      if (currentUser) {
        localStorage.setItem(`sajuResults_${currentUser.uid}`, JSON.stringify(updatedResults));
      }
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

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        await signOutUser();
        router.push('/');
      } catch (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="analyze-page">
        <div className="container">
          <div className="analyze-header">
            <h1>👤 마이페이지</h1>
            <p style={{ textAlign: 'center', marginTop: '50px' }}>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="analyze-page">
        <div className="container">
          <div className="mypage-welcome">
            <div className="card welcome-card">
              <div className="card-header">
                <h2 className="card-title sage-title">
                  <span className="sage-subtitle">토리의 찻집에 오신 것을 환영합니다</span>
                </h2>
                <p className="sage-description">
                  로그인하시면 당신만의 팔자 분석 결과를 저장하고 관리할 수 있습니다.
                </p>
              </div>

              <div className="welcome-content">
                <div className="welcome-features">
                  <div className="feature-item">
                    <div className="feature-icon">📊</div>
                    <h3>분석 결과 저장</h3>
                    <p>당신의 팔자 분석과 시너지 결과를 안전하게 저장하세요</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">📈</div>
                    <h3>히스토리 관리</h3>
                    <p>시간에 따른 분석 결과 변화를 추적하고 비교해보세요</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🔐</div>
                    <h3>개인 맞춤 서비스</h3>
                    <p>개인화된 추천과 맞춤형 조언을 받아보세요</p>
                  </div>
                </div>

                <div className="welcome-actions">
                  <button
                    className="cta-button ink-brush-effect"
                    onClick={() => router.push('/')}
                  >
                    로그인하러 가기
                  </button>
                  <p className="welcome-note">
                    Google 또는 Kakao 계정으로 간편하게 로그인하세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                {user.photoURL && (
                  <div style={{textAlign: 'center', marginBottom: '15px'}}>
                    <img
                      src={user.photoURL}
                      alt="프로필"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '2px solid var(--accent-color)'
                      }}
                    />
                  </div>
                )}
                <p><strong>이름:</strong> {user.name}</p>
                <p><strong>이메일:</strong> {user.email}</p>
                <p><strong>가입일:</strong> {new Date(user.joinDate).toLocaleDateString('ko-KR')}</p>
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
              <button
                className="secondary-btn"
                style={{width: '100%', background: 'var(--error-color)', color: 'white'}}
                onClick={handleLogout}
              >
                🚪 로그아웃
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
                          localStorage.setItem('selectedResult', JSON.stringify(result));
                          router.push('/result');
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