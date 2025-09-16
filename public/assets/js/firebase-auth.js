// Firebase 인스턴스는 전역 변수에서 가져옴
const auth = window.firebaseAuth;
const db = window.firebaseDb;

// ===================================================================
// Firebase Config is now in firebase-config.js
// ===================================================================

// 전역 상태 관리
window.authState = {
    isLoginInProgress: false,
    lastLoginAttempt: 0,
    cooldownPeriod: 3000, // 3초 쿨다운
    pendingPromises: new Set() // 진행 중인 Promise 추적
};

// 구글 로그인 제공업체 설정 (중복 제거됨)

// 로그인 상태 감시 및 헤더 UI 업데이트
auth.onAuthStateChanged(user => {
    // 카카오 로그인 상태도 함께 확인
    const kakaoStatus = window.checkKakaoLoginStatus ? window.checkKakaoLoginStatus() : { isLoggedIn: false };
    const isAnyUserLoggedIn = user || kakaoStatus.isLoggedIn;
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const myPageLink = document.getElementById('myPageLink');
    
    // 모바일 메뉴 요소들
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileMyPageLink = document.getElementById('mobileMyPageLink');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    if (isAnyUserLoggedIn) {
        // 이메일 인증 확인
        if (user && !user.emailVerified) {
            // 이메일 미인증 사용자는 로그아웃
            auth.signOut();
            alert('이메일 인증이 필요합니다.\n이메일을 확인하고 인증을 완료해주세요.');
            return;
        }
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (myPageLink) {
            myPageLink.style.display = 'inline-block';
            // 사용자 이름 표시
            const displayName = user?.displayName || kakaoStatus.userInfo?.displayName || '마이페이지';
            myPageLink.textContent = displayName;
        }
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        // 모바일 UI 업데이트
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
        if (mobileMyPageLink) {
            mobileMyPageLink.style.display = 'inline-block';
            const displayName = user?.displayName || kakaoStatus.userInfo?.displayName || '마이페이지';
            mobileMyPageLink.textContent = displayName;
        }
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'inline-block';
    } else {
        // 로그아웃 상태일 때
        if (loginBtn) loginBtn.style.display = 'block';
        if (myPageLink) myPageLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // 모바일 메뉴 업데이트
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
        if (mobileMyPageLink) mobileMyPageLink.style.display = 'none';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
    }
    toggleAdminButton(user);
});

// 관리자 권한 확인 - 환경변수에서 로드
const ADMIN_USERS = window.ADMIN_EMAILS || [
    'jaehxxn7@naver.com',
    'tnalsqkr1234@gmail.com',
    'regend0726@gmail.com'
];

function checkAdminAccess(user) {
    if (!user || !user.email) return false;
    return ADMIN_USERS.includes(user.email.toLowerCase());
}

// 관리자 페이지 접근 버튼 표시/숨김
function toggleAdminButton(user) {
    const adminButton = document.querySelector('.admin-only');
    if (!adminButton) return;
    
    if (checkAdminAccess(user)) {
        adminButton.style.display = 'inline-block';
        adminButton.onclick = function(e) {
            e.preventDefault();
            showAdminPasswordModal();
        };
    } else {
        adminButton.style.display = 'none';
    }
}

// 관리자 비밀번호 확인 모달
function showAdminPasswordModal() {
    const modalHTML = `
        <div id="admin-password-modal" class="modal" style="display: flex; z-index: 10000;">
            <div class="modal-content" style="max-width: 400px; background: var(--card-bg-color); border: 1px solid var(--border-color);">
                <div class="modal-header">
                    <h3 style="color: var(--starlight-orange); margin-bottom: 10px;">🔐 관리자 인증</h3>
                    <p style="color: var(--text-muted-color); font-size: 14px;">관리자 페이지 접근을 위해 비밀번호를 입력하세요.</p>
                </div>
                <form id="admin-auth-form" style="margin-bottom: 20px;">
                    <div class="input-group" style="margin-bottom: 20px;">
                        <label for="admin-password-input" style="display: block; margin-bottom: 8px; color: var(--text-color); font-weight: 600;">비밀번호</label>
                        <input type="password" id="admin-password-input" placeholder="관리자 비밀번호를 입력하세요" 
                               style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; 
                                      background: rgba(0,0,0,0.2); color: var(--text-color); font-size: 16px;" required>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="closeAdminPasswordModal()" 
                                style="padding: 10px 20px; background: var(--charcoal-gray); color: var(--text-color); 
                                       border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;">
                            취소
                        </button>
                        <button type="submit" 
                                style="padding: 10px 20px; background: linear-gradient(135deg, var(--starlight-orange), var(--brass-gold)); 
                                       color: var(--ink-black); border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            확인
                        </button>
                    </div>
                </form>
                <div id="admin-auth-error" style="color: #FF6B6B; font-size: 14px; text-align: center; display: none;"></div>
            </div>
        </div>
    `;
    
    // 기존 모달 제거
    const existingModal = document.getElementById('admin-password-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 폼 이벤트 리스너
    document.getElementById('admin-auth-form').addEventListener('submit', handleAdminAuth);
    
    // 입력 필드에 포커스
    document.getElementById('admin-password-input').focus();
}

// 관리자 인증 처리
async function handleAdminAuth(event) {
    event.preventDefault();
    
    const password = document.getElementById('admin-password-input').value;
    const errorDiv = document.getElementById('admin-auth-error');
    
    // 하드코딩된 관리자 비밀번호로 직접 인증
    const ADMIN_PASSWORD = 'admin123';
    
    if (password === ADMIN_PASSWORD) {
        // 인증 성공
        sessionStorage.removeItem('adminToken');
        sessionStorage.setItem('adminToken', 'admin-authenticated-' + Date.now());
        closeAdminPasswordModal();
        window.location.href = 'admin-dashboard.html';
    } else {
        // 인증 실패
        errorDiv.textContent = '잘못된 비밀번호입니다.';
        errorDiv.style.display = 'block';
    }
}

// 관리자 비밀번호 모달 닫기
function closeAdminPasswordModal() {
    const modal = document.getElementById('admin-password-modal');
    if (modal) {
        modal.remove();
    }
}

// 전역 함수로 설정
window.closeAdminPasswordModal = closeAdminPasswordModal;


document.addEventListener('DOMContentLoaded', () => {
    // 로그인 모달 관련 요소들
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const loginModal = document.getElementById('login-modal');
    const closeBtn = document.querySelector('.close-btn');
    const kakaoLoginBtn = document.getElementById('kakaoLoginBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const naverLoginBtn = document.getElementById('naverLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    // 로그인 버튼 클릭 - 모달 열기 (데스크톱)
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
        });
    }

    // 로그인 버튼 클릭 - 모달 열기 (모바일)
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
            // 모바일 메뉴 닫기
            const mobileNav = document.getElementById('mobileNav');
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            if (mobileNav && mobileMenuToggle) {
                mobileNav.classList.remove('active');
                mobileMenuToggle.innerHTML = '☰';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // 모달 닫기 버튼
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    // 모달 외부 클릭시 닫기
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    // 구글 로그인 함수를 전역으로 노출
    window.googleLogin = async function() {
            // loginPromise를 try 블록 외부에서 선언
            let loginPromise;
            try {
                // 카카오톡 인앱 브라우저 감지
                const userAgent = navigator.userAgent;
                const isKakaoInApp = userAgent.includes('KAKAOTALK');
                
                if (isKakaoInApp) {
                    alert('카카오톡에서는 구글 로그인이 제한됩니다.\n우측 하단의 "공유하기" 버튼을 눌러 "다른 웹에서 열기"를 선택해주세요.');
                    return;
                }
                
                // 쿨다운 체크 및 진행 중인 로그인 확인
                const now = Date.now();
                if (window.authState.isLoginInProgress) {
                    console.log('로그인이 이미 진행 중입니다.');
                    return;
                }
                
                if (now - window.authState.lastLoginAttempt < window.authState.cooldownPeriod) {
                    console.log('로그인 쿨다운 중입니다. 잠시 후 다시 시도해주세요.');
                    return;
                }
                
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');
                
                loginPromise = auth.signInWithPopup(provider);
                window.authState.pendingPromises.add(loginPromise);
                
                const result = await loginPromise;
                
                console.log('구글 로그인 성공:', result.user.email);
                
                // 사용자 정보를 Firestore에 저장 (자동 생성)
                await saveUserToFirestore(result.user);
                
                // 모든 페이지의 로그인 모달 닫기
                const allLoginModals = document.querySelectorAll('#login-modal');
                allLoginModals.forEach(modal => {
                    if (modal) modal.style.display = 'none';
                });
                
                // 로그인 모달 닫기
                const loginModal = document.getElementById('login-modal');
                if (loginModal) {
                    loginModal.style.display = 'none';
                }
            } catch (error) {
                console.error('구글 로그인 실패:', error);
                
                // 에러 메시지 표시
                if (error.code === 'auth/popup-closed-by-user') {
                    console.log('사용자가 팝업을 닫았습니다.');
                } else if (error.code === 'auth/popup-blocked') {
                    alert('팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
                } else {
                    alert('로그인 중 오류가 발생했습니다: ' + error.message);
                }
            } finally {
                // 상태 초기화
                window.authState.isLoginInProgress = false;
                window.authState.lastLoginAttempt = Date.now();
                
                // Promise 정리
                if (loginPromise) {
                    window.authState.pendingPromises.delete(loginPromise);
                }
            }
    };

    // 구글 로그인 버튼 이벤트 리스너 추가
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', window.googleLogin);
    }

    // 카카오 로그인
    if (kakaoLoginBtn) {
        kakaoLoginBtn.addEventListener('click', async () => {
            try {
                // 카카오 SDK 준비 상태 확인 (재시도 로직 포함)
                if (!window.Kakao || !window.Kakao.isInitialized()) {
                    // 최대 3초 동안 SDK 로드 대기
                    let attempts = 0;
                    const maxAttempts = 6; // 0.5초 * 6 = 3초
                    
                    const waitForKakao = () => {
                        attempts++;
                        
                        if (window.Kakao && window.Kakao.isInitialized()) {
                            // SDK 준비 완료, 로그인 진행
                            performKakaoLogin();
                            return;
                        }
                        
                        if (attempts < maxAttempts) {
                            setTimeout(waitForKakao, 500);
                        } else {
                            if (window.showNotification) {
                                window.showNotification('카카오 로그인을 사용할 수 없습니다. 페이지를 새로고침해주세요.', 'error');
                            }
                        }
                    };
                    
                    waitForKakao();
                    return;
                }
                
                performKakaoLogin();
                
            } catch (error) {
                console.error('카카오 로그인 실패:', error);
                if (error.message && error.message.includes('popup')) {
                    if (window.showNotification) {
                        window.showNotification('카카오 로그인 창이 닫혔습니다.', 'info');
                    }
                } else {
                    if (window.showNotification) {
                        window.showNotification('카카오 로그인에 실패했습니다.', 'error');
                    }
                }
            }
        });
        
        // 실제 카카오 로그인 수행 함수
        async function performKakaoLogin() {
            try {
                const result = await window.kakaoLogin();
                const userData = await window.linkKakaoWithFirebase(result);
                
                console.log('카카오 로그인 성공:', userData);
                if (window.showNotification) {
                    window.showNotification('카카오 계정으로 로그인되었습니다!', 'success');
                }
                
                // 모든 페이지의 로그인 모달 닫기
                const allLoginModals = document.querySelectorAll('#login-modal');
                allLoginModals.forEach(modal => {
                    if (modal) modal.style.display = 'none';
                });
                
            } catch (error) {
                console.error('카카오 로그인 실패:', error);
                if (error.message && error.message.includes('popup')) {
                    if (window.showNotification) {
                        window.showNotification('카카오 로그인 창이 닫혔습니다.', 'info');
                    }
                } else {
                    if (window.showNotification) {
                        window.showNotification('카카오 로그인에 실패했습니다.', 'error');
                    }
                }
            }
        }
    }

    // 네이버 로그인 버튼 클릭
    if (naverLoginBtn) {
        console.log('네이버 로그인 버튼 요소 찾음:', naverLoginBtn);
        naverLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('네이버 로그인 버튼 클릭됨');
            
            // 버튼 비활성화 방지
            naverLoginBtn.style.pointerEvents = 'auto';
            naverLoginBtn.style.cursor = 'pointer';
            
            try {
                if (!window.naverSDKReady) {
                    console.log('네이버 SDK 준비 대기 중...');
                    let attempts = 0;
                    const maxAttempts = 6;
                    const waitForNaver = () => {
                        attempts++;
                        console.log(`네이버 SDK 대기 시도 ${attempts}/${maxAttempts}`);
                        if (window.naverSDKReady) {
                            performNaverLogin();
                            return;
                        }
                        if (attempts < maxAttempts) {
                            setTimeout(waitForNaver, 500);
                        } else {
                            console.error('네이버 SDK 로딩 타임아웃');
                            if (window.showNotification) {
                                window.showNotification('네이버 로그인을 사용할 수 없습니다. 페이지를 새로고침해주세요.', 'error');
                            } else {
                                alert('네이버 로그인을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
                            }
                        }
                    };
                    waitForNaver();
                    return;
                }
                performNaverLogin();
            } catch (error) {
                console.error('네이버 로그인 오류:', error);
                if (window.showNotification) {
                    window.showNotification('네이버 로그인 중 오류가 발생했습니다.', 'error');
                } else {
                    alert('네이버 로그인 중 오류가 발생했습니다.');
                }
            }
        });
    }


    // 네이버 로그인 실행 함수
    async function performNaverLogin() {
        try {
            console.log('네이버 로그인 실행 시작');
            
            // 로그인 모달 먼저 닫기
            if (loginModal) {
                loginModal.style.display = 'none';
            }
            
            // 네이버 로그인 실행 (리다이렉트됨)
            await window.naverLogin();
            
        } catch (error) {
            console.error('네이버 로그인 실패:', error);
            window.showNotification('네이버 로그인에 실패했습니다.', 'error');
        }
    }

    // 로그아웃 (데스크톱)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // Firebase 로그아웃
                await auth.signOut();
                
                // 카카오 로그아웃도 함께 처리
                if (window.handleKakaoLogout && window.checkKakaoLoginStatus().isLoggedIn) {
                    await window.handleKakaoLogout();
                }
                
                if (window.showNotification) {
                    window.showNotification('로그아웃되었습니다.', 'success');
                }
            } catch (error) {
                console.error('로그아웃 실패:', error);
                if (window.showNotification) {
                    window.showNotification('로그아웃에 실패했습니다.', 'error');
                }
            }
        });
    }

    // 로그아웃 (모바일)
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', async () => {
            try {
                // Firebase 로그아웃
                await auth.signOut();
                
                // 카카오 로그아웃도 함께 처리
                if (window.handleKakaoLogout && window.checkKakaoLoginStatus().isLoggedIn) {
                    await window.handleKakaoLogout();
                }
                
                // 네이버 로그아웃도 함께 처리
                if (window.handleNaverLogout && window.checkNaverLoginStatus().isLoggedIn) {
                    await window.handleNaverLogout();
                }
                
                // 모바일 메뉴 닫기
                const mobileNav = document.getElementById('mobileNav');
                const mobileMenuToggle = document.getElementById('mobileMenuToggle');
                if (mobileNav && mobileMenuToggle) {
                    mobileNav.classList.remove('active');
                    mobileMenuToggle.innerHTML = '☰';
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
                
                if (window.showNotification) {
                    window.showNotification('로그아웃되었습니다.', 'success');
                }
            } catch (error) {
                console.error('로그아웃 실패:', error);
                if (window.showNotification) {
                    window.showNotification('로그아웃에 실패했습니다.', 'error');
                }
            }
        });
    }
});

// Firestore에 사용자 정보 저장 함수
async function saveUserToFirestore(user) {
    try {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // 새 사용자인 경우 정보 저장
            await userRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                provider: 'google',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('새 사용자 정보가 Firestore에 저장되었습니다.');
        } else {
            // 기존 사용자인 경우 마지막 로그인 시간만 업데이트
            await userRef.update({
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('기존 사용자 로그인 시간이 업데이트되었습니다.');
        }
    } catch (error) {
        console.error('Firestore 사용자 정보 저장 오류:', error);
    }
}

// 이 함수는 더 이상 사용되지 않으므로 제거하거나 주석 처리합니다.
// function updateUIForLoggedInUser(user) {
//     const loginBtn = document.getElementById('loginBtn');
//     const logoutBtn = document.getElementById('logoutBtn');
//     const myPageLink = document.getElementById('myPageLink');
//     
//     if (loginBtn) loginBtn.style.display = 'inline-block';
//     if (logoutBtn) {
//         logoutBtn.style.display = 'none';
//         logoutBtn.textContent = `${user.displayName} 로그아웃`;
//     }
//     if (myPageLink) myPageLink.style.display = 'none';
// }
