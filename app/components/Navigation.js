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
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Supabase 인증 상태 감시
    const {
      data: { subscription },
    } = onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsAdmin(authUser ? checkAdminAccess(authUser) : false);

      // 사용자 프로필 정보 설정 (mypage와 동일한 방식)
      if (authUser) {
        setUserProfile({
          name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "Unknown",
          email: authUser.email,
          photoURL: authUser.user_metadata?.avatar_url || "",
          joinDate: authUser.created_at,
        });
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 메뉴 열림/닫힘에 따른 body 스크롤 제어
  useEffect(() => {
    if (mobileMenuOpen) {
      // 메뉴가 열렸을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 메뉴가 닫혔을 때 body 스크롤 복원
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

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

          {/* 프로필 섹션 (로그인 상태일 때) */}
          {user && userProfile && (
            <div
              className="slide-profile-section"
              style={{
                border: "1px solid #FCA311",
                backgroundColor: "#131316",
                borderRadius: "8px",
                padding: "16px",
                margin: "16px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                }}
              >
                {userProfile.photoURL ? (
                  <Image
                    src={userProfile.photoURL}
                    alt="프로필 이미지"
                    width={40}
                    height={40}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#FCA311",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#000",
                    }}
                  >
                    {userProfile.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#FCA311",
                    }}
                  >
                    {userProfile.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {userProfile.email}
                  </div>
                </div>
              </div>
              <Link
                href="/mypage"
                onClick={closeMobileMenu}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  backgroundColor: "#FCA311",
                  color: "#000",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                  transition: "all 0.3s ease",
                }}
              >
                마이페이지
              </Link>
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
                  <Link
                    href="/consultation"
                    className="slide-menu-item"
                    onClick={closeMobileMenu}
                  >
                    토리와 상담하기
                  </Link>
                </li>

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
                <button
                  className="service-card-btn"
                  onClick={handlePremiumClick}
                >
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
              <div
                className="social-links"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                }}
              >
                <a
                  href="https://open.kakao.com/your-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "scale(1.1)")
                  }
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
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
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "scale(1.1)")
                  }
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
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
