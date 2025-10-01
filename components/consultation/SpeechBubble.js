"use client";

import React from 'react';

const SpeechBubble = ({
  text,
  position = { top: '20%', left: '30%' },
  size = 'medium',
  direction = 'bottom-left',
  textColor = '#000',
  backgroundColor = '#ffffff',
  borderColor = '#333',
  maxWidth = '300px'
}) => {
  // 말풍선 크기 설정 - 600px까지만 반응형, 이후 고정 크기
  const getSizeStyles = (size) => {
    const sizes = {
      small: {
        fontSize: 'min(20px, max(14px, 2.5vw))',
        padding: 'min(16px, max(12px, 2vw)) min(24px, max(18px, 3vw))',
        borderRadius: '50%'
      },
      medium: {
        fontSize: 'min(24px, max(16px, 3vw))',
        padding: 'min(20px, max(16px, 2.5vw)) min(32px, max(24px, 4vw))',
        borderRadius: '50%'
      },
      large: {
        fontSize: 'min(24px, max(18px, 3.5vw))',
        padding: 'min(24px, max(18px, 3vw)) min(40px, max(30px, 5vw))',
        borderRadius: '50%'
      }
    };
    return sizes[size] || sizes.medium;
  };

  // 말풍선 꼬리 방향 설정
  const getTailStyles = (direction) => {
    const tailSize = '10px';
    const tailStyles = {
      'bottom-left': {
        content: '""',
        position: 'absolute',
        bottom: `-${tailSize}`,
        left: '20px',
        width: 0,
        height: 0,
        borderLeft: `${tailSize} solid transparent`,
        borderRight: `${tailSize} solid transparent`,
        borderTop: `${tailSize} solid ${borderColor}`,
      },
      'bottom-right': {
        content: '""',
        position: 'absolute',
        bottom: `-${tailSize}`,
        right: '20px',
        width: 0,
        height: 0,
        borderLeft: `${tailSize} solid transparent`,
        borderRight: `${tailSize} solid transparent`,
        borderTop: `${tailSize} solid ${borderColor}`,
      },
      'top-left': {
        content: '""',
        position: 'absolute',
        top: `-${tailSize}`,
        left: '20px',
        width: 0,
        height: 0,
        borderLeft: `${tailSize} solid transparent`,
        borderRight: `${tailSize} solid transparent`,
        borderBottom: `${tailSize} solid ${borderColor}`,
      },
      'top-right': {
        content: '""',
        position: 'absolute',
        top: `-${tailSize}`,
        right: '20px',
        width: 0,
        height: 0,
        borderLeft: `${tailSize} solid transparent`,
        borderRight: `${tailSize} solid transparent`,
        borderBottom: `${tailSize} solid ${borderColor}`,
      },
      'left': {
        content: '""',
        position: 'absolute',
        left: `-${tailSize}`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: `${tailSize} solid transparent`,
        borderBottom: `${tailSize} solid transparent`,
        borderRight: `${tailSize} solid ${borderColor}`,
      },
      'right': {
        content: '""',
        position: 'absolute',
        right: `-${tailSize}`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: `${tailSize} solid transparent`,
        borderBottom: `${tailSize} solid transparent`,
        borderLeft: `${tailSize} solid ${borderColor}`,
      }
    };
    return tailStyles[direction] || tailStyles['bottom-left'];
  };

  const sizeStyles = getSizeStyles(size);
  const bubbleId = `bubble-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <>
      <style jsx>{`
        #${bubbleId}::after {
          ${Object.entries(getTailStyles(direction))
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ')}
        }
      `}</style>
      <div
        id={bubbleId}
        style={{
          position: 'absolute',
          top: position.top,
          ...(position.left && { left: position.left }),
          ...(position.right && { right: position.right }),
          transform: position.right ? 'translate(50%, -50%)' : 'translate(-50%, -50%)',
          minWidth: 'min(200px, max(150px, 25vw))',
          maxWidth: `min(${maxWidth}, max(250px, 40vw))`,
          backgroundColor: backgroundColor,
          color: textColor,
          border: `min(3px, max(2px, 0.3vw)) solid ${borderColor}`,
          borderRadius: '50%',
          padding: sizeStyles.padding,
          fontSize: sizeStyles.fontSize,
          fontWeight: '600',
          lineHeight: '1.4',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '1.5 / 1'
        }}
      >
        {text}
      </div>
    </>
  );
};

export default SpeechBubble;