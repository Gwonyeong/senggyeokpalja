// 환경변수 설정
window.ENV_CONFIG = {
    // 관리자 이메일 목록
    ADMIN_EMAILS: [
        'jaehxxn7@naver.com',
        'tnalsqkr1234@gmail.com',
        'regend0726@gmail.com'
    ],
    
    // Firebase 설정 (firebase-config.js에서 이미 처리됨)
    // 추가 환경변수가 필요한 경우 여기에 추가
    
    // 개발/프로덕션 모드
    IS_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // API 엔드포인트
    API_BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://seonggyeok-palja.web.app'
};

// 전역 변수로 노출
window.ADMIN_EMAILS = window.ENV_CONFIG.ADMIN_EMAILS;
