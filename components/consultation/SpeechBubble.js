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
  // 말풍선 크기 설정 - 고정 크기
  const getSizeStyles = (size) => {
    const sizes = {
      small: {
        fontSize: '14px',
        padding: '12px 18px',
        borderRadius: '50%'
      },
      medium: {
        fontSize: '16px',
        padding: '16px 24px',
        borderRadius: '50%'
      },
      large: {
        fontSize: '18px',
        padding: '18px 30px',
        borderRadius: '50%'
      },
      extraLarge: {
        fontSize: '20px',
        padding: '24px 48px',
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
          ...(size === 'extraLarge' ? {
            left: '5%',
            right: '5%',
            transform: 'translateY(-50%)',
            width: '90%'
          } : {
            ...(position.left && { left: position.left }),
            ...(position.right && { right: position.right }),
            transform: position.right ? 'translate(50%, -50%)' : 'translate(-50%, -50%)',
          }),
          minWidth: size === 'extraLarge' ? 'auto' : '150px',
          maxWidth: size === 'extraLarge' ? 'none' : maxWidth,
          backgroundColor: backgroundColor,
          color: textColor,
          border: `2px solid ${borderColor}`,
          borderRadius: sizeStyles.borderRadius,
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
          aspectRatio: size === 'extraLarge' ? 'auto' : '1.5 / 1'
        }}
      >
        {text}
      </div>
    </>
  );
};

export default SpeechBubble;