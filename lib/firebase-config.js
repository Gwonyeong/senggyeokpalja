import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
let app;
let auth;
let db;
let googleProvider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
} catch (error) {
    console.error('Firebase 초기화 오류:', error);
}

export { app, auth, db, googleProvider };