"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  onAuthStateChange,
  signOut,
  checkAdminAccess,
} from "../../lib/supabase-auth";
import LoginModal from "./LoginModal";
import PremiumModal from "./PremiumModal";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    // Supabase 인증 상태 감시
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsAdmin(authUser ? checkAdminAccess(authUser) : false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAdmin(false);
      alert("로그아웃되었습니다.");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  const handleLogin = () => {
    setShowLoginModal(true);
    setMobileMenuOpen(false);
  };

  const handlePremiumClick = (e) => {
    e.preventDefault();
    setShowPremiumModal(true);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleOverlayClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <Link href="/" className="logo">
                <Image
                  src="/assets/images/logo.png"
                  alt="성격팔자"
                  width={50}
                  height={50}
                  priority
                  style={{ display: "block" }}
                />
              </Link>
              <span className="tagline">내 인생, 합법적 스포일러</span>
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
        </div>
      </header>

      {/* 딤드 오버레이 - 헤더 밖으로 이동 */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={handleOverlayClick}
      />

      {/* 슬라이드 메뉴 - PC와 모바일 통합 */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`} id="mobileNav">
          <nav className="mobile-nav" role="navigation">
            <ul>
              <li>
                <Link
                  href="/analyze"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  찻집
                </Link>
              </li>
              <li>
                <Link
                  href="/synergy"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  시너지
                </Link>
              </li>
              <li>
                <a
                  href="#premium"
                  className="nav-link"
                  onClick={handlePremiumClick}
                >
                  의뢰하기
                </a>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    className="nav-link admin-only"
                    onClick={closeMobileMenu}
                  >
                    🔐 관리자
                  </Link>
                </li>
              )}
              {user && (
                <li>
                  <Link
                    href="/mypage"
                    className="nav-link"
                    onClick={closeMobileMenu}
                  >
                    👤 마이페이지
                  </Link>
                </li>
              )}
            </ul>

            {/* 인증 섹션 */}
            <div className="mobile-auth-section">
              <ul>
                {user ? (
                  <li>
                    <button
                      className="nav-link"
                      onClick={handleLogout}
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '15px 30px'
                      }}
                    >
                      🚪 로그아웃
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      className="nav-link"
                      onClick={handleLogin}
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '15px 30px'
                      }}
                    >
                      🔑 로그인
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </div>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* 프리미엄 서비스 모달 */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </>
  );
}
