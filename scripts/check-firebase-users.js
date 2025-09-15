#!/usr/bin/env node

/**
 * Firebase 사용자 데이터 확인 스크립트
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.migration' });

// Firebase Admin 초기화
function initFirebase() {
  try {
    const serviceAccount = require('../../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log('✅ Firebase Admin initialized');
    return admin;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    process.exit(1);
  }
}

// Firebase Auth 사용자 확인
async function checkAuthUsers(firebaseAdmin) {
  console.log('\n👥 Firebase Auth 사용자 확인...');

  try {
    const listUsersResult = await firebaseAdmin.auth().listUsers(1000);
    const users = listUsersResult.users;

    console.log(`📊 총 ${users.length}명의 사용자가 등록되어 있습니다.\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. 사용자 정보:`);
      console.log(`   - UID: ${user.uid}`);
      console.log(`   - 이메일: ${user.email}`);
      console.log(`   - 이름: ${user.displayName || '없음'}`);
      console.log(`   - 프로필 사진: ${user.photoURL ? '있음' : '없음'}`);
      console.log(`   - 이메일 인증: ${user.emailVerified ? '완료' : '미완료'}`);
      console.log(`   - 가입일: ${new Date(user.metadata.creationTime).toLocaleString('ko-KR')}`);
      console.log(`   - 마지막 로그인: ${new Date(user.metadata.lastSignInTime).toLocaleString('ko-KR')}`);
      console.log(`   - 로그인 제공자: ${user.providerData.map(p => p.providerId).join(', ')}`);
      console.log('');
    });

    return users;
  } catch (error) {
    console.error('❌ Firebase Auth 사용자 조회 실패:', error);
    return [];
  }
}

// Firestore 사용자 데이터 확인
async function checkFirestoreUsers(firebaseAdmin) {
  console.log('\n📊 Firestore 사용자 데이터 확인...');

  try {
    const db = firebaseAdmin.firestore();

    // analysis_results 컬렉션 확인
    const analysisSnapshot = await db.collection('analysis_results').get();
    console.log(`📈 분석 결과: ${analysisSnapshot.size}개`);

    if (!analysisSnapshot.empty) {
      const userIds = new Set();
      analysisSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId) userIds.add(data.userId);
      });
      console.log(`   - 분석을 실행한 고유 사용자: ${userIds.size}명`);
      console.log(`   - 사용자 ID 목록: ${Array.from(userIds).join(', ')}`);
    }

    // synergy_analysis 컬렉션 확인
    const synergySnapshot = await db.collection('synergy_analysis').get();
    console.log(`🤝 시너지 분석: ${synergySnapshot.size}개`);

    if (!synergySnapshot.empty) {
      const userIds = new Set();
      synergySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId) userIds.add(data.userId);
      });
      console.log(`   - 시너지 분석을 실행한 고유 사용자: ${userIds.size}명`);
    }

    // saved_results 컬렉션 확인 (있다면)
    try {
      const savedSnapshot = await db.collection('saved_results').get();
      console.log(`💾 저장된 결과: ${savedSnapshot.size}개`);
    } catch (e) {
      console.log(`💾 저장된 결과: 컬렉션 없음`);
    }

  } catch (error) {
    console.error('❌ Firestore 데이터 조회 실패:', error);
  }
}

// Realtime Database 데이터 확인
async function checkRealtimeDatabase(firebaseAdmin) {
  console.log('\n🔄 Realtime Database 데이터 확인...');

  try {
    const db = firebaseAdmin.database();

    // 전체 데이터베이스 구조 확인
    const snapshot = await db.ref('/').once('value');
    const data = snapshot.val();

    if (data) {
      console.log('📁 데이터베이스 구조:');
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (typeof value === 'object' && value !== null) {
          console.log(`   - ${key}: ${Object.keys(value).length}개 항목`);
        } else {
          console.log(`   - ${key}: ${typeof value}`);
        }
      });
    } else {
      console.log('📁 Realtime Database가 비어있습니다.');
    }

    // user_preferences 확인
    const prefsSnapshot = await db.ref('user_preferences').once('value');
    const prefsData = prefsSnapshot.val();

    if (prefsData) {
      console.log(`⚙️  사용자 설정: ${Object.keys(prefsData).length}명`);
    } else {
      console.log(`⚙️  사용자 설정: 없음`);
    }

  } catch (error) {
    console.error('❌ Realtime Database 조회 실패:', error);
  }
}

// 메인 함수
async function main() {
  console.log('🔍 Firebase 사용자 데이터 확인 시작...\n');

  const firebaseAdmin = initFirebase();

  // 사용자 데이터 확인
  const users = await checkAuthUsers(firebaseAdmin);
  await checkFirestoreUsers(firebaseAdmin);
  await checkRealtimeDatabase(firebaseAdmin);

  console.log('\n' + '='.repeat(50));
  console.log('📊 요약');
  console.log('='.repeat(50));
  console.log(`총 가입 사용자: ${users.length}명`);
  console.log(`활성 사용자: ${users.filter(u => u.emailVerified).length}명`);
  console.log(`최근 7일 내 로그인: ${users.filter(u => {
    const lastSignIn = new Date(u.metadata.lastSignInTime);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return lastSignIn > weekAgo;
  }).length}명`);

  console.log('\n✨ 데이터 확인 완료!');
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}