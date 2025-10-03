// 데이터베이스 커넥션 풀 설정을 위한 헬퍼 함수들

export function getOptimizedDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL;

  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // URL에 커넥션 풀 파라미터 추가
  const url = new URL(baseUrl);

  // Supabase 데이터베이스인지 확인
  const isSupabase = url.hostname.includes('supabase.co') ||
                    url.hostname.includes('supabase.com') ||
                    url.hostname.includes('pooler.supabase.com');

  // 환경에 따른 커넥션 풀 설정
  const isProduction = process.env.NODE_ENV === 'production';
  const connectionLimit = isProduction ? 15 : 8; // 프로덕션: 15개, 개발: 8개
  const poolTimeout = 20; // 20초로 증가 (더 여유로운 타임아웃)
  const connectTimeout = 30; // 30초로 감소 (빠른 실패)
  const socketTimeout = 30; // 30초로 감소

  url.searchParams.set('connection_limit', connectionLimit.toString());
  url.searchParams.set('pool_timeout', poolTimeout.toString());
  url.searchParams.set('connect_timeout', connectTimeout.toString());
  url.searchParams.set('socket_timeout', socketTimeout.toString());

  // SSL/TLS 설정
  if (isSupabase) {
    // Supabase는 pooler 모드에서는 SSL을 비활성화해야 할 수 있음
    if (url.port === '6543' || url.hostname.includes('pooler')) {
      // Transaction mode pooler - SSL 비활성화
      url.searchParams.set('sslmode', 'disable');
    } else if (url.port === '5432') {
      // Direct connection - SSL 활성화
      url.searchParams.set('sslmode', 'require');
    } else {
      // 기본값: prefer
      url.searchParams.set('sslmode', 'prefer');
    }

    // Supabase pgbouncer와 호환되는 설정
    url.searchParams.set('pgbouncer', 'true');
  } else {
    // 다른 데이터베이스의 경우 기존 설정 유지
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'prefer');
    }
  }

  // 공통 최적화 파라미터
  url.searchParams.set('statement_cache_size', '0'); // 캐시 비활성화 (메모리 절약)

  return url.toString();
}

// 환경에 따른 로그 레벨 설정
export function getLogLevel() {
  if (process.env.NODE_ENV === 'development') {
    return ['error', 'warn'];
  }
  return ['error'];
}

// 트랜잭션 기본 옵션
export const DEFAULT_TRANSACTION_OPTIONS = {
  timeout: 15000, // 15초 타임아웃 (더 여유롭게)
  maxWait: 8000,  // 8초 최대 대기 (커넥션 풀 대기)
  isolationLevel: 'ReadCommitted'
};

// 복잡한 작업용 트랜잭션 옵션 (결제, 대량 데이터 처리)
export const COMPLEX_TRANSACTION_OPTIONS = {
  timeout: 30000, // 30초 타임아웃
  maxWait: 10000, // 10초 최대 대기
  isolationLevel: 'ReadCommitted'
};

// 빠른 작업용 트랜잭션 옵션 (단순 조회, 업데이트)
export const QUICK_TRANSACTION_OPTIONS = {
  timeout: 8000,  // 8초 타임아웃
  maxWait: 3000,  // 3초 최대 대기
  isolationLevel: 'ReadCommitted'
};

// 커넥션 풀 모니터링 헬퍼
export function getConnectionPoolMetrics() {
  return {
    maxConnections: process.env.NODE_ENV === 'production' ? 15 : 8,
    recommendedActiveConnections: process.env.NODE_ENV === 'production' ? 12 : 6,
    warningThreshold: process.env.NODE_ENV === 'production' ? 13 : 7,
    criticalThreshold: process.env.NODE_ENV === 'production' ? 14 : 8,
  };
}

// 데이터베이스 연결 상태 확인
export async function checkDatabaseHealth(prisma) {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}