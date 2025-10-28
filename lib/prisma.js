import { PrismaClient } from "./generated/prisma";
import {
  getOptimizedDatabaseUrl,
  getLogLevel,
  checkDatabaseHealth as checkDbHealth,
} from "./db-config";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 커넥션 풀이 설정된 URL 사용
    datasources: {
      db: {
        url: getOptimizedDatabaseUrl(),
      },
    },
    // 로그 설정
    log: getLogLevel(),
    // 에러 포맷팅
    errorFormat: "minimal",
    // 트랜잭션 옵션 (글로벌 기본값)
    transactionOptions: {
      timeout: 15000, // 15초 기본 타임아웃
      maxWait: 8000, // 8초 최대 대기
      isolationLevel: "ReadCommitted",
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 애플리케이션 종료 시 연결 정리 (중복 등록 방지)
if (!globalForPrisma.beforeExitRegistered) {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
  globalForPrisma.beforeExitRegistered = true;
}

// Next.js 개발 서버가 재시작될 때 연결 정리 (중복 등록 방지)
if (process.env.NODE_ENV === "development" && !globalForPrisma.devSignalsRegistered) {
  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
  });

  process.on("SIGINT", async () => {
    await prisma.$disconnect();
  });
  globalForPrisma.devSignalsRegistered = true;
}

// 개선된 DB 헬스 체크 함수
export async function checkDatabaseHealthDetailed() {
  return await checkDbHealth(prisma);
}

// 커넥션 풀 상태 모니터링
export async function getConnectionPoolStatus() {
  try {
    // Prisma의 내부 메트릭스는 직접 접근할 수 없으므로,
    // 간단한 쿼리 여러 개로 커넥션 상태를 추정
    const startTime = Date.now();

    const promises = Array.from({ length: 3 }, async (_, i) => {
      const start = Date.now();
      await prisma.$queryRaw`SELECT ${i + 1} as test_query`;
      return Date.now() - start;
    });

    const queryTimes = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    const avgQueryTime =
      queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length;

    return {
      status: "healthy",
      avgQueryTime,
      totalTime,
      concurrentQueries: queryTimes.length,
      timestamp: new Date().toISOString(),
      warning: avgQueryTime > 1000 ? "High query response time detected" : null,
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// 레거시 호환성을 위한 간단한 헬스체크
export async function checkDatabaseHealthSimple() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// 레거시 함수명 유지 (backward compatibility)
export const checkDatabaseHealth = checkDatabaseHealthSimple;
