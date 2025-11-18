"use client";

import Image from "next/image";

export default function SpeechBubblePromo() {
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #E8F4FD 0%, #E1F2FF 100%)",
          borderRadius: "20px",
          padding: "30px 20px",
          position: "relative",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <p
            style={{
              fontSize: "16px",
              color: "#333",
              marginBottom: "8px",
              fontWeight: "500",
              lineHeight: "1.6",
            }}
          >
            "운명의 상대를 내 편으로 만드는 방법"
          </p>
          <p
            style={{
              fontSize: "16px",
              color: "#333",
              fontWeight: "500",
              lineHeight: "1.6",
            }}
          >
            "경쟁 속에서도 관계를 지키는 법"
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              margin: "15px 0",
            }}
          >
            <span style={{ color: "#999", fontSize: "20px" }}>•</span>
            <span style={{ color: "#999", fontSize: "20px" }}>•</span>
            <span style={{ color: "#999", fontSize: "20px" }}>•</span>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "#FF4444",
              fontWeight: "700",
              marginBottom: "8px",
            }}
          >
            2026년 신년운세
          </p>
          <p
            style={{
              fontSize: "20px",
              color: "#333",
              fontWeight: "700",
            }}
          >
            리포트에서 공개됩니다
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              color: "#999",
              textDecoration: "line-through",
            }}
          >
            29,900원
          </span>
          <span style={{ fontSize: "16px", color: "#999" }}>→</span>
          <span
            style={{
              fontSize: "28px",
              color: "#4A90E2",
              fontWeight: "700",
            }}
          >
            9,900원
          </span>
        </div>

        <button
          style={{
            width: "100%",
            padding: "15px",
            background: "#4A90E2",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#3A7BC8";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#4A90E2";
          }}
        >
          구매하기
        </button>

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              background: "white",
              borderRadius: "15px",
              padding: "10px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Image
              src="/assets/images/tori-character.png"
              alt="토리 캐릭터"
              width={180}
              height={180}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "white",
          borderRadius: "20px",
          border: "2px solid #E8F4FD",
          padding: "25px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#333",
            marginBottom: "20px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#999" }}>⚙</span>
          목차 요약본
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {[
            "사주 팔자 요약본",
            "나의 재능 (십성)",
            "나의 인생패턴 (신살)",
            "나의 성격 팔자 유형",
            "내 인생의 대운과 세운",
            "나의 운세 총평",
            "사주 팔자 요약본",
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 0",
                borderBottom: index < 6 ? "1px solid #F5F5F5" : "none",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  background: "#4A90E2",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: "15px",
                  color: "#333",
                  flex: 1,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#FFF4F4",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "14px",
                color: "#FF4444",
                fontWeight: "600",
                marginRight: "10px",
              }}
            >
              얼리버드 혜택가
            </span>
            <span
              style={{
                background: "#FF4444",
                color: "white",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              67%
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                color: "#999",
                textDecoration: "line-through",
              }}
            >
              29,900원
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "#4A90E2",
                fontWeight: "700",
              }}
            >
              9,900원
            </span>
          </div>
        </div>

        <button
          style={{
            width: "100%",
            padding: "15px",
            background: "#4A90E2",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "20px",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#3A7BC8";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#4A90E2";
          }}
        >
          구매하기
        </button>
      </div>
    </div>
  );
}