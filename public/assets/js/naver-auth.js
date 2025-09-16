// 네이버 로그인 SDK 초기화 및 관리
(function() {
    'use strict';
    
    // 네이버 로그인 설정 (실제 키로 교체 필요)
    const NAVER_CLIENT_ID = 'bcUnF1e92Q6G7LWVxXBe'; // 네이버 개발자센터에서 발급받은 Client ID
    const NAVER_CALLBACK_URL = window.location.origin + '/auth/naver/callback.html'; // 콜백 URL
    
    // 네이버 로그인 객체 초기화
    let naverLogin;
    
    function initNaverSDK() {
        console.log('네이버 SDK 초기화 시도 중...');
        console.log('naver 객체 존재:', typeof naver !== 'undefined');
        console.log('LoginWithNaverId 존재:', typeof naver !== 'undefined' && naver.LoginWithNaverId);
        
        if (typeof naver !== 'undefined' && naver.LoginWithNaverId) {
            try {
                naverLogin = new naver.LoginWithNaverId({
                    clientId: NAVER_CLIENT_ID,
                    callbackUrl: NAVER_CALLBACK_URL,
                    isPopup: false, // 팝업 대신 리다이렉트 방식 사용
                    callbackHandle: true
                    // loginButton 설정 제거 - 직접 버튼을 만들어 사용
                });
                
                // state 매개변수를 포함하도록 설정
                naverLogin.getLoginStatus = function(callback) {
                    // 기본 getLoginStatus 오버라이드
                    if (callback) callback(false);
                };
                
                // init() 호출하지 않음 - 버튼 자동 생성 방지
                console.log('네이버 SDK 객체 생성 완료');
                console.log('Client ID:', NAVER_CLIENT_ID);
                console.log('Callback URL:', NAVER_CALLBACK_URL);
                
                // 전역 변수에 초기화 상태 저장
                window.naverSDKReady = true;
                
                // 네이버 SDK 준비 완료 이벤트 발생
                window.dispatchEvent(new CustomEvent('naverSDKReady'));
                
            } catch (error) {
                console.error('네이버 SDK 초기화 오류:', error);
                window.naverSDKReady = false;
            }
            
        } else {
            console.error('네이버 SDK가 로드되지 않았습니다.');
            console.log('현재 naver 객체:', typeof naver !== 'undefined' ? naver : 'undefined');
            console.log('스크립트 태그 확인:', document.querySelector('script[src*="naveridlogin"]'));
            window.naverSDKReady = false;
            
            // 재시도 횟수 제한
            if (!window.naverRetryCount) {
                window.naverRetryCount = 0;
            }
            
            if (window.naverRetryCount < 3) {
                window.naverRetryCount++;
                console.log(`네이버 SDK 재시도 ${window.naverRetryCount}/3`);
                setTimeout(() => {
                    initNaverSDK();
                }, 1000);
            } else {
                console.error('네이버 SDK 로딩 최종 실패');
            }
        }
    }
    
    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNaverSDK);
    } else {
        initNaverSDK();
    }
    
    // 네이버 로그인 함수
    window.naverLogin = function() {
        return new Promise((resolve, reject) => {
            console.log('네이버 로그인 함수 호출됨');
            console.log('naverLogin 객체:', naverLogin);
            console.log('naverSDKReady:', window.naverSDKReady);
            
            if (!naverLogin) {
                console.error('네이버 SDK가 초기화되지 않았습니다.');
                reject(new Error('네이버 SDK가 초기화되지 않았습니다.'));
                return;
            }
            
            try {
                // CSRF 보안을 위한 state 매개변수 생성
                const state = generateRandomState();
                sessionStorage.setItem('naverOAuthState', state);
                
                // 네이버 로그인 실행 (리다이렉트 방식)
                console.log('네이버 로그인 authorize 호출, state:', state);
                naverLogin.authorize();
                
                // 리다이렉트 방식이므로 여기서는 resolve하지 않음
                // 콜백 페이지에서 처리됨
                
            } catch (error) {
                console.error('네이버 로그인 실행 오류:', error);
                reject(error);
            }
        });
    };
    
    // 네이버 로그아웃 함수
    window.naverLogout = function() {
        return new Promise((resolve) => {
            if (naverLogin) {
                naverLogin.logout();
            }
            resolve();
        });
    };
    
    // 네이버-Firebase 연동 함수
    window.linkNaverWithFirebase = async function(naverResult) {
        try {
            const naverUser = naverResult.user;
            const customUID = `naver_${naverUser.id}`;
            
            // Firestore에 네이버 사용자 정보 저장
            const userRef = db.collection('users').doc(customUID);
            const userDoc = await userRef.get();
            
            const userData = {
                uid: customUID,
                naverId: naverUser.id,
                email: naverUser.email || '',
                displayName: naverUser.name || naverUser.nickname || '',
                photoURL: naverUser.profile_image || '',
                provider: 'naver',
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (!userDoc.exists) {
                // 새 사용자 생성
                userData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                userData.signupMethod = 'social';
                await userRef.set(userData);
                console.log('새 네이버 사용자 생성 완료');
            } else {
                // 기존 사용자 업데이트
                await userRef.update({
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    displayName: userData.displayName,
                    photoURL: userData.photoURL
                });
                console.log('기존 네이버 사용자 정보 업데이트 완료');
            }
            
            // 로컬스토리지에 네이버 로그인 상태 저장
            localStorage.setItem('naverLoggedIn', 'true');
            localStorage.setItem('naverUserInfo', JSON.stringify(userData));
            
            // 커스텀 이벤트 발생 (UI 업데이트용)
            window.dispatchEvent(new CustomEvent('naverAuthStateChanged', {
                detail: { user: userData, isLoggedIn: true }
            }));
            
            return userData;
            
        } catch (error) {
            console.error('네이버-Firebase 연동 오류:', error);
            throw error;
        }
    };
    
    // 네이버 로그인 상태 확인
    window.checkNaverLoginStatus = function() {
        const isLoggedIn = localStorage.getItem('naverLoggedIn') === 'true';
        const userInfo = localStorage.getItem('naverUserInfo');
        
        return {
            isLoggedIn: isLoggedIn,
            userInfo: userInfo ? JSON.parse(userInfo) : null
        };
    };
    
    // 랜덤 state 생성 함수 (CSRF 보안)
    function generateRandomState() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // 네이버 로그아웃 처리
    window.handleNaverLogout = async function() {
        try {
            // 네이버 로그아웃
            await window.naverLogout();
            
            // 로컬스토리지 정리
            localStorage.removeItem('naverLoggedIn');
            localStorage.removeItem('naverUserInfo');
            
            // 세션스토리지 정리
            sessionStorage.removeItem('naverOAuthState');
            
            // 커스텀 이벤트 발생
            window.dispatchEvent(new CustomEvent('naverAuthStateChanged', {
                detail: { user: null, isLoggedIn: false }
            }));
            
            console.log('네이버 로그아웃 완료');
            
        } catch (error) {
            console.error('네이버 로그아웃 오류:', error);
        }
    };
    
})();
