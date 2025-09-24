"use client";

import { useEffect } from "react";

export default function PageWrapper({ children }) {
  useEffect(() => {
    // 비메인 페이지임을 body에 표시
    document.body.classList.add('constrained-layout');

    return () => {
      // 컴포넌트 언마운트 시 클래스 제거
      document.body.classList.remove('constrained-layout');
    };
  }, []);

  return (
    <div className="page-wrapper">
      {children}
    </div>
  );
}