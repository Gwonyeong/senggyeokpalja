// 카카오 로그인 SDK 초기화 및 관리
(function() {
    'use strict';
    
    // 카카오 JavaScript 키 (실제 키로 교체 필요)
    const KAKAO_JS_KEY = 'b45b4fdc1ea68a9b370ef6e80abc9414';
    
    // 카카오 SDK 초기화
    function initKakaoSDK() {
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            console.log('카카오 SDK가 이미 초기화되었습니다.');
            return;
        }
        
        if (typeof Kakao !== 'undefined') {
            try {
                Kakao.init(KAKAO_JS_KEY);
                console.log('카카오 SDK 초기화 완료:', Kakao.isInitialized());
                
                // 전역 변수에 초기화 상태 저장
                window.kakaoSDKReady = true;
                
                // 카카오 SDK 준비 완료 이벤트 발생
                window.dispatchEvent(new CustomEvent('kakaoSDKReady'));
                
            } catch (error) {
                console.error('카카오 SDK 초기화 실패:', error);
                window.kakaoSDKReady = false;
            }
        } else {
            console.error('카카오 SDK가 로드되지 않았습니다.');
            window.kakaoSDKReady = false;
            
            // 재시도 로직 추가
            setTimeout(() => {
                console.log('카카오 SDK 재시도 중...');
                initKakaoSDK();
            }, 1000);
        }
    }
    
    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKakaoSDK);
    } else {
        initKakaoSDK();
    }
    
    // 카카오 로그인 함수
    window.kakaoLogin = function() {
        return new Promise((resolve, reject) => {
            if (!window.Kakao || !window.Kakao.isInitialized()) {
                reject(new Error('카카오 SDK가 초기화되지 않았습니다.'));
                return;
            }
            
            window.Kakao.Auth.login({
                success: function(authObj) {
                    console.log('카카오 로그인 성공:', authObj);
                    
                    // 사용자 정보 가져오기
                    window.Kakao.API.request({
                        url: '/v2/user/me',
                        success: async function(response) {
                            console.log('카카오 사용자 정보:', response);
                            
                            // 자동으로 사용자 계정 생성 또는 업데이트
                            console.log('Kakao 로그인 성공:', response.kakao_account?.email || response.id);
                            
                            try {
                                // Firebase와 카카오 연동 처리
                                await window.linkKakaoWithFirebase({
                                    authObj: authObj,
                                    userInfo: response
                                });
                                
                                // 로그인 모달 닫기
                                const loginModal = document.getElementById('login-modal');
                                if (loginModal) {
                                    loginModal.style.display = 'none';
                                }
                                
                                resolve({
                                    authObj: authObj,
                                    userInfo: response
                                });
                            } catch (error) {
                                console.error('카카오 로그인 처리 오류:', error);
                                await window.kakaoLogout();
                                reject(error);
                            }
                        },
                        fail: function(error) {
                            console.error('카카오 사용자 정보 가져오기 실패:', error);
                            reject(error);
                        }
                    });
                },
                fail: function(err) {
                    console.error('카카오 로그인 실패:', err);
                    reject(err);
                }
            });
        });
    };
    
    // 카카오 로그아웃 함수
    window.kakaoLogout = function() {
        return new Promise((resolve, reject) => {
            if (!window.Kakao || !window.Kakao.isInitialized()) {
                reject(new Error('카카오 SDK가 초기화되지 않았습니다.'));
                return;
            }
            
            window.Kakao.Auth.logout(function() {
                console.log('카카오 로그아웃 완료');
                resolve();
            });
        });
    };
    
    // 카카오 연결 해제 함수
    window.kakaoUnlink = function() {
        return new Promise((resolve, reject) => {
            if (!window.Kakao || !window.Kakao.isInitialized()) {
                reject(new Error('카카오 SDK가 초기화되지 않았습니다.'));
                return;
            }
            
            window.Kakao.API.request({
                url: '/v1/user/unlink',
                success: function(response) {
                    console.log('카카오 연결 해제 완료:', response);
                    resolve(response);
                },
                fail: function(error) {
                    console.error('카카오 연결 해제 실패:', error);
                    reject(error);
                }
            });
        });
    };
    
    // Firebase와 카카오 연동 함수
    window.linkKakaoWithFirebase = async function(kakaoUserInfo) {
        try {
            const auth = window.firebaseAuth;
            const db = window.firebaseDb;
            
            if (!auth || !db) {
                throw new Error('Firebase가 초기화되지 않았습니다.');
            }
            
            // 카카오 사용자 정보로 Firebase 사용자 생성/업데이트
            const kakaoUser = kakaoUserInfo.userInfo;
            const customUID = 'kakao_' + kakaoUser.id;
            
            // Firestore에 카카오 사용자 정보 저장
            const userRef = db.collection('users').doc(customUID);
            const userDoc = await userRef.get();
            
            const userData = {
                uid: customUID,
                kakaoId: kakaoUser.id,
                email: kakaoUser.kakao_account?.email || '',
                displayName: kakaoUser.properties?.nickname || '',
                photoURL: kakaoUser.properties?.profile_image || '',
                provider: 'kakao',
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (!userDoc.exists) {
                // 새 사용자 생성
                userData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                userData.signupMethod = 'social';
                await userRef.set(userData);
                console.log('새 카카오 사용자 생성 완료');
            } else {
                // 기존 사용자 업데이트
                await userRef.update({
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    displayName: userData.displayName,
                    photoURL: userData.photoURL
                });
                console.log('기존 카카오 사용자 정보 업데이트 완료');
            }
            
            // 로컬스토리지에 카카오 로그인 상태 저장
            localStorage.setItem('kakaoLoggedIn', 'true');
            localStorage.setItem('kakaoUserInfo', JSON.stringify(userData));
            
            // 커스텀 이벤트 발생 (UI 업데이트용)
            window.dispatchEvent(new CustomEvent('kakaoAuthStateChanged', {
                detail: { user: userData, isLoggedIn: true }
            }));
            
            return userData;
            
        } catch (error) {
            console.error('카카오-Firebase 연동 오류:', error);
            throw error;
        }
    };
    
    // 카카오 로그인 상태 확인
    window.checkKakaoLoginStatus = function() {
        const isLoggedIn = localStorage.getItem('kakaoLoggedIn') === 'true';
        const userInfo = localStorage.getItem('kakaoUserInfo');
        
        return {
            isLoggedIn: isLoggedIn,
            userInfo: userInfo ? JSON.parse(userInfo) : null
        };
    };
    
    // 카카오 로그아웃 처리
    window.handleKakaoLogout = async function() {
        try {
            // 카카오 로그아웃
            await window.kakaoLogout();
            
            // 로컬스토리지 정리
            localStorage.removeItem('kakaoLoggedIn');
            localStorage.removeItem('kakaoUserInfo');
            
            // 커스텀 이벤트 발생
            window.dispatchEvent(new CustomEvent('kakaoAuthStateChanged', {
                detail: { user: null, isLoggedIn: false }
            }));
            
            console.log('카카오 로그아웃 처리 완료');
            
        } catch (error) {
            console.error('카카오 로그아웃 처리 오류:', error);
            throw error;
        }
    };
    
})();

// 페이지 로드 시 카카오 로그인 상태 확인
document.addEventListener('DOMContentLoaded', function() {
    // 카카오 로그인 상태 확인 및 UI 업데이트
    const kakaoStatus = window.checkKakaoLoginStatus();
    
    if (kakaoStatus.isLoggedIn && kakaoStatus.userInfo) {
        // 카카오 로그인 상태일 때 UI 업데이트
        updateUIForKakaoUser(kakaoStatus.userInfo);
    }
    
    // 카카오 인증 상태 변경 이벤트 리스너
    window.addEventListener('kakaoAuthStateChanged', function(event) {
        const { user, isLoggedIn } = event.detail;
        
        if (isLoggedIn && user) {
            updateUIForKakaoUser(user);
        } else {
            updateUIForLoggedOutUser();
        }
    });
});

// 카카오 사용자용 UI 업데이트
function updateUIForKakaoUser(user) {
    // 로그인 버튼 숨기기
    const loginBtns = document.querySelectorAll('#loginBtn, #mobileLoginBtn');
    loginBtns.forEach(btn => {
        if (btn) btn.style.display = 'none';
    });
    
    // 마이페이지 링크 표시
    const myPageLinks = document.querySelectorAll('#myPageLink, #mobileMyPageLink');
    myPageLinks.forEach(link => {
        if (link) {
            link.style.display = 'inline-block';
            link.textContent = user.displayName || '마이페이지';
        }
    });
    
    // 로그아웃 버튼 표시
    const logoutBtns = document.querySelectorAll('#logoutBtn, #mobileLogoutBtn');
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.style.display = 'inline-block';
            btn.onclick = async function() {
                try {
                    await window.handleKakaoLogout();
                    if (window.showNotification) {
                        window.showNotification('로그아웃되었습니다.', 'success');
                    }
                } catch (error) {
                    console.error('로그아웃 오류:', error);
                    if (window.showNotification) {
                        window.showNotification('로그아웃에 실패했습니다.', 'error');
                    }
                }
            };
        }
    });
}

// 로그아웃 상태용 UI 업데이트
function updateUIForLoggedOutUser() {
    // 로그인 버튼 표시
    const loginBtns = document.querySelectorAll('#loginBtn, #mobileLoginBtn');
    loginBtns.forEach(btn => {
        if (btn) btn.style.display = 'block';
    });
    
    // 마이페이지 링크 숨기기
    const myPageLinks = document.querySelectorAll('#myPageLink, #mobileMyPageLink');
    myPageLinks.forEach(link => {
        if (link) link.style.display = 'none';
    });
    
    // 로그아웃 버튼 숨기기
    const logoutBtns = document.querySelectorAll('#logoutBtn, #mobileLogoutBtn');
    logoutBtns.forEach(btn => {
        if (btn) btn.style.display = 'none';
    });
}
