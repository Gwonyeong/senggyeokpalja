"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function MainToonSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const totalImages = 7; // 0.png to 6.png
  const minSwipeDistance = 50; // minimum swipe distance in pixels

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalImages - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === totalImages - 1 ? 0 : prevIndex + 1
    );
  };

  const onTouchStart = (e) => {
    setTouchEnd(0); // reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <section className="toon-slider-section">
      <div className="container">
        <h2 className="text-[24px] text-[#FCA311] text-center">
          MBTI와 사주 왜 같이 봐야할까?
        </h2>
        <div className="flex flex-col items-center  mb-[20px] mt-[12px]">
          <div className="w-full max-w-xs h-[1px] bg-[#FCA311]" />
        </div>

        <div className="toon-slider-container">
          <div
            className="slider-viewport"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              className="slider-arrow slider-arrow-left"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className="slider-arrow slider-arrow-right"
              onClick={goToNext}
              aria-label="Next image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div
              className="slider-track"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {[...Array(totalImages)].map((_, index) => (
                <div key={index} className="slider-slide">
                  <Image
                    src={`/assets/images/main_insta_toon/${index}.png`}
                    alt={`토리의 이야기 ${index + 1}`}
                    width={800}
                    height={800}
                    priority={index === 0}
                    className="toon-image"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="info-box " style={{ border: "1px solid #FCA311" }}>
          <p className="info-text ">
            최고의 선장이라도, <br />
            자신의 배를 모르면 보물섬에 닿을 수 없습니다. <br />{" "}
            &apos;성격팔자&apos;와 함께 하세요.
          </p>
        </div>
      </div>
    </section>
  );
}
