import { NextResponse } from 'next/server';
import { prisma, getConnectionPoolStatus } from '@/lib/prisma';
import { getConnectionPoolMetrics } from '@/lib/db-config';

export async function GET(request) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'json';

  try {
    const startTime = Date.now();

    // 데이터베이스 상태 확인
    const [
      basicCheck,
      poolStatus,
      tableCount,
      activeConnections
    ] = await Promise.all([
      // 기본 연결 테스트
      prisma.$queryRaw`SELECT 1 as test, NOW() as server_time`,

      // 커넥션 풀 상태
      getConnectionPoolStatus(),

      // 테이블 개수 확인 (스키마 유효성)
      prisma.$queryRaw`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `,

      // 활성 연결 수 확인 (PostgreSQL)
      prisma.$queryRaw`
        SELECT COUNT(*) as active_connections
        FROM pg_stat_activity
        WHERE state = 'active'
      `.catch(() => ({ active_connections: 'unknown' }))
    ]);

    const responseTime = Date.now() - startTime;
    const poolMetrics = getConnectionPoolMetrics();

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      database: {
        connected: true,
        serverTime: basicCheck[0]?.server_time,
        tableCount: Number(tableCount[0]?.table_count) || 0,
        activeConnections: activeConnections[0]?.active_connections || 'unknown',
      },
      connectionPool: {
        status: poolStatus.status,
        metrics: poolMetrics,
        performance: {
          avgQueryTime: poolStatus.avgQueryTime,
          totalTime: poolStatus.totalTime,
          warning: poolStatus.warning,
        },
      },
      performance: {
        responseTime,
        status: responseTime < 1000 ? 'good' : responseTime < 3000 ? 'moderate' : 'slow',
      },
    };

    // 경고 조건 확인
    const warnings = [];
    if (responseTime > 2000) {
      warnings.push('High database response time');
    }
    if (poolStatus.avgQueryTime > 1000) {
      warnings.push('High average query time');
    }
    if (poolStatus.warning) {
      warnings.push(poolStatus.warning);
    }

    if (warnings.length > 0) {
      healthData.warnings = warnings;
      healthData.status = 'degraded';
    }

    // 응답 형식에 따라 처리
    if (format === 'prometheus') {
      // Prometheus 메트릭 형식
      const metrics = [
        `# HELP database_response_time_ms Database response time in milliseconds`,
        `# TYPE database_response_time_ms gauge`,
        `database_response_time_ms ${responseTime}`,
        ``,
        `# HELP database_connection_pool_avg_query_time_ms Average query time in milliseconds`,
        `# TYPE database_connection_pool_avg_query_time_ms gauge`,
        `database_connection_pool_avg_query_time_ms ${poolStatus.avgQueryTime || 0}`,
        ``,
        `# HELP database_active_connections Number of active database connections`,
        `# TYPE database_active_connections gauge`,
        `database_active_connections ${activeConnections[0]?.active_connections || 0}`,
        ``,
        `# HELP database_table_count Number of tables in public schema`,
        `# TYPE database_table_count gauge`,
        `database_table_count ${healthData.database.tableCount}`,
        ``,
        `# HELP database_health Database health status (1=healthy, 0.5=degraded, 0=unhealthy)`,
        `# TYPE database_health gauge`,
        `database_health ${healthData.status === 'healthy' ? 1 : healthData.status === 'degraded' ? 0.5 : 0}`,
      ].join('\n');

      return new Response(metrics, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // JSON 형식 (기본)
    const statusCode = healthData.status === 'healthy' ? 200 :
                      healthData.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    console.error('Database health check failed:', error);

    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
      database: {
        connected: false,
        error: error.message,
      },
    };

    if (format === 'prometheus') {
      const metrics = [
        `# HELP database_health Database health status (1=healthy, 0.5=degraded, 0=unhealthy)`,
        `# TYPE database_health gauge`,
        `database_health 0`,
        ``,
        `# HELP database_error_total Total number of database errors`,
        `# TYPE database_error_total counter`,
        `database_error_total 1`,
      ].join('\n');

      return new Response(metrics, {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}

// POST 메서드로 강제 헬스체크 실행
export async function POST() {
  try {
    // 캐시 무시하고 강제로 새로운 연결 테스트
    await prisma.$disconnect();

    // 새 연결로 테스트
    const result = await prisma.$queryRaw`SELECT 'force_check' as status, NOW() as timestamp`;

    return NextResponse.json({
      status: 'healthy',
      message: 'Forced health check completed',
      result: result[0],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Forced health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      message: 'Forced health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}