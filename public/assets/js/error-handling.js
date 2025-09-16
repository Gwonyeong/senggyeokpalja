// 에러 핸들링 유틸리티
function showErrorMessage(message, duration = 5000) {
    // 기존 에러 메시지 제거
    const existingError = document.querySelector('.error-toast');
    if (existingError) {
        existingError.remove();
    }

    // 에러 토스트 생성
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-text">${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // 스타일 적용
    errorToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(244, 67, 54, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;

    // 애니메이션 CSS 추가
    if (!document.querySelector('#error-animations')) {
        const style = document.createElement('style');
        style.id = 'error-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .error-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .error-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
            }
            .error-close:hover {
                opacity: 0.7;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(errorToast);

    // 자동 제거
    setTimeout(() => {
        if (errorToast.parentNode) {
            errorToast.remove();
        }
    }, duration);
}

// 성공 메시지 표시
function showSuccessMessage(message, duration = 3000) {
    const successToast = document.createElement('div');
    successToast.className = 'success-toast';
    successToast.innerHTML = `
        <div class="success-content">
            <span class="success-icon">✅</span>
            <span class="success-text">${message}</span>
        </div>
    `;

    successToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;

    document.body.appendChild(successToast);

    setTimeout(() => {
        if (successToast.parentNode) {
            successToast.remove();
        }
    }, duration);
}

// 네트워크 에러 체크
function handleNetworkError(error) {
    if (!navigator.onLine) {
        showErrorMessage('인터넷 연결을 확인해주세요.');
        return;
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showErrorMessage('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    showErrorMessage('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
}

// 전역 에러 핸들러
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showErrorMessage('페이지에서 오류가 발생했습니다.');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    handleNetworkError(event.reason);
});
