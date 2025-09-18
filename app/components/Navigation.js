"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  onAuthChange,
  signOutUser,
  checkAdminAccess,
} from "../../lib/firebase-config";
import LoginModal from "./LoginModal";
import PremiumModal from "./PremiumModal";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    // Firebase 인증 상태 감시
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setIsAdmin(authUser ? checkAdminAccess(authUser) : false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
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

  return (
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

          <nav
            className="nav-menu desktop-nav"
            role="navigation"
            aria-label="주요 메뉴"
          >
            <ul>
              <li>
                <Link
                  href="/analyze"
                  className="nav-link"
                  aria-label="팔자 분석하러 가기"
                >
                  찻집
                </Link>
              </li>
              <li>
                <Link
                  href="/synergy"
                  className="nav-link"
                  aria-label="시너지 분석하러 가기"
                >
                  시너지
                </Link>
              </li>
              <li>
                <a
                  href="#premium"
                  className="nav-link"
                  aria-label="프리미엄 서비스 보기"
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
                    style={{ color: "#FF6B6B" }}
                    aria-label="관리자 대시보드"
                  >
                    🔐 관리자
                  </Link>
                </li>
              )}
            </ul>
          </nav>

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
                <li>
                  <Link
                    href="/analyze"
                    className="nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    찻집
                  </Link>
                </li>
                <li>
                  <Link
                    href="/synergy"
                    className="nav-link"
                    onClick={() => setMobileMenuOpen(false)}
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
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🔐 관리자
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
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
    </header>
  );
}
