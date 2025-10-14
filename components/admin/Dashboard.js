'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('통계 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>대시보드를 불러오는 중...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-error">
        <p>통계를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num || 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount || 0);
  };

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">👥</span>
            <h3>사용자</h3>
          </div>
          <div className="stat-value">{formatNumber(stats.users.total)}</div>
          <div className="stat-detail">
            오늘 가입: <strong>{stats.users.today}</strong>명<br />
            이번 주 가입: <strong>{stats.users.week || 0}</strong>명
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💬</span>
            <h3>상세리포트</h3>
          </div>
          <div className="stat-value">{formatNumber(stats.consultations.total)}</div>
          <div className="stat-detail">
            오늘: <strong>{stats.consultations.today}</strong> |
            유료: <strong>{stats.consultations.paid}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <h3>매출</h3>
          </div>
          <div className="stat-value">{formatCurrency(stats.revenue.total)}</div>
          <div className="stat-detail">
            오늘: <strong>{formatCurrency(stats.revenue.today)}</strong>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>사용자 증가 추이 (최근 7일)</h3>
          <div className="simple-chart">
            {stats.charts.userGrowth.map((day, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar" style={{
                  height: `${(day.count / Math.max(...stats.charts.userGrowth.map(d => d.count)) * 100) || 5}%`
                }}>
                  <span className="chart-value">{day.count}</span>
                </div>
                <span className="chart-label">{day.date.substring(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 20px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 24px;
          transition: transform 0.2s, border-color 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 175, 55, 0.4);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-icon {
          font-size: 24px;
        }

        .stat-header h3 {
          margin: 0;
          font-size: 14px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #d4af37;
          margin-bottom: 8px;
        }

        .stat-detail {
          font-size: 13px;
          color: #777;
        }

        .stat-detail strong {
          color: #fff;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 24px;
        }

        .chart-card h3 {
          margin: 0 0 20px 0;
          font-size: 16px;
          color: #d4af37;
        }

        .simple-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 150px;
          gap: 10px;
        }

        .chart-bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .chart-bar {
          width: 100%;
          background: linear-gradient(to top, #d4af37, #f4e4bc);
          border-radius: 4px 4px 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 8px;
          position: relative;
          min-height: 20px;
        }

        .chart-value {
          font-size: 11px;
          color: #0a0a0a;
          font-weight: bold;
        }

        .chart-label {
          font-size: 11px;
          color: #777;
        }


        .dashboard-loading,
        .dashboard-error {
          padding: 40px;
          text-align: center;
          color: #999;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .simple-chart {
            height: 120px;
          }
        }
      `}</style>
    </div>
  );
}