"use client";

import React from 'react';

const SpeechBubble = ({
  text,
  position = { top: '20%', left: '30%' },
  type = 'normal',
  size = 'medium',
  direction = 'bottom-left',
  textColor = '#000',
  backgroundColor = '#ffffff',
  borderColor = '#333',
  maxWidth = '300px'
}) => {
  // 말풍선 크기 설정
  const getSizeStyles = (size) => {
    const sizes = {
      small: { fontSize: '12px', padding: '8px 12px', borderRadius: '8px' },
      medium: { fontSize: '14px', padding: '12px 16px', borderRadius: '10px' },
      large: { fontSize: '16px', padding: '16px 20px', borderRadius: '12px' }
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
  const bubbleId = `bubble-${Math.random().toString(36).substr(2, 9)}`;

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
          left: position.left,
          maxWidth: maxWidth,
          backgroundColor: backgroundColor,
          color: textColor,
          border: `2px solid ${borderColor}`,
          borderRadius: sizeStyles.borderRadius,
          padding: sizeStyles.padding,
          fontSize: sizeStyles.fontSize,
          fontWeight: '500',
          lineHeight: '1.4',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      >
        {text}
      </div>
    </>
  );
};

export default SpeechBubble;