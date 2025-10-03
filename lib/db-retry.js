// 데이터베이스 재시도 로직 헬퍼

const RETRYABLE_ERROR_CODES = [
  'P2024', // Timed out fetching a new connection from the connection pool
  'P2025', // Record not found (sometimes temporary)
  'P2028', // Connection timeout
  'P2034', // Transaction failed due to a write conflict
  'P2037', // Too many database connections opened
];

const RETRYABLE_ERROR_MESSAGES = [
  'timeout',
  'connection',
  'deadlock',
  'conflict',
  'pool',
  'ECONNRESET',
  'ETIMEDOUT',
];

// 에러가 재시도 가능한지 확인
function isRetryableError(error) {
  // Prisma 에러 코드 확인
  if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
    return true;
  }

  // 에러 메시지 확인
  const errorMessage = error.message?.toLowerCase() || '';
  return RETRYABLE_ERROR_MESSAGES.some(msg => errorMessage.includes(msg));
}

// 재시도 지연 계산 (지수 백오프)
function calculateRetryDelay(attempt, baseDelay = 100) {
  const delay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * delay; // 10% 지터 추가
  return Math.min(delay + jitter, 5000); // 최대 5초
}

// 데이터베이스 작업 재시도 래퍼
export async function withRetry(operation, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 100,
    onRetry = null,
    retryCondition = isRetryableError,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // 마지막 시도이거나 재시도 불가능한 에러인 경우
      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }

      const delay = calculateRetryDelay(attempt, baseDelay);

      if (onRetry) {
        await onRetry(error, attempt, delay);
      }

      console.warn(`Database operation failed (attempt ${attempt}/${maxAttempts}):`, {
        error: error.message,
        code: error.code,
        retryAfter: delay,
      });

      // 지연 후 재시도
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// 트랜잭션 재시도 래퍼
export async function withTransactionRetry(prisma, transactionFn, transactionOptions = {}, retryOptions = {}) {
  return withRetry(
    () => prisma.$transaction(transactionFn, transactionOptions),
    {
      maxAttempts: 3,
      baseDelay: 200,
      ...retryOptions,
      onRetry: async (error, attempt, delay) => {
        console.warn(`Transaction failed (attempt ${attempt}), retrying in ${delay}ms:`, {
          error: error.message,
          code: error.code,
        });

        if (retryOptions.onRetry) {
          await retryOptions.onRetry(error, attempt, delay);
        }
      },
    }
  );
}

// 중요한 작업용 재시도 설정
export const CRITICAL_RETRY_OPTIONS = {
  maxAttempts: 5,
  baseDelay: 300,
};

// 일반 작업용 재시도 설정
export const STANDARD_RETRY_OPTIONS = {
  maxAttempts: 3,
  baseDelay: 100,
};

// 빠른 작업용 재시도 설정 (재시도 최소화)
export const QUICK_RETRY_OPTIONS = {
  maxAttempts: 2,
  baseDelay: 50,
};

// 커넥션 풀 고갈 감지 및 대응
export function handleConnectionPoolExhaustion(error) {
  if (error.code === 'P2037' || error.message?.includes('connection pool')) {
    console.error('Connection pool exhausted! Consider:', {
      suggestions: [
        'Increase connection_limit in DATABASE_URL',
        'Check for connection leaks in application code',
        'Review long-running transactions',
        'Consider connection pooling at application level',
      ],
      currentError: error.message,
      timestamp: new Date().toISOString(),
    });

    // 급격한 요청 증가 시 백압력 적용
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 데드락 감지 및 대응
export function handleDeadlock(error) {
  if (error.code === 'P2034' || error.message?.includes('deadlock')) {
    console.warn('Deadlock detected, transaction will be retried:', {
      error: error.message,
      recommendation: 'Consider optimizing transaction order and duration',
      timestamp: new Date().toISOString(),
    });
  }
}

// 포괄적인 데이터베이스 에러 핸들러
export async function handleDatabaseError(error, context = {}) {
  // 커넥션 풀 고갈 처리
  if (error.code === 'P2037') {
    await handleConnectionPoolExhaustion(error);
  }

  // 데드락 처리
  if (error.code === 'P2034') {
    handleDeadlock(error);
  }

  // 에러 로깅 (운영 환경에서는 모니터링 시스템에 전송)
  console.error('Database error occurred:', {
    error: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  });

  // 에러 타입에 따른 사용자 친화적 메시지 반환
  if (error.code === 'P2002') {
    return new Error('중복된 데이터입니다. 다른 값을 사용해주세요.');
  }

  if (error.code === 'P2025') {
    return new Error('요청한 데이터를 찾을 수 없습니다.');
  }

  if (error.code === 'P2037') {
    return new Error('현재 서버가 혼잡합니다. 잠시 후 다시 시도해주세요.');
  }

  if (error.code === 'P2034') {
    return new Error('다른 사용자와 동시 작업으로 인한 충돌입니다. 다시 시도해주세요.');
  }

  if (error.message?.includes('timeout')) {
    return new Error('처리 시간이 초과되었습니다. 다시 시도해주세요.');
  }

  return new Error('일시적인 오류가 발생했습니다. 다시 시도해주세요.');
}