"use client";

import { useEffect, useState } from "react";

const TossPaymentWidget = ({
  consultationId,
  amount = 10000,
  orderName = "플라자 상담 서비스",
  onPaymentSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tossPayments, setTossPayments] = useState(null);

  useEffect(() => {
    // SDK v2 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v2/standard';
    script.async = true;
    script.onload = () => {
      if (window.TossPayments) {
        const tp = window.TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
        setTossPayments(tp);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!tossPayments) {
      alert("결제 시스템을 초기화하는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const orderId = `order_${consultationId}_${Date.now()}`;
      const customerKey = `customer_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      // SDK v2 결제창 호출 - customerKey 필수
      const payment = tossPayments.payment({
        customerKey: customerKey
      });

      await payment.requestPayment({
        method: "CARD",  // 영문 대문자로 변경
        amount: {
          currency: "KRW",
          value: amount,
        },
        orderId: orderId,
        orderName: orderName,
        successUrl: `${window.location.origin}/api/payment/success`,
        failUrl: `${window.location.origin}/api/payment/fail`,
        customerEmail: "customer@example.com",
        customerName: "고객"
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ marginBottom: "15px", color: "#d4af37" }}>결제 정보</h3>
      <p style={{ marginBottom: "15px", color: "#ccc" }}>
        전체 상담 내용을 확인하려면 결제가 필요합니다.
      </p>
      <p style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "bold", color: "#d4af37" }}>
        결제 금액: {amount.toLocaleString()}원
      </p>

      <button
        onClick={handlePayment}
        disabled={isLoading || !tossPayments}
        style={{
          width: "100%",
          padding: "15px",
          backgroundColor: (isLoading || !tossPayments) ? "#666" : "#d4af37",
          color: (isLoading || !tossPayments) ? "#999" : "#000",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: (isLoading || !tossPayments) ? "not-allowed" : "pointer",
          transition: "all 0.3s ease"
        }}
      >
        {isLoading ? "결제 요청중..." : !tossPayments ? "결제 준비중..." : "결제하기"}
      </button>
    </div>
  );
};

export default TossPaymentWidget;