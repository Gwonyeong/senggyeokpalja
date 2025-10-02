import { PrismaClient } from './generated/prisma';
import { getOptimizedDatabaseUrl, getLogLevel } from './db-config';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // 커넥션 풀이 설정된 URL 사용
  datasources: {
    db: {
      url: getOptimizedDatabaseUrl(),
    },
  },
  // 로그 설정
  log: getLogLevel(),
  // 에러 포맷팅
  errorFormat: 'minimal',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 애플리케이션 종료 시 연결 정리
process.on('beforeExit', async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
});

// Next.js 개발 서버가 재시작될 때 연결 정리
if (process.env.NODE_ENV === 'development') {
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
  });
}

// DB 헬스 체크 함수 (옵션)
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}