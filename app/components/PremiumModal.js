"use client";

import { useState } from "react";
import "./PremiumModal.css";

export default function PremiumModal({ isOpen, onClose }) {
  const [showComingSoon, setShowComingSoon] = useState(false);

  if (!isOpen && !showComingSoon) return null;

  return (
    <>
      {/* 프리미엄 서비스 모달 */}
      {isOpen && !showComingSoon && (
        <div
          className="premium-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="premium-modal-overlay" onClick={onClose}></div>
          <div
            className="premium-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="premium-modal-header">
              <h2 className="premium-modal-title">✨ 프리미엄 서비스</h2>
              <p className="premium-modal-subtitle">
                토리의 전문 분석 서비스를 선택하세요
              </p>
              <button
                className="premium-modal-close"
                onClick={onClose}
                aria-label="모달 닫기"
              >
                &times;
              </button>
            </div>

            <div className="premium-services-grid">
              <div className="service-card premium-card">
                <div className="service-icon">📊</div>
                <h3 className="service-title">상세 리포트</h3>
                <ul className="service-features">
                  <li>• MBTI+사주 융합 분석</li>
                  <li>• 직업 적성 매칭</li>
                  <li>• 연애/결혼운 상담</li>
                  <li>• 맞춤형 개운법</li>
                </ul>
                <div className="service-price">
                  <span className="price-original">₩ 29,000</span>
                  <span className="price-sale">₩ 9,900</span>
                </div>
                <button
                  className="service-btn-disabled"
                  onClick={() => setShowComingSoon(true)}
                >
                  준비중
                </button>
              </div>
            </div>

            <div className="premium-modal-footer">
              <button className="close-btn" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 준비중 모달 */}
      {showComingSoon && (
        <div
          className="coming-soon-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowComingSoon(false);
              onClose();
            }
          }}
        >
          <div
            className="coming-soon-modal-overlay"
            onClick={() => {
              setShowComingSoon(false);
              onClose();
            }}
          ></div>
          <div
            className="coming-soon-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="coming-soon-icon">🚧</div>
            <h3>서비스 준비중</h3>
            <p>
              더 나은 서비스를 위해 준비 중입니다.
              <br />곧 만나뵐 수 있도록 하겠습니다.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setShowComingSoon(false);
                onClose();
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
