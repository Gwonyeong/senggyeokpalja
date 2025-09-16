'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = async () => {
    // TODO: Implement Firebase logout
    console.log('로그아웃');
  };

  const handleLogin = () => {
    window.location.href = '/auth/login';
  };

  return (
    <header>
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <Link href="/" className="logo">
              성격팔자
            </Link>
            <span className="tagline">그대의 길을 묻는가?</span>
          </div>

          <nav className="nav-menu desktop-nav" role="navigation" aria-label="주요 메뉴">
            <ul>
              <li><Link href="/analyze" className="nav-link" aria-label="팔자 분석하러 가기">찻집</Link></li>
              <li><Link href="/synergy" className="nav-link" aria-label="시너지 분석하러 가기">시너지</Link></li>
              <li><Link href="#premium" className="nav-link" aria-label="프리미엄 서비스 보기">의뢰하기</Link></li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className="nav-link admin-only" style={{ color: '#FF6B6B' }} aria-label="관리자 대시보드">
                    🔐 관리자
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div id="auth-container">
            {!user ? (
              <button onClick={handleLogin} className="header-auth-btn">로그인</button>
            ) : (
              <>
                <Link href="/mypage" className="header-auth-btn">마이페이지</Link>
                <button onClick={handleLogout} className="header-auth-btn">로그아웃</button>
              </>
            )}
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="모바일 메뉴 열기"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobileNav"
          >
            ☰
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="mobile-menu" id="mobileNav">
            <nav className="mobile-nav" role="navigation">
              <ul>
                <li><Link href="/analyze" className="nav-link" onClick={() => setMobileMenuOpen(false)}>찻집</Link></li>
                <li><Link href="/synergy" className="nav-link" onClick={() => setMobileMenuOpen(false)}>시너지</Link></li>
                <li><Link href="#premium" className="nav-link" onClick={() => setMobileMenuOpen(false)}>의뢰하기</Link></li>
                {isAdmin && (
                  <li>
                    <Link href="/admin" className="nav-link admin-only" onClick={() => setMobileMenuOpen(false)}>
                      🔐 관리자
                    </Link>
                  </li>
                )}
                <li className="mobile-auth-section">
                  {!user ? (
                    <button onClick={handleLogin} className="nav-link">로그인</button>
                  ) : (
                    <>
                      <Link href="/mypage" className="nav-link" onClick={() => setMobileMenuOpen(false)}>마이페이지</Link>
                      <button onClick={handleLogout} className="nav-link">로그아웃</button>
                    </>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}