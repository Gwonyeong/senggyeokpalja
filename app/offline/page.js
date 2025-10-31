'use client';

import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#FCA311',
      fontFamily: '"Noto Serif KR", serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '400px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          🌙
        </div>

        <h1 style={{
          fontSize: '24px',
          marginBottom: '16px',
          color: '#d4af37'
        }}>
          인터넷 연결이 끊어졌습니다
        </h1>

        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '32px',
          opacity: 0.8
        }}>
          토리가 잠시 명상에 빠져있어요.<br />
          네트워크 연결을 확인하고 다시 시도해주세요.
        </p>

        {isOnline && (
          <div style={{
            padding: '8px 16px',
            background: '#4CAF50',
            color: '#fff',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            인터넷에 다시 연결되었습니다!
          </div>
        )}

        <button
          onClick={handleRetry}
          style={{
            background: '#FCA311',
            color: '#0a0a0a',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#d4af37';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#FCA311';
          }}
        >
          다시 시도하기
        </button>

        <div style={{
          marginTop: '32px',
          fontSize: '14px',
          opacity: 0.6
        }}>
          오프라인 상태에서도 성격팔자 앱을 사용할 수 있습니다
        </div>
      </div>
    </div>
  );
}