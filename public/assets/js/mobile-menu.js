// 모바일 사이드 메뉴 기능
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    function openMobileMenu() {
        if (mobileNav) {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
            mobileMenuToggle.setAttribute('aria-label', '모바일 메뉴 닫기');
        }
    }
    
    function closeMobileMenu() {
        if (mobileNav) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', '모바일 메뉴 열기');
        }
    }
    
    // 햄버거 버튼 클릭
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (mobileNav && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    // 닫기 버튼 클릭
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
        });
    }
    
    // 오버레이 클릭 시 메뉴 닫기
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function() {
            closeMobileMenu();
        });
    }
    
    // 메뉴 링크 클릭 시 메뉴 닫기
    if (mobileNav) {
        const menuLinks = mobileNav.querySelectorAll('.mobile-nav-link, .mobile-auth-btn');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                // 링크가 실제 페이지 이동을 하는 경우에만 메뉴 닫기
                if (this.getAttribute('href') && this.getAttribute('href') !== '#') {
                    closeMobileMenu();
                }
            });
        });
    }
    
    // ESC 키로 메뉴 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
            closeMobileMenu();
            mobileMenuToggle.focus();
        }
    });
    
    // 화면 크기 변경 시 메뉴 상태 리셋
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileNav && mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
});
