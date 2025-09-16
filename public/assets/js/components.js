// 공통 컴포넌트 관리
class ComponentManager {
    // 헤더 컴포넌트 생성
    static createHeader() {
        return `
        <header>
            <div class="container">
                <div class="header-content">
                    <div class="logo-section">
                        <a href="index.html" class="logo">성격팔자</a>
                        <span class="tagline">그대의 길을 묻는가?</span>
                    </div>
                    <nav class="nav-menu desktop-nav" role="navigation" aria-label="주요 메뉴">
                        <ul>
                            <li><a href="index.html" class="nav-link">홈</a></li>
                            <li><a href="analyze.html" class="nav-link">찻집</a></li>
                            <li><a href="synergy.html" class="nav-link">시너지</a></li>
                            <li><a href="#premium" class="nav-link">의뢰하기</a></li>
                            <li><a href="admin-dashboard.html" class="nav-link admin-only" style="color: #FF6B6B; display: none;" aria-label="관리자 대시보드">🔐 관리자</a></li>
                        </ul>
                    </nav>
                    <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="모바일 메뉴 열기" aria-expanded="false" aria-controls="mobileNav">☰</button>
                    <div id="auth-container">
                        <a href="#" id="loginBtn" class="header-auth-btn">로그인</a>
                        <a href="mypage.html" id="myPageLink" style="display: none;" class="header-auth-btn">마이페이지</a>
                        <button id="logoutBtn" style="display: none;" class="header-auth-btn">로그아웃</button>
                    </div>
                </div>
            </div>
        </header>`;
    }

    // 모바일 메뉴 컴포넌트 생성
    static createMobileMenu() {
        return `
        <div id="mobileNav" class="mobile-side-menu" role="navigation" aria-label="모바일 메뉴">
            <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <div class="mobile-logo">성격팔자</div>
                    <button class="mobile-menu-close" id="mobileMenuClose" aria-label="모바일 메뉴 닫기">✕</button>
                </div>
                <div class="mobile-menu-body">
                    <div class="mobile-menu-section">
                        <h4>메뉴</h4>
                        <ul class="mobile-nav-list">
                            <li><a href="index.html" class="mobile-nav-link">홈</a></li>
                            <li><a href="analyze.html" class="mobile-nav-link">찻집</a></li>
                            <li><a href="synergy.html" class="mobile-nav-link">시너지</a></li>
                            <li><a href="#premium" class="mobile-nav-link">의뢰하기</a></li>
                        </ul>
                    </div>
                    <div class="mobile-menu-section mobile-auth-section">
                        <div class="mobile-auth-item">
                            <a href="#" id="mobileLoginBtn" class="mobile-auth-btn">로그인</a>
                            <a href="mypage.html" id="mobileMyPageLink" style="display: none;" class="mobile-auth-btn">마이페이지</a>
                            <button id="mobileLogoutBtn" style="display: none;" class="mobile-auth-btn logout-btn">로그아웃</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // 로그인 모달 컴포넌트 생성
    static createLoginModal() {
        return `
        <div id="login-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <button class="close-btn" aria-label="모달 닫기">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="social-buttons">
                        <button class="social-btn google-btn" onclick="window.googleLogin()">
                            <span>Google 로그인/가입</span>
                        </button>
                        <button class="social-btn kakao-btn" onclick="window.kakaoLogin()">
                            <span>카카오 로그인/가입</span>
                        </button>
                        <button class="social-btn naver-btn disabled" disabled style="background: linear-gradient(135deg, #9E9E9E 0%, #757575 100%) !important; opacity: 0.7; cursor: not-allowed; pointer-events: none;">
                            <span>네이버 로그인 (준비중)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }
}

// 전역으로 노출
window.ComponentManager = ComponentManager;
