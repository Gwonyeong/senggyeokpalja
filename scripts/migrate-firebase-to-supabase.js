#!/usr/bin/env node

/**
 * Firebase to Supabase Migration Script with Prisma ORM
 *
 * This script migrates data from Firebase to Supabase PostgreSQL using Prisma
 *
 * Prerequisites:
 * 1. Firebase Admin SDK credentials
 * 2. Supabase project URL and service key
 * 3. npm install @prisma/client firebase-admin dotenv
 */

const admin = require('firebase-admin');
const { PrismaClient } = require('../lib/generated/prisma');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.migration' });

// Configuration
const config = {
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '../firebase-service-account.json',
    databaseURL: process.env.FIREBASE_DATABASE_URL
  }
};

// Initialize Firebase Admin
function initFirebase() {
  try {
    const serviceAccount = require(config.firebase.serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: config.firebase.databaseURL
    });
    console.log('✅ Firebase Admin initialized');
    return admin;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    process.exit(1);
  }
}

// Initialize Prisma Client
function initPrisma() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not provided');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  console.log('✅ Prisma client initialized');
  return prisma;
}

// Migrate Personality Types from database.json
async function migratePersonalityTypes(prisma) {
  console.log('\n📦 Migrating Personality Types...');

  try {
    // Read database.json
    const databasePath = path.join(__dirname, '../../database.json');
    const databaseData = JSON.parse(fs.readFileSync(databasePath, 'utf8'));

    const personalityTypes = [];
    for (const [code, data] of Object.entries(databaseData)) {
      personalityTypes.push({
        code,
        alias: data.alias,
        imageUrl: data.imageUrl,
        description: data.description,
        advice: data.advice
      });
    }

    // Insert using Prisma
    for (const personalityType of personalityTypes) {
      await prisma.personalityType.upsert({
        where: { code: personalityType.code },
        update: personalityType,
        create: personalityType
      });
    }

    console.log(`✅ Migrated ${personalityTypes.length} personality types`);
    return true;
  } catch (error) {
    console.error('❌ Error reading database.json:', error);
    return false;
  }
}

// Migrate Firebase Auth Users (prepare for manual migration)
async function migrateUsers(firebaseAdmin, prisma) {
  console.log('\n👥 Migrating Users...');

  try {
    // Get all users from Firebase Auth
    const listUsersResult = await firebaseAdmin.auth().listUsers(1000);
    const users = listUsersResult.users;

    console.log(`Found ${users.length} users in Firebase Auth`);

    const profiles = [];
    for (const user of users) {
      // Note: You'll need to handle authentication separately
      // This creates profile records that will be linked to Supabase Auth users
      profiles.push({
        id: user.uid, // This will need to be mapped to Supabase Auth user ID
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoURL,
        provider: user.providerData?.[0]?.providerId || 'unknown',
        createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date()
      });
    }

    // Note: You'll need to create Supabase Auth users separately
    // This is just creating profile records
    console.log('⚠️  User profiles prepared. Manual auth migration required.');

    // Save to JSON for manual processing
    fs.writeFileSync(
      path.join(__dirname, 'users-to-migrate.json'),
      JSON.stringify(profiles, null, 2)
    );
    console.log('📄 User data saved to users-to-migrate.json for manual migration');

    return true;
  } catch (error) {
    console.error('❌ Error migrating users:', error);
    return false;
  }
}

// Migrate Firestore data
async function migrateFirestoreData(firebaseAdmin, prisma) {
  console.log('\n📊 Migrating Firestore Data...');

  try {
    const db = firebaseAdmin.firestore();

    // Example: Migrate analysis results collection
    const analysisSnapshot = await db.collection('analysis_results').get();
    if (!analysisSnapshot.empty) {
      const analysisResults = [];

      analysisSnapshot.forEach(doc => {
        const data = doc.data();
        analysisResults.push({
          id: doc.id,
          userId: data.userId,
          personalityType: data.personalityType,
          mbtiType: data.mbtiType,
          paljaType: data.paljaType,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          birthTime: data.birthTime ? new Date(data.birthTime) : null,
          lunarCalendar: data.lunarCalendar || false,
          analysisData: data.analysisData || {},
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });

      if (analysisResults.length > 0) {
        try {
          await prisma.analysisResult.createMany({
            data: analysisResults,
            skipDuplicates: true
          });
          console.log(`✅ Migrated ${analysisResults.length} analysis results`);
        } catch (error) {
          console.error('❌ Error migrating analysis results:', error);
        }
      }
    }

    // Example: Migrate synergy analysis collection
    const synergySnapshot = await db.collection('synergy_analysis').get();
    if (!synergySnapshot.empty) {
      const synergyResults = [];

      synergySnapshot.forEach(doc => {
        const data = doc.data();
        synergyResults.push({
          id: doc.id,
          userId: data.userId,
          partnerType: data.partnerType,
          userType: data.userType,
          compatibilityScore: data.compatibilityScore,
          analysisData: data.analysisData || {},
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });

      if (synergyResults.length > 0) {
        try {
          await prisma.synergyAnalysis.createMany({
            data: synergyResults,
            skipDuplicates: true
          });
          console.log(`✅ Migrated ${synergyResults.length} synergy analyses`);
        } catch (error) {
          console.error('❌ Error migrating synergy analysis:', error);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error migrating Firestore data:', error);
    return false;
  }
}

// Migrate Realtime Database data
async function migrateRealtimeDatabase(firebaseAdmin, prisma) {
  console.log('\n🔄 Migrating Realtime Database Data...');

  try {
    const db = firebaseAdmin.database();

    // Example: Migrate user preferences
    const snapshot = await db.ref('user_preferences').once('value');
    const data = snapshot.val();

    if (data) {
      console.log('Found Realtime Database data:', Object.keys(data).length, 'entries');

      // Process and migrate data as needed
      // This depends on your specific data structure

      // Save to JSON for analysis
      fs.writeFileSync(
        path.join(__dirname, 'realtime-data.json'),
        JSON.stringify(data, null, 2)
      );
      console.log('📄 Realtime Database data saved to realtime-data.json');
    }

    return true;
  } catch (error) {
    console.error('❌ Error migrating Realtime Database:', error);
    return false;
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting Firebase to Supabase Migration with Prisma...\n');

  // Check for required environment variables
  if (!process.env.DATABASE_URL) {
    console.error('❌ Missing required environment variables');
    console.log('\nPlease create a .env file with:');
    console.log('DATABASE_URL=your_postgresql_connection_string');
    console.log('FIREBASE_SERVICE_ACCOUNT_PATH=path_to_firebase_service_account.json');
    console.log('FIREBASE_DATABASE_URL=your_firebase_database_url');
    process.exit(1);
  }

  const firebaseAdmin = initFirebase();
  const prisma = initPrisma();

  try {
    // Run migrations
    const results = {
      personalityTypes: await migratePersonalityTypes(prisma),
      users: await migrateUsers(firebaseAdmin, prisma),
      firestore: await migrateFirestoreData(firebaseAdmin, prisma),
      realtimeDb: await migrateRealtimeDatabase(firebaseAdmin, prisma)
    };

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(50));

    for (const [key, success] of Object.entries(results)) {
      console.log(`${success ? '✅' : '❌'} ${key}`);
    }

    console.log('\n⚠️  Important Notes:');
    console.log('1. User authentication needs to be migrated manually');
    console.log('2. Check users-to-migrate.json for user data');
    console.log('3. Review and test all migrated data in Supabase');
    console.log('4. Run `npx prisma generate` to generate Prisma client');
    console.log('5. Update your application code to use Prisma client');

    console.log('\n✨ Migration process completed!');
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrate().catch(console.error);
}

module.exports = { migrate };