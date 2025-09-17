"use client";

import { useState, useEffect } from 'react';
import { signInWithGoogle, signOutUser } from '../../lib/firebase-config';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);

    // 모달 외부 클릭 시 닫기 및 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            // 모달이 열릴 때 body 스크롤 방지
            document.body.style.overflow = 'hidden';
        } else {
            // 모달이 닫힐 때 body 스크롤 복원
            document.body.style.overflow = 'unset';
        }

        // 컴포넌트 언마운트 시 스크롤 복원
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            // 카카오톡 인앱 브라우저 감지
            const userAgent = navigator.userAgent;
            const isKakaoInApp = userAgent.includes('KAKAOTALK');

            if (isKakaoInApp) {
                alert('카카오톡에서는 구글 로그인이 제한됩니다.\n우측 하단의 "공유하기" 버튼을 눌러 "다른 웹에서 열기"를 선택해주세요.');
                setLoading(false);
                return;
            }

            const user = await signInWithGoogle();
            console.log('로그인 성공:', user);
            onClose();
        } catch (error) {
            console.error('로그인 실패:', error);
            alert(error.message || '로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = async () => {
        // Kakao SDK 초기화 확인
        if (!window.Kakao) {
            // 카카오 SDK 동적 로드
            const script = document.createElement('script');
            script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
            script.async = true;
            script.onload = () => {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || 'b45b4fdc1ea68a9b370ef6e80abc9414');
                performKakaoLogin();
            };
            document.body.appendChild(script);
        } else {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || 'b45b4fdc1ea68a9b370ef6e80abc9414');
            }
            performKakaoLogin();
        }
    };

    const performKakaoLogin = () => {
        window.Kakao.Auth.login({
            success: function(authObj) {
                console.log('카카오 로그인 성공:', authObj);

                // 사용자 정보 가져오기
                window.Kakao.API.request({
                    url: '/v2/user/me',
                    success: function(response) {
                        console.log('카카오 사용자 정보:', response);
                        // 로그인 성공 처리
                        onClose();
                    },
                    fail: function(error) {
                        console.error('카카오 사용자 정보 가져오기 실패:', error);
                    }
                });
            },
            fail: function(err) {
                console.error('카카오 로그인 실패:', err);
                alert('카카오 로그인에 실패했습니다.');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="login-modal" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="login-modal-overlay" onClick={onClose}></div>
            <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="login-modal-header">
                    <h3 className="login-modal-title">이야기의 시작</h3>
                    <button className="login-modal-close" onClick={onClose} aria-label="모달 닫기">&times;</button>
                </div>
                <div className="login-modal-body">
                    <p className="login-modal-subtitle">가장 편한 이름으로 그대의 여정을 기록하게.</p>
                    <div className="login-buttons">
                        <button
                            className="login-btn google-login-btn"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <div className="login-btn-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </div>
                            <span className="login-btn-text">
                                {loading ? '로그인 중...' : '구글로 로그인/가입'}
                            </span>
                        </button>

                        <button className="login-btn kakao-login-btn" onClick={handleKakaoLogin}>
                            <div className="login-btn-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#000000" d="M12 3C7.03 3 3 6.14 3 10.1c0 2.52 1.65 4.73 4.1 6.09l-.95 3.48c-.09.33.25.59.55.42l4.28-2.69c.34.03.68.04 1.02.04 4.97 0 9-3.14 9-7.1S16.97 3 12 3z"/>
                                </svg>
                            </div>
                            <span className="login-btn-text">카카오로 로그인/가입</span>
                        </button>

                        <button className="login-btn naver-login-btn disabled" disabled>
                            <div className="login-btn-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#03C75A" d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
                                </svg>
                            </div>
                            <span className="login-btn-text">네이버로 로그인/가입 (준비중)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}