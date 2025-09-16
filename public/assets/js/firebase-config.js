// Firebase 설정 (seonggyeok-palja 프로젝트)
const firebaseConfig = {
    apiKey: "AIzaSyAKOc9jJF-RnYWoGqNX0PqB8whgMxA7Hko",
    authDomain: "seonggyeok-palja.firebaseapp.com",
    projectId: "seonggyeok-palja",
    storageBucket: "seonggyeok-palja.firebasestorage.app",
    messagingSenderId: "562346150829",
    appId: "1:562346150829:web:e077fcf854f9c3d8202f24",
    measurementId: "G-B520Q0DJC5"
};

// Firebase 앱 초기화
let app, auth, db;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    
    // 세션 지속성을 NONE으로 설정 (브라우저 재시작 시 로그아웃)
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    
    db = firebase.firestore();
} catch (error) {
    console.error('Firebase 초기화 오류:', error);
}

// 전역 변수로 설정
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
