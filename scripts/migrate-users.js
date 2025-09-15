#!/usr/bin/env node

/**
 * Firebase 사용자를 Prisma 유저 테이블로 마이그레이션하는 스크립트
 */

const admin = require('firebase-admin');
const { PrismaClient } = require('../lib/generated/prisma');
const fs = require('fs');
const path = require('path');
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

// Prisma 클라이언트 초기화
function initPrisma() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not provided');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  console.log('✅ Prisma client initialized');
  return prisma;
}

// Firebase Auth 사용자를 Prisma로 마이그레이션
async function migrateUsers(firebaseAdmin, prisma) {
  console.log('\n👥 Firebase Auth 사용자를 Prisma로 마이그레이션...');

  try {
    // Firebase Auth에서 모든 사용자 가져오기
    const listUsersResult = await firebaseAdmin.auth().listUsers(1000);
    const firebaseUsers = listUsersResult.users;

    console.log(`📊 Firebase에서 ${firebaseUsers.length}명의 사용자를 찾았습니다.`);

    const migratedUsers = [];

    for (const user of firebaseUsers) {
      try {
        // UUID 생성 (Firebase UID를 UUID로 변환)
        const { randomUUID } = require('crypto');

        // 사용자 데이터 변환
        const userData = {
          id: randomUUID(), // 새로운 UUID 생성
          email: user.email,
          displayName: user.displayName,
          photoUrl: user.photoURL,
          provider: user.providerData?.[0]?.providerId || 'unknown',
          emailVerified: user.emailVerified,
          firebaseUid: user.uid, // 원본 Firebase UID 보관
          lastSignInAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null,
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
          updatedAt: new Date()
        };

        // Prisma를 사용해서 사용자 생성 또는 업데이트
        const migratedUser = await prisma.profile.upsert({
          where: { email: userData.email },
          update: {
            displayName: userData.displayName,
            photoUrl: userData.photoUrl,
            provider: userData.provider,
            emailVerified: userData.emailVerified,
            firebaseUid: userData.firebaseUid,
            lastSignInAt: userData.lastSignInAt,
            updatedAt: userData.updatedAt
          },
          create: userData
        });

        migratedUsers.push(migratedUser);
        console.log(`✅ ${userData.email} 마이그레이션 완료`);

      } catch (error) {
        console.error(`❌ ${user.email} 마이그레이션 실패:`, error.message);
      }
    }

    console.log(`\n🎉 총 ${migratedUsers.length}명의 사용자가 성공적으로 마이그레이션되었습니다.`);

    // 마이그레이션 결과를 JSON 파일로 저장
    const migrationReport = {
      timestamp: new Date().toISOString(),
      totalFirebaseUsers: firebaseUsers.length,
      successfulMigrations: migratedUsers.length,
      users: migratedUsers.map(user => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        provider: user.provider,
        createdAt: user.createdAt
      }))
    };

    fs.writeFileSync(
      path.join(__dirname, 'user-migration-report.json'),
      JSON.stringify(migrationReport, null, 2)
    );
    console.log('📄 마이그레이션 보고서가 user-migration-report.json에 저장되었습니다.');

    return migratedUsers;

  } catch (error) {
    console.error('❌ 사용자 마이그레이션 실패:', error);
    return [];
  }
}

// 마이그레이션된 사용자 확인
async function verifyMigration(prisma) {
  console.log('\n🔍 마이그레이션 결과 확인...');

  try {
    const users = await prisma.profile.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`📊 Prisma 데이터베이스에 ${users.length}명의 사용자가 있습니다.\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.displayName || '이름 없음'} (${user.email})`);
      console.log(`   - Firebase UID: ${user.firebaseUid}`);
      console.log(`   - 프로바이더: ${user.provider}`);
      console.log(`   - 가입일: ${user.createdAt.toLocaleString('ko-KR')}`);
      console.log(`   - 마지막 로그인: ${user.lastSignInAt?.toLocaleString('ko-KR') || '없음'}`);
      console.log('');
    });

    return users;
  } catch (error) {
    console.error('❌ 마이그레이션 확인 실패:', error);
    return [];
  }
}

// 메인 함수
async function main() {
  console.log('🚀 Firebase 사용자 → Prisma 마이그레이션 시작...\n');

  const firebaseAdmin = initFirebase();
  const prisma = initPrisma();

  try {
    // 사용자 마이그레이션 실행
    const migratedUsers = await migrateUsers(firebaseAdmin, prisma);

    // 마이그레이션 결과 확인
    await verifyMigration(prisma);

    console.log('\n' + '='.repeat(50));
    console.log('📊 마이그레이션 요약');
    console.log('='.repeat(50));
    console.log(`✅ 성공적으로 마이그레이션된 사용자: ${migratedUsers.length}명`);
    console.log('\n⚠️  중요 사항:');
    console.log('1. 사용자들은 Supabase Auth로 다시 로그인해야 합니다.');
    console.log('2. Firebase UID는 firebaseUid 필드에 보관되어 있습니다.');
    console.log('3. Supabase Auth 연동 후 id 필드를 업데이트해야 합니다.');

    console.log('\n✨ 사용자 마이그레이션 완료!');

  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}