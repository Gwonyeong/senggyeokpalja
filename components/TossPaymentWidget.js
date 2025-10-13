"use client";

import { useEffect, useState } from "react";

const TossPaymentWidget = ({
  consultationId,
  amount = 9900,
  orderName = "성격팔자 상세리포트",
  onPaymentSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tossPayments, setTossPayments] = useState(null);

  useEffect(() => {
    // SDK v2 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v2/standard";
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
      const customerKey = `customer_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}`;

      // SDK v2 결제창 호출 - customerKey 필수
      const payment = tossPayments.payment({
        customerKey: customerKey,
      });

      await payment.requestPayment({
        method: "CARD", // 영문 대문자로 변경
        amount: {
          currency: "KRW",
          value: amount,
        },
        orderId: orderId,
        orderName: orderName,
        successUrl: `${window.location.origin}/api/payment/success`,
        failUrl: `${window.location.origin}/api/payment/fail`,
        customerEmail: "customer@example.com",
        customerName: "고객",
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !tossPayments}
      style={{
        width: "100%",
        padding: "18px",
        background:
          isLoading || !tossPayments
            ? "#666"
            : "linear-gradient(135deg, #FCA311 0%, #b8860b 100%)",
        color: isLoading || !tossPayments ? "#999" : "#000",
        border: "2px solid #FCA311",
        borderRadius: "15px",
        fontSize: "18px",
        fontWeight: "700",
        cursor: isLoading || !tossPayments ? "not-allowed" : "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(252, 163, 17, 0.3)",
        fontFamily: "'Noto Serif KR', serif",
        letterSpacing: "1px",
        marginTop: "20px",
      }}
      onMouseOver={(e) => {
        if (!isLoading && tossPayments) {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(252, 163, 17, 0.4)";
        }
      }}
      onMouseOut={(e) => {
        if (!isLoading && tossPayments) {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 12px rgba(252, 163, 17, 0.3)";
        }
      }}
    >
      {isLoading
        ? "결제 요청중..."
        : !tossPayments
        ? "결제 준비중..."
        : "토리와 상담받기"}
    </button>
  );
};

export default TossPaymentWidget;
