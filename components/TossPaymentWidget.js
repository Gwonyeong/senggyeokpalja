"use client";

import { useEffect, useRef, useState } from "react";

const TossPaymentWidget = ({
  consultationId,
  amount = 10000,
  orderName = "플라자 상담 서비스",
  onPaymentSuccess
}) => {
  const paymentRef = useRef(null);
  const agreementRef = useRef(null);
  const widgetsRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [customerKey] = useState(() => `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");

        const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);

        const widgets = tossPayments.widgets({
          customerKey: customerKey
        });

        await widgets.setAmount({ currency: "KRW", value: amount });

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
          })
        ]);

        widgetsRef.current = widgets;
        setReady(true);
      } catch (error) {
        console.error("결제위젯 로드 실패:", error);
      }
    }

    fetchPaymentWidgets();
  }, [amount, customerKey]);

  const handlePayment = async () => {
    const widgets = widgetsRef.current;

    if (!widgets) {
      alert("결제 준비가 완료되지 않았습니다.");
      return;
    }

    try {
      const orderId = `order_${consultationId}_${Date.now()}`;

      await widgets.requestPayment({
        orderId: orderId,
        orderName: orderName,
        successUrl: `${window.location.origin}/api/payment/success`,
        failUrl: `${window.location.origin}/api/payment/fail`,
        metadata: {
          consultationId: consultationId
        }
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
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

      <div id="payment-method" style={{ marginBottom: "20px" }}></div>
      <div id="agreement" style={{ marginBottom: "20px" }}></div>

      <button
        onClick={handlePayment}
        disabled={!ready}
        style={{
          width: "100%",
          padding: "15px",
          backgroundColor: ready ? "#d4af37" : "#666",
          color: ready ? "#000" : "#999",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: ready ? "pointer" : "not-allowed",
          transition: "all 0.3s ease"
        }}
      >
        {ready ? "결제하기" : "결제 준비중..."}
      </button>
    </div>
  );
};

export default TossPaymentWidget;