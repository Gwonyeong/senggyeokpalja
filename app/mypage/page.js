'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUser, signOut, deleteAccount } from '../../lib/supabase-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MyPage() {
  const [savedResults, setSavedResults] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('types');
  const [favoriteTypes, setFavoriteTypes] = useState([]);
  const [favoriteMatches, setFavoriteMatches] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Supabase 인증 상태 감시
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser({
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown',
          email: authUser.email,
          photoURL: authUser.user_metadata?.avatar_url || '',
          joinDate: authUser.created_at
        });

        // 사용자별 저장된 결과 불러오기
        const userResults = JSON.parse(
          localStorage.getItem(`sajuResults_${authUser.id}`) || '[]'
        );
        setSavedResults(userResults);

        // 관심 목록 불러오기
        const userFavoriteTypes = JSON.parse(
          localStorage.getItem(`favoriteTypes_${authUser.id}`) || '[]'
        );
        setFavoriteTypes(userFavoriteTypes);

        const userFavoriteMatches = JSON.parse(
          localStorage.getItem(`favoriteMatches_${authUser.id}`) || '[]'
        );
        setFavoriteMatches(userFavoriteMatches);

        // 데이터베이스에서 분석 결과 불러오기
        fetchAnalysisHistory();

        setLoading(false);
      } else {
        // 로그인하지 않은 경우 로그인 페이지로 리디렉트
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch('/api/analysis/history');
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
      }
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
    }
  };

  const deleteResult = (index) => {
    if (confirm('이 결과를 삭제하시겠습니까?')) {
      const updatedResults = savedResults.filter((_, i) => i !== index);
      setSavedResults(updatedResults);

      // Supabase 사용자 ID로 저장
      getCurrentUser().then(currentUser => {
        if (currentUser) {
          localStorage.setItem(`sajuResults_${currentUser.id}`, JSON.stringify(updatedResults));
        }
      });
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
        await signOut();
        router.push('/');
      } catch (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    // 2단계 확인
    const firstConfirm = confirm(
      '⚠️ 경고: 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.\n\n삭제될 데이터:\n- 프로필 정보\n- 분석 결과 히스토리\n- 관심 목록\n- 모든 저장된 데이터\n\n정말로 계정을 삭제하시겠습니까?'
    );

    if (!firstConfirm) return;

    const secondConfirm = confirm(
      '마지막 확인입니다.\n\n계정 삭제는 되돌릴 수 없습니다.\n정말로 진행하시겠습니까?'
    );

    if (!secondConfirm) return;

    try {
      // 로딩 표시
      const originalText = document.querySelector('.btn-danger').textContent;
      document.querySelector('.btn-danger').textContent = '삭제 중...';
      document.querySelector('.btn-danger').disabled = true;

      await deleteAccount();

      // 성공 메시지 표시
      alert('계정이 성공적으로 삭제되었습니다. 이용해 주셔서 감사합니다.');

      // 홈페이지로 리디렉트
      router.push('/');
    } catch (error) {
      console.error('계정 삭제 실패:', error);

      // 버튼 상태 복원
      document.querySelector('.btn-danger').textContent = originalText;
      document.querySelector('.btn-danger').disabled = false;

      if (error.message.includes('최근에 로그인')) {
        alert(error.message);
        // 재로그인을 위해 로그아웃
        try {
          await signOutUser();
          router.push('/');
        } catch (logoutError) {
          console.error('로그아웃 실패:', logoutError);
        }
      } else {
        alert(`계정 삭제 중 오류가 발생했습니다: ${error.message}`);
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
    <div className="analyze-page" style={{paddingTop: '120px'}}>
      <div className="container">
        {/* 사용자 정보 카드 */}
        <div className="card user-info-card" style={{marginBottom: '30px', background: 'var(--card-bg-color)', padding: '25px', borderRadius: '12px'}}>
          <div className="user-profile" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            {user.photoURL ? (
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <Image
                  src={user.photoURL}
                  alt="프로필 사진"
                  width={80}
                  height={80}
                  className="profile-photo"
                  style={{
                    borderRadius: '50%',
                    border: '3px solid var(--accent-color)',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ) : (
              <div
                className="profile-photo"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid var(--accent-color)',
                  background: 'linear-gradient(135deg, var(--starlight-orange) 0%, var(--accent-color) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </div>
            )}
            <div className="user-details">
              <h3 style={{color: 'var(--accent-color)', marginBottom: '8px'}}>{user.name}</h3>
              <p style={{color: 'var(--text-muted-color)', marginBottom: '5px'}}>{user.email}</p>
              <p style={{color: 'var(--text-muted-color)', fontSize: '14px'}}>가입일: {new Date(user.joinDate).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
        </div>

        {/* 메인 그리드 */}
        <div className="mypage-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '40px'}}>
          {/* 토리와의 대화록 카드 */}
          <div className="card analysis-card" style={{background: 'var(--card-bg-color)', padding: '25px', borderRadius: '12px'}}>
            <div className="card-header" style={{marginBottom: '20px'}}>
              <h3 className="card-title sage-title" style={{color: 'var(--starlight-orange)', marginBottom: '8px'}}>📜 토리와의 대화록</h3>
              <p className="card-description" style={{color: 'var(--text-muted-color)', fontSize: '14px'}}>그대와 나눈 운명의 이야기들</p>
            </div>
            <div id="analysis-history">
              {analysisResults.length === 0 ? (
                <p className="no-data" style={{textAlign: 'center', color: 'var(--text-muted-color)', padding: '20px'}}>
                  아직 분석 결과가 없습니다. <a href="/analyze" style={{color: 'var(--accent-color)'}}>지금 분석해보세요!</a>
                </p>
              ) : (
                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                  {analysisResults.slice(0, 3).map((result) => (
                    <div
                      key={result.id}
                      style={{
                        padding: '15px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        router.push(`/result/${result.id}`);
                      }}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                        <h4 style={{color: 'var(--accent-color)', fontSize: '14px', marginBottom: '0'}}>
                          {result.personalityType || 'Unknown'}
                        </h4>
                        {result.mbtiType && (
                          <span style={{
                            fontSize: '12px',
                            color: 'var(--text-muted-color)',
                            background: 'var(--border-color)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {result.mbtiType}
                          </span>
                        )}
                      </div>
                      {result.paljaType && (
                        <p style={{color: 'var(--text-color)', fontSize: '13px', marginBottom: '5px'}}>
                          {result.paljaType}
                        </p>
                      )}
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <p style={{color: 'var(--text-muted-color)', fontSize: '12px', marginBottom: '0'}}>
                          {new Date(result.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                        {result.birthDate && (
                          <p style={{color: 'var(--text-muted-color)', fontSize: '12px', marginBottom: '0'}}>
                            {new Date(result.birthDate).toLocaleDateString('ko-KR')} 생
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer" style={{marginTop: '20px', textAlign: 'center'}}>
              <button className="primary-btn" onClick={() => router.push('/saved-results')}>
                전체 결과 보기
              </button>
            </div>
          </div>

          {/* 관심 목록 카드 */}
          <div className="card interests-card" style={{background: 'var(--card-bg-color)', padding: '25px', borderRadius: '12px'}}>
            <div className="card-header" style={{marginBottom: '20px'}}>
              <h3 className="card-title sage-title" style={{color: 'var(--starlight-orange)', marginBottom: '8px'}}>⭐ 관심 목록</h3>
              <p className="card-description" style={{color: 'var(--text-muted-color)', fontSize: '14px'}}>마음에 드는 팔자 유형과 운명의 조합들</p>
            </div>
            <div className="interests-tabs" style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
              <button
                className={`tab-btn ${activeTab === 'types' ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  background: activeTab === 'types' ? 'var(--accent-color)' : 'transparent',
                  color: activeTab === 'types' ? 'var(--ink-black)' : 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('types')}
              >
                팔자 유형
              </button>
              <button
                className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  background: activeTab === 'matches' ? 'var(--accent-color)' : 'transparent',
                  color: activeTab === 'matches' ? 'var(--ink-black)' : 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('matches')}
              >
                인연 궁합
              </button>
            </div>
            <div id="interests-content">
              {activeTab === 'types' ? (
                <div id="types-content" className="tab-content active">
                  <div id="favorite-types">
                    {favoriteTypes.length === 0 ? (
                      <p className="no-data" style={{textAlign: 'center', color: 'var(--text-muted-color)', padding: '20px'}}>
                        관심 있는 팔자 유형을 저장해보세요.
                      </p>
                    ) : (
                      <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                        {favoriteTypes.map((type, index) => (
                          <div key={index} style={{padding: '10px', borderBottom: '1px solid var(--border-color)'}}>
                            <p style={{color: 'var(--accent-color)', fontSize: '14px'}}>{type}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div id="matches-content" className="tab-content">
                  <div id="compatibility-matches">
                    {favoriteMatches.length === 0 ? (
                      <p className="no-data" style={{textAlign: 'center', color: 'var(--text-muted-color)', padding: '20px'}}>
                        인연 궁합을 저장해보세요.
                      </p>
                    ) : (
                      <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                        {favoriteMatches.map((match, index) => (
                          <div key={index} style={{padding: '10px', borderBottom: '1px solid var(--border-color)'}}>
                            <p style={{color: 'var(--accent-color)', fontSize: '14px'}}>{match}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 찻집 관리 카드 */}
          <div className="card account-card" style={{background: 'var(--card-bg-color)', padding: '25px', borderRadius: '12px'}}>
            <div className="card-header" style={{marginBottom: '20px'}}>
              <h3 className="card-title sage-title" style={{color: 'var(--starlight-orange)', marginBottom: '8px'}}>⚙️ 찻집 관리</h3>
              <p className="card-description" style={{color: 'var(--text-muted-color)', fontSize: '14px'}}>계정 설정과 데이터 관리</p>
            </div>
            <div className="account-actions" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <button
                className="secondary-btn"
                style={{width: '100%'}}
                onClick={exportResults}
              >
                📥 데이터 내보내기
              </button>
              <button
                className="primary-btn"
                style={{width: '100%'}}
                onClick={() => router.push('/analyze')}
              >
                🔮 새 분석하기
              </button>
              <button
                className="secondary-btn"
                style={{width: '100%'}}
                onClick={handleLogout}
              >
                🚪 로그아웃
              </button>
              <button
                className="btn btn-danger"
                style={{
                  width: '100%',
                  background: '#dc3545',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={handleDeleteAccount}
                onMouseOver={(e) => e.target.style.background = '#c82333'}
                onMouseOut={(e) => e.target.style.background = '#dc3545'}
              >
                🗑️ 계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}