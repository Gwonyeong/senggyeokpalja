// Firebase 인스턴스는 전역 변수에서 가져옴
// const auth = window.firebaseAuth; // firebase-auth.js에서 이미 선언됨

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('login-modal');
    
    // 모바일 로그인 버튼들
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (!loginModal) return;

    // 관리자 모드 체크
    function checkAdminMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const adminLink = document.querySelector('.admin-only');
        
        // URL 파라미터로 관리자 모드 활성화
        if (urlParams.get('admin') === 'true') {
            document.body.classList.add('admin-mode');
            if (adminLink) {
                adminLink.style.display = 'inline-block';
            }
            console.log('관리자 모드 활성화');
        }
        
        // 세션 스토리지에서 관리자 로그인 상태 확인
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            if (adminLink) {
                adminLink.style.display = 'inline-block';
            }
        }
        
        // 키보드 단축키로 관리자 모드 토글 (Ctrl + Shift + A)
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                const isVisible = adminLink && adminLink.style.display !== 'none';
                if (adminLink) {
                    adminLink.style.display = isVisible ? 'none' : 'inline-block';
                }
                console.log('관리자 링크 토글:', !isVisible);
            }
        });
    }

    const closeModalBtn = loginModal.querySelector('.login-modal-close');
    const modalOverlay = loginModal.querySelector('.login-modal-overlay');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const kakaoLoginBtn = document.getElementById('kakaoLoginBtn');
    const naverLoginBtn = document.getElementById('naverLoginBtn');

    checkAdminMode();
    
    // 스크롤 유도 함수
    window.scrollToServices = function() {
        const servicesSection = document.querySelector('.services-section');
        if (servicesSection) {
            servicesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // 의뢰하기 버튼 이벤트 리스너
    const premiumLinks = document.querySelectorAll('a[href="#premium"]');
    premiumLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPremiumServicesModal();
        });
    });

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'flex';
        loginModal.classList.add('active');
    });

    // 모바일 로그인 버튼 이벤트 리스너
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
            loginModal.classList.add('active');
        });
    }

    // 모달 닫기 이벤트들
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            loginModal.classList.remove('active');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 300);
        });
    }

    // 오버레이 클릭으로 모달 닫기
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            loginModal.classList.remove('active');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 300);
        });
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLoginModal();
            closePolicyModal();
        }
    });

    // 정책 모달 관련 함수들
    window.showTermsOfService = function() {
        document.getElementById('terms-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.showPrivacyPolicy = function() {
        document.getElementById('privacy-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closePolicyModal = function() {
        const termsModal = document.getElementById('terms-modal');
        const privacyModal = document.getElementById('privacy-modal');
        
        if (termsModal) termsModal.style.display = 'none';
        if (privacyModal) privacyModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    // 정책 모달 이벤트 리스너 추가
    document.addEventListener('click', function(e) {
        // 이용약관 모달 닫기
        if (e.target.classList.contains('policy-modal-overlay') || 
            e.target.classList.contains('policy-modal-close')) {
            closePolicyModal();
        }
    });

    // Firebase auth 관련 로직 실행
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // 카카오 로그인 상태 확인
            const loginProvider = localStorage.getItem('loginProvider');
            if (loginProvider === 'kakao') {
                handleKakaoLogout();
            } else {
                auth.signOut();
            }
        });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        }
    });
});

// 유료서비스 모달 표시
function showPremiumServicesModal() {
    const modalHTML = `
        <div id="premium-services-modal" class="modal" style="display: flex; z-index: 10000; position: fixed; top: 0; left: 0; width: 100%; height: 100%; justify-content: center; align-items: center; background: rgba(26, 26, 29, 0.9);">
            <div class="modal-content" style="max-width: 600px; width: 90%; background: var(--card-bg-color); border: 1px solid var(--border-color); border-radius: 16px; padding: 30px; margin: 0 auto; position: relative;">
                <div class="modal-header" style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: var(--starlight-orange); margin-bottom: 10px;">✨ 프리미엄 서비스</h2>
                    <p style="color: var(--text-muted-color); font-size: 14px;">토리의 전문 분석 서비스를 선택하세요</p>
                </div>
                
                <div class="premium-services-grid" style="display: flex; justify-content: center; margin-bottom: 30px;">
                    <div class="service-card" style="background: rgba(252, 163, 17, 0.1); border: 1px solid rgba(252, 163, 17, 0.3); 
                                                     border-radius: 12px; padding: 25px; text-align: center; transition: all 0.3s ease; width: 100%; max-width: 400px;">
                        <h3 style="color: var(--starlight-orange); margin-bottom: 10px; font-size: 20px;">상세 리포트 신청</h3>
                        <p style="color: var(--text-color); margin-bottom: 15px; line-height: 1.6;">
                            개인 맞춤형 팔자 분석과 운세, 궁합까지<br>
                            전문가의 상세한 해석을 PDF로 받아보세요
                        </p>
                        <div style="color: var(--brass-gold); font-weight: 600; margin-bottom: 20px; font-size: 18px;">
                            ₩ 29,000
                        </div>
                        <button onclick="showComingSoonMessage()" 
                                style="background: var(--charcoal-gray); color: var(--text-muted-color); border: 1px solid var(--border-color); 
                                       padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: not-allowed; width: 100%; font-size: 16px;">
                            준비중
                        </button>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="closePremiumServicesModal()" 
                            style="background: var(--charcoal-gray); color: var(--text-color); border: 1px solid var(--border-color); 
                                   padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 유료서비스 모달 닫기
function closePremiumServicesModal() {
    const modal = document.getElementById('premium-services-modal');
    if (modal) {
        modal.remove();
    }
}

// 전역 함수로 설정
window.closePremiumServicesModal = closePremiumServicesModal;

// 상세 리포트 신청 폼 표시
function showDetailedReportForm() {
    closePremiumServicesModal();
    
    const formHTML = `
        <div id="detailed-report-form-modal" class="modal" style="display: flex; z-index: 10000;">
            <div class="modal-content" style="max-width: 500px; background: var(--card-bg-color); border: 1px solid var(--border-color);">
                <div class="modal-header" style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: var(--starlight-orange); margin-bottom: 10px;">📊 상세 리포트 신청</h2>
                    <p style="color: var(--text-muted-color); font-size: 14px;">정확한 분석을 위해 정보를 입력해주세요</p>
                </div>
                
                <form id="detailed-report-form" style="margin-bottom: 20px;">
                    <div class="input-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--text-color); font-weight: 600;">이름 *</label>
                        <input type="text" id="report-name" placeholder="성함을 입력하세요" required
                               style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; 
                                      background: rgba(0,0,0,0.2); color: var(--text-color); font-size: 16px;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                        <div class="input-group">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-color); font-weight: 600;">생년 *</label>
                            <input type="number" id="report-year" placeholder="1990" min="1900" max="2024" required
                                   style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; 
                                          background: rgba(0,0,0,0.2); color: var(--text-color); font-size: 16px;">
                        </div>
                        <div class="input-group">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-color); font-weight: 600;">월 *</label>
                            <select id="report-month" required
                                    style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; 
                                           background: rgba(0,0,0,0.2); color: var(--text-color); font-size: 16px;">
                                <option value="">월</option>
                                ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${i + 1}월</option>`).join('')}
                            </select>
                        </div>
                        <div class="input-group">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-color); font-weight: 600;">일 *</label>
                            <input type="number" id="report-day" placeholder="15" min="1" max="31" required
                                   style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; 
                                          background: rgba(0,0,0,0.2); color: var(--text-color); font-size: 16px;">
                        </div>
                    </div>
                    
                    <div class="input-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--text-color); font-weight: 600;">성별 *</label>
                        <div style="display: flex; gap: 20px;">
                            <label style="display: flex; align-items: center; color: var(--text-color); cursor: pointer;">
                                <input type="radio" name="gender" value="male" required style="margin-right: 8px;">
                                남성
                            </label>
                            <label style="display: flex; align-items: center; color: var(--text-color); cursor: pointer;">
                                <input type="radio" name="gender" value="female" required style="margin-right: 8px;">
                                여성
                            </label>
                        </div>
                    </div>
                    
                    <div class="input-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--text-color); font-weight: 600;">팔자 유형 *</label>
                        <select id="report-palja" required
                                style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; 
                                       background: rgba(0,0,0,0.2); color: var(--text-color); font-size: 16px;">
                            <option value="">팔자 유형을 선택하세요</option>
                            <option value="WSIJ">WSIJ - 물상금하</option>
                            <option value="NGHJ">NGHJ - 목화금상</option>
                            <option value="WSIY">WSIY - 물상금음</option>
                            <option value="NSHJ">NSHJ - 목토금상</option>
                            <option value="WGIJ">WGIJ - 물금금하</option>
                            <option value="NGHY">NGHY - 목화금음</option>
                            <option value="WSHY">WSHY - 물상화음</option>
                            <option value="NGIJ">NGIJ - 목금금하</option>
                            <option value="WGHY">WGHY - 물금화음</option>
                            <option value="NSIJ">NSIJ - 목토금하</option>
                        </select>
                    </div>
                    
                    <div class="input-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--text-color); font-weight: 600;">연락처 *</label>
                        <input type="text" id="report-contact" placeholder="010-1234-5678 또는 카카오톡 ID" required
                               style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; 
                                      background: rgba(0,0,0,0.2); color: var(--text-color); font-size: 16px;">
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="closeDetailedReportForm()" 
                                style="padding: 12px 20px; background: var(--charcoal-gray); color: var(--text-color); 
                                       border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;">
                            취소
                        </button>
                        <button type="submit" 
                                style="padding: 12px 24px; background: linear-gradient(135deg, var(--starlight-orange), var(--brass-gold)); 
                                       color: var(--ink-black); border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            신청 완료
                        </button>
                    </div>
                </form>
                
                <div id="report-form-error" style="color: #FF6B6B; font-size: 14px; text-align: center; display: none;"></div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHTML);
    
    // 폼 이벤트 리스너
    document.getElementById('detailed-report-form').addEventListener('submit', handleDetailedReportSubmit);
}

// 상세 리포트 폼 닫기
function closeDetailedReportForm() {
    const modal = document.getElementById('detailed-report-form-modal');
    if (modal) {
        modal.remove();
    }
}

// 상세 리포트 신청 처리
function handleDetailedReportSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('report-name').value,
        birth_year: parseInt(document.getElementById('report-year').value),
        birth_month: parseInt(document.getElementById('report-month').value),
        birth_day: parseInt(document.getElementById('report-day').value),
        gender: document.querySelector('input[name="gender"]:checked').value,
        palja_type: document.getElementById('report-palja').value,
        contact_info: document.getElementById('report-contact').value,
        contact_method: document.getElementById('report-contact').value.includes('@') || 
                       document.getElementById('report-contact').value.includes('kakao') ? 'kakao' : 'phone',
        analysis_date: new Date().toISOString(),
        pdf_requested: true,
        pdf_sent: false,
        privacy_agreed: true,
        marketing_agreed: false,
        compatibility_score: Math.floor(Math.random() * 40) + 60, // 임시 점수
        created_at: Date.now(),
        updated_at: Date.now()
    };
    
    // 로컬 스토리지에 데이터 저장 (관리자 대시보드에서 사용)
    const existingData = JSON.parse(localStorage.getItem('premiumUsers') || '[]');
    formData.id = `premium_${Date.now()}`;
    existingData.push(formData);
    localStorage.setItem('premiumUsers', JSON.stringify(existingData));
    
    closeDetailedReportForm();
    
    // 성공 메시지 표시
    showSuccessMessage();
}

// 성공 메시지 표시
function showSuccessMessage() {
    const successHTML = `
        <div id="success-modal" class="modal" style="display: flex; z-index: 10000;">
            <div class="modal-content" style="max-width: 400px; background: var(--card-bg-color); border: 1px solid var(--border-color); text-align: center;">
                <div style="padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                    <h3 style="color: var(--starlight-orange); margin-bottom: 15px;">신청 완료!</h3>
                    <p style="color: var(--text-color); margin-bottom: 20px; line-height: 1.6;">
                        상세 리포트 신청이 완료되었습니다.<br>
                        전문가 분석 후 연락처로 PDF를 발송해드립니다.
                    </p>
                    <button onclick="closeSuccessMessage()" 
                            style="background: linear-gradient(135deg, var(--starlight-orange), var(--brass-gold)); 
                                   color: var(--ink-black); border: none; padding: 12px 24px; border-radius: 8px; 
                                   font-weight: 600; cursor: pointer;">
                        확인
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
}

// 성공 메시지 닫기
function closeSuccessMessage() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.remove();
    }
}

// 준비중 메시지 표시
function showComingSoonMessage() {
    const comingSoonHTML = `
        <div id="coming-soon-modal" class="coming-soon-modal" style="display: flex !important;">
            <div class="coming-soon-modal-content">
                <div class="coming-soon-icon">🚧</div>
                <h3>서비스 준비중</h3>
                <p>
                    더 나은 서비스를 위해 준비 중입니다.<br>
                    곧 만나뵐 수 있도록 하겠습니다.
                </p>
                <button onclick="closeComingSoonMessage()" class="btn-primary">
                    확인
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', comingSoonHTML);
}

// 준비중 메시지 닫기
function closeComingSoonMessage() {
    const modal = document.getElementById('coming-soon-modal');
    if (modal) {
        modal.remove();
    }
}

// 전역 함수로 설정
window.showComingSoonMessage = showComingSoonMessage;
window.closeComingSoonMessage = closeComingSoonMessage;