"use client";

import { useState, useEffect } from "react";

export default function DiscountTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 할인 마감 시간 계산 (현재 시간부터 24시간 후)
    const getDiscountEndTime = () => {
      const now = new Date();
      const endTime = new Date(now);
      endTime.setHours(23, 59, 59, 999); // 오늘 23:59:59까지

      // 만약 현재 시간이 23시 이후라면 다음날 23:59:59로 설정
      if (now.getHours() >= 23) {
        endTime.setDate(endTime.getDate() + 1);
      }

      return endTime;
    };

    const calculateTimeLeft = () => {
      const endTime = getDiscountEndTime();
      const now = new Date();
      const difference = endTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
      } else {
        // 시간이 만료되면 다시 24시간으로 리셋
        return { hours: 23, minutes: 59, seconds: 59 };
      }
    };

    // 초기 시간 설정
    setTimeLeft(calculateTimeLeft());

    // 1초마다 업데이트
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => {
    return time.toString().padStart(2, "0");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "rgba(239, 68, 68, 0.15)",
        borderRadius: "8px",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        marginTop: "10px",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "#ef4444",
          fontWeight: "600",
        }}
      >
        할인 마감까지
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <div
          style={{
            background: "#ef4444",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "700",
            minWidth: "24px",
            textAlign: "center",
          }}
        >
          {formatTime(timeLeft.hours)}
        </div>
        <span
          style={{
            color: "#ef4444",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          :
        </span>
        <div
          style={{
            background: "#ef4444",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "700",
            minWidth: "24px",
            textAlign: "center",
          }}
        >
          {formatTime(timeLeft.minutes)}
        </div>
        <span
          style={{
            color: "#ef4444",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          :
        </span>
        <div
          style={{
            background: "#ef4444",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "700",
            minWidth: "24px",
            textAlign: "center",
          }}
        >
          {formatTime(timeLeft.seconds)}
        </div>
      </div>
    </div>
  );
}