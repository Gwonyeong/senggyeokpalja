'use client';

import Link from 'next/link';

export default function Home() {
  const scrollToServices = () => {
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <main>
        {/* Hero Section */}
        <section id="hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="sage-title">성격팔자</h1>
              <p className="sage-subtitle">그대의 길을 묻는가?</p>
              <p className="hero-description">
                사주와 심리학을 통달한 토리가 운영하는 찻집에서,<br />
                당신만의 운명을 발견해보세요.
              </p>
              <Link href="/analyze" className="cta-button ink-brush-effect">
                나의 길, 묻기
              </Link>
            </div>
            <div className="scroll-indicator">
              <div className="scroll-arrow" onClick={scrollToServices}>
                <span>더 많은 서비스 보기</span>
                <div className="arrow-down">↓</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <div className="container">
            <h2 className="sage-title">토리의 서비스 안내</h2>
            <p className="services-subtitle">당신의 운명을 더 깊이 탐구할 수 있는 다양한 길을 준비했습니다</p>
            <div className="services-grid">
              <div className="service-card free">
                <div className="service-badge">무료</div>
                <div className="service-card-content">
                  <div className="service-icon">🔮</div>
                  <h3>팔자유형 분석</h3>
                  <p>16가지 팔자유형과<br />기본적인 운명 해석을 무료로 제공합니다</p>
                </div>
                <div className="service-card-footer">
                  <Link href="/analyze" className="service-btn primary">
                    팔자유형 분석하기
                  </Link>
                </div>
              </div>
              <div className="service-card free">
                <div className="service-badge">무료</div>
                <div className="service-card-content">
                  <div className="service-icon">⚡</div>
                  <h3>MBTI × 팔자유형 시너지</h3>
                  <p>MBTI와 팔자유형의 만남<br />당신의 시너지를 발견해보세요</p>
                </div>
                <div className="service-card-footer">
                  <Link href="/synergy" className="service-btn primary">
                    시너지 분석하기
                  </Link>
                </div>
              </div>
              <div className="service-card premium">
                <div className="service-badge">프리미엄</div>
                <div className="service-card-content">
                  <div className="service-icon">📜</div>
                  <h3>상세 운명 리포트</h3>
                  <p>개인 맞춤 상세 분석과<br />토리의 특별한 조언이 담긴 상세 리포트</p>
                </div>
                <div className="service-card-footer">
                  <a href="#premium" className="service-btn secondary">
                    준비중
                  </a>
                </div>
              </div>
              <div className="service-card premium">
                <div className="service-badge">프리미엄</div>
                <div className="service-card-content">
                  <div className="service-icon">💝</div>
                  <h3>궁합 분석 서비스</h3>
                  <p>연인, 친구, 동료와의 깊이 있는<br />궁합 분석과 관계 개선 조언</p>
                </div>
                <div className="service-card-footer">
                  <a href="#premium" className="service-btn secondary">
                    준비중
                  </a>
                </div>
              </div>
              <div className="service-card consultation">
                <div className="service-badge">1:1 상담</div>
                <div className="service-card-content">
                  <div className="service-icon">🍵</div>
                  <h3>토리와의 개별 상담</h3>
                  <p>토리의 발전을 위한<br />사전예약 및 설문조사를 진행해주세요</p>
                </div>
                <div className="service-card-footer">
                  <a
                    href="https://smore.im/form/2RQBeyh8f3"
                    target="_blank"
                    className="service-btn accent"
                    rel="noopener noreferrer"
                  >
                    상담 신청하기
                  </a>
                </div>
              </div>
              <div className="service-card social">
                <div className="service-badge">소통</div>
                <div className="service-card-content">
                  <div className="service-icon">📱</div>
                  <h3>토리와 소통하기</h3>
                  <p>성격팔자의 최신 소식과<br />특별한 혜택을 가장 먼저 받아보세요</p>
                </div>
                <div className="service-card-footer">
                  <div className="social-service-buttons">
                    <a
                      href="http://pf.kakao.com/_BxnBxmn/friend"
                      target="_blank"
                      className="service-btn kakao"
                      rel="noopener noreferrer"
                    >
                      카카오톡 채널 추가
                    </a>
                    <a
                      href="https://www.instagram.com/palja_tory/"
                      target="_blank"
                      className="service-btn instagram"
                      rel="noopener noreferrer"
                    >
                      인스타그램 팔로우
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="features-preview">
          <div className="container">
            <h2 className="sage-title">토리의 찻집에서 만나는 세 가지 깨달음</h2>
            <div className="feature-cards">
              <div className="card ink-brush-effect">
                <div className="card-icon">🎋</div>
                <h3 className="sage-subtitle">16가지 팔자의 길</h3>
                <p>고대 명리학과 현대 심리학이 만나 탄생한 당신만의 성격 해석</p>
              </div>
              <div className="card ink-brush-effect">
                <div className="card-icon">🍃</div>
                <h3 className="sage-subtitle">인연의 실타래</h3>
                <p>당신과 기운이 통하는 사람들을 찾아 운명의 실을 엮어보세요</p>
              </div>
              <div className="card ink-brush-effect">
                <div className="card-icon">🌸</div>
                <h3 className="sage-subtitle">토리의 조언</h3>
                <p>무림 고수 토리가 전하는 당신만의 인생 지혜와 앞날에 대한 통찰</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="brand-name">성격팔자</h3>
            </div>
            <div className="footer-info">
              <p>&copy; 2025 성격팔자. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}