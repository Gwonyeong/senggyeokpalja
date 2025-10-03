"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { onAuthStateChange } from "../lib/supabase-auth";
import MainToonSlider from "@/components/MainToonSlider";
import CustomerStoriesSlider from "@/components/CustomerStoriesSlider";
import LoginModal from "./components/LoginModal";

export default function Home() {
  const [showToast, setShowToast] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const scrollToServices = () => {
    const servicesSection = document.querySelector(".services-section");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Supabase 인증 상태 감시
    const {
      data: { subscription },
    } = onAuthStateChange((authUser) => {
      setUser(authUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSynergyClick = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleAnalyzeClick = (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
    } else {
      window.location.href = "/analyze";
    }
  };

  return (
    <>
      <main>
        {/* Hero Section */}
        <section id="hero">
          <div className="container">
            <div className="hero-content">
              <p className="sage-subtitle">
                &ldquo;어서 오시게.
                <br />
                그대의 이야기가 담긴 <br />
                차를 준비하겠네.&rdquo;
              </p>
              <p className="hero-description">
                이곳은 당신의 타고난 운명 팔자유형을 엿보는 공간입니다.
              </p>
              <button
                onClick={handleAnalyzeClick}
                className="cta-button ink-brush-effect"
              >
                팔자유형 보러가기
              </button>
            </div>
          </div>
        </section>
        {/* Toon Slider Section */}
        <MainToonSlider />

        {/* Services Section - Image Grid */}
        <section className="services-section">
          <div className="container">
            <div className="ml-[15px]">
              <h2 className="text-[24px] text-[#FCA311] text-left">
                토리의 서비스 안내
              </h2>
            </div>
            <div className="flex flex-col items-center  mb-[20px] mt-[12px]">
              <div className="w-[calc(100%-30px)] h-[1px] bg-[#FCA311] " />
            </div>

            <div className="services-image-grid">
              <Link href="/analyze" className="service-image-item">
                <div className="service-image-badge">무료</div>
                <div className="service-image-wrapper">
                  <img src="/assets/images/service-1.png" alt="팔자유형 분석" />
                </div>
                <div className="service-image-content">
                  <h3 className="service-image-title">팔자유형 알아보기</h3>
                  <p className="service-image-description">
                    사주판 mbti를 알아보세요.
                  </p>
                </div>
              </Link>
              <Link href="/synergy" className="service-image-item">
                <div className="service-image-badge">무료</div>
                <div className="service-image-wrapper">
                  <img
                    src="/assets/images/service-2.png"
                    alt="MBTI × 팔자유형 시너지"
                  />
                </div>
                <div className="service-image-content">
                  <h3 className="service-image-title">나와의 궁합 보기</h3>
                  <p className="service-image-description">
                    mbti와 팔자유형의 궁합 점수를 알아보세요.
                  </p>
                </div>
              </Link>
              <Link href="/consultation" className="service-image-item">
                <div className="service-image-badge premium">프리미엄</div>
                <div className="service-image-wrapper">
                  <img
                    src="/assets/images/service-3.png"
                    alt="토리와의 개별 상담"
                  />
                </div>
                <div className="service-image-content">
                  <h3 className="service-image-title">인생 스포일러 보기</h3>
                  <p className="service-image-description">
                    토리에게 상세 해석을 의뢰해보세요.
                  </p>
                </div>
              </Link>
              <div
                onClick={handleSynergyClick}
                className="service-image-item cursor-pointer"
              >
                <div className="service-image-badge premium">프리미엄</div>
                <div className="service-image-wrapper">
                  <img
                    src="/assets/images/service-4.png"
                    alt="토리와 소통하기"
                  />
                </div>
                <div className="service-image-content">
                  <h3 className="service-image-title">인연 스포일러 보기</h3>
                  <p className="service-image-description">
                    연인, 친구, 동료와의 인연 스포일러를 확인하세요.
                  </p>
                </div>
              </div>
            </div>
            {/* <div className="flex justify-center mt-[20px]">
              <Link href="/services" className="text-[#EAEAEA] text-[14px]">
                더 많은 서비스 보기
              </Link>
            </div> */}
          </div>
        </section>
        {/* Customer Stories Section */}
        <section className="customer-stories-section">
          <div className="container">
            <h2 className="ml-[15px] text-[24px] text-[#FCA311] text-left">
              먼저 다녀간 손님들의 이야기
            </h2>
            <div className="flex flex-col items-center mb-[20px] mt-[12px]">
              <div className="w-[calc(100%-30px)] h-[1px] bg-[#FCA311]" />
            </div>

            <CustomerStoriesSlider />

            <div
              className="story-info-box"
              style={{ border: "1px solid #FCA311" }}
            >
              <p className="story-info-header">
                이미 수많은 나그네들이 <br />
                토리의 찻집에서{" "}
                <span style={{ color: "#FCA311" }}>자신의 길</span>을
                찾았습니다.
              </p>
              <p className="story-info-title">이제, 당신의 차례입니다.</p>
              <Link href="/consultation" className="story-cta-button">
                의뢰하기
              </Link>
              <p className="story-info-subtitle">
                토리는 아직 들려주지 못한, 당신만의 이야기를 기다리고 있습니다.{" "}
                <br />
                찻집의 단골이 되어, 가장 먼저 새로운 소식을 받아보시겠습니까?
              </p>
              <div className="story-social-buttons">
                <a
                  href="http://pf.kakao.com/_BxnBxmn/friend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="story-social-button story-kakao-button"
                >
                  <img
                    src="/assets/images/kakao_symbol.png"
                    alt="카카오톡 채널 추가"
                    className="social-icon-img"
                  />
                </a>
                <a
                  href="https://www.instagram.com/palja_tory/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="story-social-button story-instagram-button"
                >
                  <img
                    src="/assets/images/instagram_symbol.png"
                    alt="인스타그램 팔로우"
                    className="social-icon-img"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
          <p className="text-sm font-medium">준비중입니다</p>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="brand-name">성격팔자</h3>
            </div>
            <div className="footer-links">
              <Link
                href="/terms"
                style={{
                  color: "var(--text-muted-color)",
                  textDecoration: "none",
                  marginRight: "20px",
                }}
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                style={{
                  color: "var(--text-muted-color)",
                  textDecoration: "none",
                }}
              >
                개인정보처리방침
              </Link>
            </div>
            <div className="footer-info">
              <p>&copy; 2025 성격팔자. All rights reserved.</p>
            </div>
          </div>

          {/* Business Info - Separate Section */}
          <div className="footer-business-info">
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted-color)",
                lineHeight: "1.4",
              }}
            >
              <div>상호: 성격팔자 | 대표: 천재훈</div>
              <div>사업자등록번호: 589-34-01598</div>
              <div>통신판매업: 2025-의정부송산-0941</div>
              <div>주소: 경기도 의정부시 서광로 166</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
