"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ChuseokEventModal = ({ isOpen, onClose, consultationId }) => {
  const [showPasscodeInput, setShowPasscodeInput] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;


  const handlePassCodeClick = () => {
    setShowPasscodeInput(true);
  };

  const handlePasscodeSubmit = async () => {
    if (passcode.trim().toLowerCase() === "happytory") {
      setIsProcessing(true);

      try {
        // 결제 완료 처리 API 호출
        const response = await fetch(`/api/consultation/${consultationId}/complete-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ passcode: "happytory" }),
        });

        if (response.ok) {
          alert("축하합니다! 추석 이벤트 혜택이 적용되었습니다.");
          // 섹션 2로 이동
          const currentPath = window.location.pathname;
          window.location.href = `${currentPath}?section=2`;
        } else {
          alert("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("처리 중 오류가 발생했습니다.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("올바른 통행증이 아닙니다.");
      setPasscode("");
    }
  };

  return (
    <>
      {/* 모달 배경 오버레이 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 999999,  // z-index를 매우 높게 설정
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}
        onClick={onClose}
      >
        {/* 모달 컨텐츠 */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: "16px",
            padding: "40px",
            maxWidth: "500px",
            width: "100%",
            position: "relative",
            border: "2px solid #FCA311",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              backgroundColor: "transparent",
              border: "none",
              color: "#999",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ×
          </button>

          {/* 모달 헤더 */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{
              color: "#FCA311",
              fontSize: "22px",
              marginBottom: "20px",
              fontFamily: "'Noto Serif KR', serif"
            }}>
              아, 그대의 지갑은 잠시 넣어두시게.
            </h2>
            <p style={{
              color: "#fff",
              fontSize: "15px",
              lineHeight: "1.8",
              marginBottom: "15px"
            }}>
              풍성한 한가위 아닌가.<br/>
              오늘만큼은, <span style={{ color: "#FCA311" }}>토리가 그대에게 주는 작은 선물</span>이라네.<br/>
              그대의 이야기는 이미 시작되었네.
            </p>
            <p style={{
              color: "#999",
              fontSize: "13px",
              lineHeight: "1.6"
            }}>
              카카오 채널에서 다음 장으로 넘어가는 <span style={{ color: "#FCA311" }}>&lsquo;통행증&rsquo;</span>을 받아가시게.
            </p>
          </div>

          {/* 이벤트 내용 */}
          {!showPasscodeInput ? (
            <>

              {/* 버튼 컨테이너 */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "15px"
              }}>
                {/* 카카오톡 채널 추가 버튼 */}
                <a
                  href="http://pf.kakao.com/_BxnBxmn/friend"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: "15px 20px",
                    backgroundColor: "#FEE500",
                    color: "#000000",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#FFD700"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#FEE500"}
                >
                  <Image
                    src="/assets/images/kakao_symbol.png"
                    alt="카카오톡"
                    width={16}
                    height={16}
                    style={{ objectFit: "contain" }}
                  />
                  카카오톡 채널 추가하기
                </a>

                {/* 통행증 입력하기 버튼 */}
                <button
                  onClick={handlePassCodeClick}
                  style={{
                    flex: 1,
                    padding: "15px 20px",
                    backgroundColor: "transparent",
                    color: "#d4af37",
                    border: "2px solid #d4af37",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#d4af37";
                    e.target.style.color = "#000";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#d4af37";
                  }}
                >
                  통행증 입력하기
                </button>
              </div>
            </>
          ) : (
            /* 통행증 입력 UI */
            <>
              <div style={{
                backgroundColor: "#0a0a0a",
                borderRadius: "8px",
                padding: "25px",
                marginBottom: "25px"
              }}>
                <p style={{
                  color: "#fff",
                  fontSize: "15px",
                  marginBottom: "20px",
                  textAlign: "center"
                }}>
                  추석 이벤트 통행증을 입력해주세요
                </p>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handlePasscodeSubmit()}
                  placeholder="통행증 입력"
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    backgroundColor: "#1a1a1a",
                    border: "2px solid #333",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "16px",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#d4af37"}
                  onBlur={(e) => e.target.style.borderColor = "#333"}
                  disabled={isProcessing}
                />
              </div>

              {/* 버튼 컨테이너 */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "15px"
              }}>
                <button
                  onClick={() => {
                    setShowPasscodeInput(false);
                    setPasscode("");
                  }}
                  style={{
                    flex: 1,
                    padding: "15px 20px",
                    backgroundColor: "transparent",
                    color: "#999",
                    border: "2px solid #333",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  disabled={isProcessing}
                >
                  뒤로가기
                </button>

                <button
                  onClick={handlePasscodeSubmit}
                  style={{
                    flex: 1,
                    padding: "15px 20px",
                    backgroundColor: isProcessing ? "#666" : "#d4af37",
                    color: isProcessing ? "#999" : "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease"
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? "처리 중..." : "확인"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ChuseokEventModal;