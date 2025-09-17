import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Firebase 설정 (seonggyeok-palja 프로젝트)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAKOc9jJF-RnYWoGqNX0PqB8whgMxA7Hko",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "seonggyeok-palja.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "seonggyeok-palja",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "seonggyeok-palja.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "562346150829",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:562346150829:web:e077fcf854f9c3d8202f24",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-B520Q0DJC5"
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
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
} catch (error) {
    console.error('Firebase 초기화 오류:', error);
}

// Firestore에 사용자 정보 저장 함수
export async function saveUserToFirestore(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // 새 사용자인 경우 정보 저장
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                provider: user.providerData[0]?.providerId || 'unknown',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp()
            });
            console.log('새 사용자 정보가 Firestore에 저장되었습니다.');
        } else {
            // 기존 사용자인 경우 마지막 로그인 시간만 업데이트
            await updateDoc(userRef, {
                lastLoginAt: serverTimestamp()
            });
            console.log('기존 사용자 로그인 시간이 업데이트되었습니다.');
        }
    } catch (error) {
        console.error('Firestore 사용자 정보 저장 오류:', error);
    }
}

// Google 로그인 함수
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('구글 로그인 성공:', result.user.email);

        // 사용자 정보를 Firestore에 저장
        await saveUserToFirestore(result.user);

        return result.user;
    } catch (error) {
        console.error('구글 로그인 실패:', error);

        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('로그인 팝업이 닫혔습니다.');
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
        } else {
            throw error;
        }
    }
}

// 로그아웃 함수
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log('로그아웃 성공');
    } catch (error) {
        console.error('로그아웃 실패:', error);
        throw error;
    }
}

// 인증 상태 변경 감지
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// 현재 사용자 가져오기
export function getCurrentUser() {
    return auth.currentUser;
}

// 관리자 이메일 목록
export const ADMIN_USERS = [
    'jaehxxn7@naver.com',
    'tnalsqkr1234@gmail.com',
    'regend0726@gmail.com'
];

// 관리자 권한 확인
export function checkAdminAccess(user) {
    if (!user || !user.email) return false;
    return ADMIN_USERS.includes(user.email.toLowerCase());
}

export { app, auth, db, googleProvider };