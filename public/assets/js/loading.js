// 로딩 상태 관리
class LoadingManager {
    constructor() {
        this.createLoadingOverlay();
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner spinner"></div>
                <div class="loading-text">분석 중입니다...</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    show(text = '분석 중입니다...') {
        const overlay = document.getElementById('loading-overlay');
        const textElement = overlay.querySelector('.loading-text');
        if (textElement) {
            textElement.textContent = text;
        }
        overlay.classList.add('active');
    }

    hide() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('active');
    }

    // 버튼에 스피너 추가
    addSpinnerToButton(button, text = '처리 중...') {
        const originalText = button.textContent;
        button.innerHTML = `<span class="loading-spinner"></span>${text}`;
        button.disabled = true;
        
        return () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }
}

// 전역 로딩 매니저 인스턴스
window.loadingManager = new LoadingManager();
