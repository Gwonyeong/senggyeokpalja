// 데이터베이스 커넥션 풀 설정을 위한 헬퍼 함수들

export function getOptimizedDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL;

  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // URL에 커넥션 풀 파라미터 추가
  const url = new URL(baseUrl);

  // 커넥션 풀 설정
  url.searchParams.set('connection_limit', '5'); // 최대 5개 연결
  url.searchParams.set('pool_timeout', '10'); // 10초 타임아웃
  url.searchParams.set('connect_timeout', '60'); // 60초 연결 타임아웃
  url.searchParams.set('socket_timeout', '60'); // 60초 소켓 타임아웃

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
  timeout: 10000, // 10초 타임아웃
  maxWait: 5000,  // 5초 최대 대기
  isolationLevel: 'ReadCommitted'
};