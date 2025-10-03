import { NextResponse } from 'next/server';
import { checkDatabaseHealthDetailed, getConnectionPoolStatus } from '@/lib/prisma';
import { getConnectionPoolMetrics } from '@/lib/db-config';

export async function GET(request) {
  const url = new URL(request.url);
  const detailed = url.searchParams.get('detailed') === 'true';

  try {
    // 기본 헬스체크
    const healthCheck = await checkDatabaseHealthDetailed();
    const poolMetrics = getConnectionPoolMetrics();

    let connectionPoolStatus = null;
    if (detailed) {
      connectionPoolStatus = await getConnectionPoolStatus();
    }

    // 전체 시스템 상태 결정
    const isHealthy = healthCheck.status === 'healthy' &&
                     (!connectionPoolStatus || connectionPoolStatus.status === 'healthy');

    const responseData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        status: healthCheck.status,
        responseTime: healthCheck.responseTime,
        ...(healthCheck.error && { error: healthCheck.error }),
      },
      connectionPool: {
        configured: poolMetrics,
        ...(connectionPoolStatus && {
          current: connectionPoolStatus,
          warnings: connectionPoolStatus.warning ? [connectionPoolStatus.warning] : []
        }),
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };

    // 상세 정보 요청 시 추가 데이터
    if (detailed) {
      responseData.system = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      };

      responseData.health = {
        checks: {
          database: healthCheck.status === 'healthy',
          connectionPool: !connectionPoolStatus || connectionPoolStatus.status === 'healthy',
          memory: responseData.memory.used < 500, // 500MB 임계값
        }
      };
    }

    const statusCode = isHealthy ? 200 : 503;
    return NextResponse.json(responseData, { status: statusCode });

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
        database: {
          status: 'error',
          error: error.message,
        },
        ...(detailed && {
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
      },
      { status: 500 }
    );
  }
}