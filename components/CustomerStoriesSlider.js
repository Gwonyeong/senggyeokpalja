"use client";

import { useState, useRef } from "react";

export default function CustomerStoriesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const totalImages = 4; // 1.png to 4.png
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
    <div className="customer-stories-container">
      <div
        className="stories-slider-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button
          className="slider-arrow slider-arrow-left"
          onClick={goToPrevious}
          aria-label="Previous story"
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
          aria-label="Next story"
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
          className="stories-slider-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {[...Array(totalImages)].map((_, index) => (
            <div key={index} className="story-slide">
              <img
                src={`/assets/images/main_review/${index + 1}.png`}
                alt={`고객 후기 ${index + 1}`}
                className="story-image"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}