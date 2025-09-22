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
  const [menuToggleOpen, setMenuToggleOpen] = useState(true);
  const [serviceToggleOpen, setServiceToggleOpen] = useState(true);

  useEffect(() => {
    // Supabase 인증 상태 감시
    const {
      data: { subscription },
    } = onAuthStateChange((authUser) => {
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
        className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={handleOverlayClick}
      />

      {/* 슬라이드 메뉴 - PC와 모바일 통합 */}
      <div
        className={`mobile-menu ${mobileMenuOpen ? "mobile-menu-open" : ""}`}
        id="mobileNav"
      >
        <div className="slide-menu-container">
          {/* 헤더 섹션 */}
          <div className="slide-menu-header">
            <div
              className="slide-menu-title"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Image
                src="/assets/images/logo.png"
                alt="성격팔자"
                width={40}
                height={40}
                priority
                style={{ display: "block" }}
              />
              <span
                className="title-sub"
                style={{
                  color: "#FCA311",
                  fontWeight: "300",
                  fontSize: "12px",
                }}
              >
                내 인생, 합법적 스포일러
              </span>
            </div>
            <button
              className="slide-menu-close"
              onClick={closeMobileMenu}
              aria-label="메뉴 닫기"
            >
              ✕
            </button>
          </div>

          {/* 로그인 버튼 섹션 */}
          {!user && (
            <div
              className="slide-auth-buttons"
              style={{
                border: "1px solid #FCA311",
                backgroundColor: "#131316",
                borderRadius: "8px",
                padding: "16px",
                margin: "16px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <button
                className="slide-btn-signup"
                onClick={handleLogin}
                style={{ width: "80px", padding: "8px 16px" }}
              >
                로그인
              </button>
              <div className="slide-auth-note">로그인시 리포트 보관 가능</div>
            </div>
          )}

          {/* 메뉴 섹션 */}
          <div className="slide-menu-section">
            <div
              // className="slide-menu-label"
              onClick={() => setMenuToggleOpen(!menuToggleOpen)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",

                paddingBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#FCA311",
                }}
              >
                메뉴
              </span>
              <span
                style={{
                  transform: menuToggleOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              >
                ▼
              </span>
            </div>
            <div
              className="slide-menu-label"
              style={{ backgroundColor: "#FCA311", height: "1px" }}
            ></div>
            {menuToggleOpen && (
              <ul className="slide-menu-list">
                <li>
                  <Link
                    href="/"
                    className="slide-menu-item"
                    onClick={closeMobileMenu}
                  >
                    홈
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analyze"
                    className="slide-menu-item"
                    onClick={closeMobileMenu}
                  >
                    찻집
                  </Link>
                </li>
                <li>
                  <Link
                    href="/synergy"
                    className="slide-menu-item"
                    onClick={closeMobileMenu}
                  >
                    나와의 궁합 보기
                  </Link>
                </li>
                <li>
                  <a
                    href="#premium"
                    className="slide-menu-item"
                    onClick={handlePremiumClick}
                  >
                    토리와 상담하기
                  </a>
                </li>
                {user && (
                  <li>
                    <Link
                      href="/mypage"
                      className="slide-menu-item"
                      onClick={closeMobileMenu}
                    >
                      마이페이지
                    </Link>
                  </li>
                )}
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      className="slide-menu-item admin-item"
                      onClick={closeMobileMenu}
                    >
                      관리자
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* 토리의 서비스 섹션 */}
          <div className="slide-menu-section">
            <div
              onClick={() => setServiceToggleOpen(!serviceToggleOpen)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                paddingBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#FCA311",
                }}
              >
                토리의 서비스
              </span>
            </div>
            <div
              className="slide-menu-label"
              style={{ backgroundColor: "#FCA311", height: "1px" }}
            ></div>
          </div>

          {/* 유료 서비스 카드 */}

          <>
            <div className="slide-service-card">
              <h4 className="service-card-title">유료 서비스</h4>
              <p className="service-card-desc">
                상세한 내용들이 궁금하다면
                <br />
                이제 의뢰하기 버튼을 클릭해보세요.
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button className="service-card-btn" onClick={handlePremiumClick}>
                  의뢰하기
                </button>
              </div>
            </div>

            {/* 토리와 소통하기 카드 */}
            <div className="slide-service-card">
              <h4 className="service-card-title">토리와 소통하기</h4>
              <p className="service-card-desc">
                성격팔자의 최신 소식과
                <br />
                특별한 혜택을 가장 먼저 받아보세요.
              </p>
              <div className="social-links" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                <a
                  href="https://open.kakao.com/your-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    transition: "transform 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                  <Image
                    src="/assets/images/kakao_symbol.png"
                    alt="카카오톡"
                    width={32}
                    height={32}
                  />
                </a>
                <a
                  href="https://instagram.com/your-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    transition: "transform 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                  <Image
                    src="/assets/images/instagram_symbol.png"
                    alt="인스타그램"
                    width={32}
                    height={32}
                  />
                </a>
              </div>
            </div>
          </>

          {/* 로그아웃 버튼 (로그인 상태일 때) */}
          {user && (
            <div className="slide-logout-section">
              <button className="slide-logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}
        </div>
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
