"use client";

import { useEffect } from "react";

export default function PageWrapper({ children, fullWidth = false }) {
  useEffect(() => {
    // fullWidth가 false인 경우에만 constrained-layout 적용
    if (!fullWidth) {
      document.body.classList.add('constrained-layout');
    }

    return () => {
      // 컴포넌트 언마운트 시 클래스 제거
      document.body.classList.remove('constrained-layout');
    };
  }, [fullWidth]);

  return (
    <div className="page-wrapper">
      {children}
    </div>
  );
}