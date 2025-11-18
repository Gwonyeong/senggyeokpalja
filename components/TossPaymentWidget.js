"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useCustomAuth } from "../app/hooks/useCustomAuth";

const TossPaymentWidget = forwardRef(
  (
    {
      consultationId,
      amount = 9900,
      orderName = "성격팔자 상세리포트",
      onPaymentSuccess,
    },
    ref
  ) => {
    const { user } = useCustomAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // 외부에서 handlePayment를 호출할 수 있도록 ref 노출
    useImperativeHandle(ref, () => ({
      openPayment: handlePayment,
    }));

    useEffect(() => {
      // SDK v2 스크립트 로드
      const script = document.createElement("script");
      script.src = "https://js.tosspayments.com/v2/standard";
      script.async = true;

      document.body.appendChild(script);

      // SDK 스크립트 로딩 완료

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }, []);

    const handlePayment = async () => {
      setShowModal(true);
      setIsLoading(true);

      const tp = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      );

      try {
        const orderId = `order_${consultationId}_${Date.now()}`;
        const customerKey = `customer_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 11)}`;

        // SDK v2 결제창 호출 - customerKey 필수
        const widget = tp.widgets({
          customerKey: customerKey,
        });
        await widget.setAmount({
          currency: "KRW",
          value: amount,
        });

        await Promise.all([
          // ------  결제 UI 렌더링 ------
          widget.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "ONE",
          }),
          // ------  이용약관 UI 렌더링 ------
          widget.renderAgreement({
            selector: "#agreement",
            variantKey: "ONE",
          }),
        ]);

        // 결제 요청 버튼 추가
        const paymentButton = document.createElement("button");
        paymentButton.textContent = "결제하기";
        paymentButton.style.cssText = `
        width: 100%;
        padding: 18px;
        background: linear-gradient(135deg, #FCA311 0%, #b8860b 100%);
        color: #000;
        border: 2px solid #FCA311;
        border-radius: 15px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        margin-top: 20px;
      `;

        paymentButton.onclick = async () => {
          try {
            // 1. 결제 정보를 미리 저장
            const createResponse = await fetch("/api/payment/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: orderId,
                paymentKey: `temp_${orderId}`, // 임시 키, 실제 결제 후 업데이트됨
                amount: amount,
                customerName: user?.name || "고객",
                customerEmail: user?.email || "customer@example.com",
                productName: orderName,
                userId: user?.id || null,
                consultationId: consultationId,
              }),
            });

            if (!createResponse.ok) {
              throw new Error("결제 정보 저장에 실패했습니다.");
            }

            const { paymentId } = await createResponse.json();

            // 2. 토스페이먼츠 결제 요청
            await widget.requestPayment({
              orderId: orderId,
              orderName: orderName,
              successUrl: `${window.location.origin}/api/payment/success?paymentId=${paymentId}`,
              failUrl: `${window.location.origin}/api/payment/fail?paymentId=${paymentId}`,
              customerEmail: user?.email || "customer@example.com",
              customerName: user?.name || "고객",
            });
          } catch (error) {
            console.error("결제 요청 실패:", error);
            alert("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
          }
        };

        document.getElementById("agreement")?.appendChild(paymentButton);
      } catch (error) {
        console.error("결제 요청 실패:", error);
        alert("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        {/* 토리와 상담받기 버튼 */}

        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                padding: "40px",
                width: "90%",
                maxWidth: "500px",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>

              <div id="payment-method" style={{ marginBottom: "20px" }}></div>
              <div id="agreement"></div>
            </div>
          </div>
        )}
      </>
    );
  }
);

TossPaymentWidget.displayName = "TossPaymentWidget";

export default TossPaymentWidget;
