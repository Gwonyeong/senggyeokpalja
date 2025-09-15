/**
 * 사용자 관리 유틸리티 함수들
 */

import { prisma } from './prisma.js';

/**
 * 이메일로 사용자 조회
 */
export async function getUserByEmail(email) {
  try {
    const user = await prisma.profile.findUnique({
      where: { email },
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        synergyAnalysis: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        savedResults: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Firebase UID로 사용자 조회
 */
export async function getUserByFirebaseUid(firebaseUid) {
  try {
    const user = await prisma.profile.findUnique({
      where: { firebaseUid },
      include: {
        analysisResults: true,
        synergyAnalysis: true,
        savedResults: true
      }
    });
    return user;
  } catch (error) {
    console.error('Error getting user by Firebase UID:', error);
    return null;
  }
}

/**
 * 사용자 ID로 사용자 조회
 */
export async function getUserById(id) {
  try {
    const user = await prisma.profile.findUnique({
      where: { id },
      include: {
        analysisResults: true,
        synergyAnalysis: true,
        savedResults: true
      }
    });
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * 모든 사용자 조회 (관리자용)
 */
export async function getAllUsers() {
  try {
    const users = await prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            analysisResults: true,
            synergyAnalysis: true,
            savedResults: true
          }
        }
      }
    });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

/**
 * 사용자 정보 업데이트
 */
export async function updateUser(id, updateData) {
  try {
    const user = await prisma.profile.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * 사용자 삭제 (관련 데이터 모두 삭제)
 */
export async function deleteUser(id) {
  try {
    // Prisma의 cascade delete를 사용해서 관련 데이터 모두 삭제
    const deletedUser = await prisma.profile.delete({
      where: { id }
    });
    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    return null;
  }
}

/**
 * 사용자 통계 조회
 */
export async function getUserStats() {
  try {
    const totalUsers = await prisma.profile.count();
    const verifiedUsers = await prisma.profile.count({
      where: { emailVerified: true }
    });

    // 최근 7일 내 로그인한 사용자
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActiveUsers = await prisma.profile.count({
      where: {
        lastSignInAt: {
          gte: weekAgo
        }
      }
    });

    // 분석을 실행한 사용자 수
    const usersWithAnalysis = await prisma.profile.count({
      where: {
        analysisResults: {
          some: {}
        }
      }
    });

    return {
      totalUsers,
      verifiedUsers,
      recentActiveUsers,
      usersWithAnalysis
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      recentActiveUsers: 0,
      usersWithAnalysis: 0
    };
  }
}

/**
 * 사용자 활동 기록 업데이트
 */
export async function updateUserActivity(id, activityData = {}) {
  try {
    const user = await prisma.profile.update({
      where: { id },
      data: {
        lastSignInAt: activityData.lastSignInAt || new Date(),
        updatedAt: new Date()
      }
    });
    return user;
  } catch (error) {
    console.error('Error updating user activity:', error);
    return null;
  }
}

/**
 * Firebase UID를 새로운 Supabase ID로 매핑
 */
export async function mapFirebaseToSupabase(firebaseUid, supabaseId) {
  try {
    const user = await prisma.profile.update({
      where: { firebaseUid },
      data: {
        id: supabaseId,
        updatedAt: new Date()
      }
    });
    return user;
  } catch (error) {
    console.error('Error mapping Firebase to Supabase:', error);
    return null;
  }
}