"use client";

import Image from "next/image";

export default function PromotionBubble() {
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "25.5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "3.2% 50px",
            background: "linear-gradient(135deg, #4A90E2 0%, #3A7BC8 100%)",
            color: "white",
            border: "none",
            borderRadius: "25px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(74, 144, 226, 0.3)",
            transition: "all 0.3s ease",
          }}
          onClick={() => {
            // 구매하기 기능 구현
            console.log("구매하기 클릭");
          }}
        >
          구매하기
        </button>
      </div>
      {/* 기존 이미지를 배경으로 유지 */}
      <Image
        src="/assets/images/results/1장/promotion.png"
        alt="프로모션 이미지"
        width={600}
        height={400}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
        priority
      />

      {/* 말풍선 오버레이 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {/* 중앙 프로모션 텍스트 */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 252, 255, 0.98) 100%)",
            padding: "20px 30px",
            borderRadius: "15px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
            border: "2px solid #E8F4FD",
          }}
        ></div>

        {/* 하단 구매 버튼 */}
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "75%",
          }}
        >
          <button
            style={{
              width: "100%",
              padding: "3.5% 20px",
              background: "linear-gradient(135deg, #4A90E2 0%, #3A7BC8 100%)",
              color: "white",
              border: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(74, 144, 226, 0.3)",
              transition: "all 0.3s ease",
            }}
            onClick={() => {
              // 구매하기 기능 구현
              console.log("구매하기 클릭");
            }}
          >
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
}
