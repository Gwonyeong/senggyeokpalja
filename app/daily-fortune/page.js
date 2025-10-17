'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 음력 변환 기능은 추후 구현
import PageWrapper from '@/components/PageWrapper';

export default function DailyFortunePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fortune, setFortune] = useState(null);

  useEffect(() => {
    // 사용자 인증 상태 확인
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const profile = await response.json();
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    loadDailyFortune();
  }, [user]);

  const loadDailyFortune = async () => {
    setLoading(true);
    try {
      // 오늘 날짜
      const today = new Date();
      const todayInfo = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
        hour: today.getHours()
      };

      let birthInfo = null;

      // 로그인한 사용자의 생일 정보 가져오기
      if (user) {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const profile = await response.json();
          if (profile.birth_date) {
            const birthDate = new Date(profile.birth_date);
            birthInfo = {
              year: birthDate.getFullYear(),
              month: birthDate.getMonth() + 1,
              day: birthDate.getDate(),
              hour: profile.birth_hour || 12
            };
          }
        }
      }

      // 운세 생성 (실제 운세 로직은 추후 구현)
      const fortuneData = generateDailyFortune(todayInfo, birthInfo);
      setFortune(fortuneData);
    } catch (error) {
      console.error('Failed to load daily fortune:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyFortune = (todayInfo, birthInfo) => {
    const fortunes = {
      general: [
        "오늘은 새로운 기회가 찾아올 것입니다. 마음을 열고 받아들이세요.",
        "인내심을 가지고 차분히 하루를 보내면 좋은 결과가 있을 것입니다.",
        "주변 사람들과의 관계에 신경 쓰면 좋은 하루가 될 것입니다.",
        "오늘은 도전적인 정신이 필요한 날입니다. 두려워하지 마세요.",
        "휴식과 재충전이 필요한 시기입니다. 무리하지 마세요."
      ],
      work: [
        "업무에서 창의적인 아이디어가 떠오를 것입니다.",
        "동료들과의 협업이 중요한 시기입니다.",
        "신중한 결정이 필요한 하루입니다.",
        "새로운 프로젝트를 시작하기 좋은 날입니다.",
        "기존 업무를 정리하고 마무리하기 좋은 시기입니다."
      ],
      love: [
        "연인과의 대화가 중요한 날입니다.",
        "새로운 만남의 기회가 있을 수 있습니다.",
        "상대방의 마음을 이해하려 노력하세요.",
        "로맨틱한 분위기를 만들어보세요.",
        "혼자만의 시간도 소중히 여기세요."
      ],
      health: [
        "충분한 수면이 필요합니다.",
        "가벼운 운동으로 기분전환을 해보세요.",
        "균형 잡힌 식사가 중요합니다.",
        "스트레스 관리에 신경 쓰세요.",
        "야외 활동이 도움이 될 것입니다."
      ]
    };

    // 간단한 랜덤 선택 (실제로는 오행과 천간지지 기반 계산)
    const randomIndex = (arr) => Math.floor(Math.random() * arr.length);

    return {
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }),
      lunar: '', // 음력 정보는 추후 구현
      general: fortunes.general[randomIndex(fortunes.general)],
      work: fortunes.work[randomIndex(fortunes.work)],
      love: fortunes.love[randomIndex(fortunes.love)],
      health: fortunes.health[randomIndex(fortunes.health)],
      luckyNumber: Math.floor(Math.random() * 100),
      luckyColor: ['빨강', '파랑', '노랑', '초록', '보라', '주황'][randomIndex(['빨강', '파랑', '노랑', '초록', '보라', '주황'])],
      luckyDirection: ['동', '서', '남', '북'][randomIndex(['동', '서', '남', '북'])]
    };
  };

  return (
    <PageWrapper>
      <div className="daily-fortune-page">
        <main>
          <section id="daily-fortune">
            <div className="container">
              <div className="page-header">
                <button
                  onClick={() => router.back()}
                  className="back-button"
                >
                  ← 돌아가기
                </button>
              </div>

              <div className="card daily-fortune-card">
                <div className="card-header">
                  <h1 className="card-title text-center">
                    오늘의 운세
                  </h1>
                  <p className="sage-description text-center">
                    오늘 하루의 운세를 확인해보세요
                  </p>
                </div>

                {loading ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>운세를 불러오는 중...</p>
                  </div>
                ) : fortune ? (
                  <div className="fortune-content">
                    <div className="date-info">
                      <div className="date-display">
                        <span className="date-icon">📅</span>
                        <span className="date-text">{fortune.date}</span>
                      </div>
                      {fortune.lunar && (
                        <span className="lunar-date">{fortune.lunar}</span>
                      )}
                      <button
                        onClick={loadDailyFortune}
                        className="refresh-button"
                      >
                        <span>🔄</span>
                        새로고침
                      </button>
                    </div>

                    <div className="fortune-sections">
                      <div className="info-card">
                        <h3>총운</h3>
                        <p>{fortune.general}</p>
                      </div>

                      <div className="info-card">
                        <h3>직장운</h3>
                        <p>{fortune.work}</p>
                      </div>

                      <div className="info-card">
                        <h3>애정운</h3>
                        <p>{fortune.love}</p>
                      </div>

                      <div className="info-card">
                        <h3>건강운</h3>
                        <p>{fortune.health}</p>
                      </div>
                    </div>

                    <div className="info-card luck-card">
                      <h3>오늘의 행운</h3>
                      <div className="luck-grid">
                        <div className="luck-item">
                          <span className="luck-label">행운의 숫자</span>
                          <span className="luck-value">{fortune.luckyNumber}</span>
                        </div>
                        <div className="luck-item">
                          <span className="luck-label">행운의 색</span>
                          <span className="luck-value">{fortune.luckyColor}</span>
                        </div>
                        <div className="luck-item">
                          <span className="luck-label">행운의 방향</span>
                          <span className="luck-value">{fortune.luckyDirection}</span>
                        </div>
                      </div>
                    </div>

                    {!user && (
                      <div className="info-card login-prompt">
                        <p>
                          로그인하면 생년월일을 기반으로 더 정확한 운세를 확인할 수 있습니다
                        </p>
                        <button
                          onClick={() => router.push('/login')}
                          className="cta-button"
                        >
                          로그인하기
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="error-message">
                    <p>운세를 불러올 수 없습니다. 다시 시도해주세요.</p>
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