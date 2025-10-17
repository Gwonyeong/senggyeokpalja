"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function GoogleAnalytics({ measurementId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Google Analytics 스크립트 로드
    if (typeof window !== "undefined" && measurementId) {
      // gtag 함수 초기화
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;

      gtag("js", new Date());
      gtag("config", measurementId, {
        page_title: document.title,
        page_location: window.location.href,
      });

      // 동적으로 Google Analytics 스크립트 추가
      if (!document.querySelector(`script[src*="${measurementId}"]`)) {
        const script = document.createElement("script");
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [measurementId]);

  useEffect(() => {
    // 페이지 변경 시 페이지뷰 추적
    if (typeof window !== "undefined" && window.gtag && measurementId) {
      const url = pathname + searchParams.toString();
      window.gtag("config", measurementId, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.origin + url,
      });
    }
  }, [pathname, searchParams, measurementId]);

  return null;
}

// 이벤트 추적을 위한 유틸리티 함수들
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 페이지뷰 수동 추적 (SPA에서 유용)
export const trackPageView = (url, title) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
      page_location: window.location.origin + url,
    });
  }
};

// 사용자 정의 이벤트 추적 함수들
export const analytics = {
  // 사주 분석 완료 이벤트
  trackSajuAnalysisComplete: (userId, analysisType) => {
    trackEvent("saju_analysis_complete", "engagement", analysisType, userId);
  },

  // 결제 시작 이벤트
  trackPaymentStart: (amount, currency = "KRW") => {
    trackEvent("begin_checkout", "ecommerce", "payment_start", amount);
  },

  // 결제 완료 이벤트
  trackPurchase: (transactionId, amount, currency = "KRW") => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: transactionId,
        value: amount,
        currency: currency,
        event_category: "ecommerce",
      });
    }
  },

  // 회원가입 이벤트
  trackSignUp: (method) => {
    trackEvent("sign_up", "engagement", method);
  },

  // 로그인 이벤트
  trackLogin: (method) => {
    trackEvent("login", "engagement", method);
  },

  // 궁합 분석 이벤트
  trackSynergyAnalysis: (userId1, userId2) => {
    trackEvent("synergy_analysis", "engagement", "compatibility_check");
  },

  // 공유 이벤트
  trackShare: (contentType, method) => {
    trackEvent("share", "engagement", `${contentType}_${method}`);
  },

  // 페이지 체류 시간 추적
  trackEngagement: (pageName, timeSpent) => {
    trackEvent("engagement_time", "engagement", pageName, timeSpent);
  },
};