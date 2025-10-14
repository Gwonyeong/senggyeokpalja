'use client';

import { useEffect, useState } from 'react';

export default function ConsultationManagement() {
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // 통계는 초기에 한 번만 로드
  useEffect(() => {
    fetchStats();
  }, []);

  // 테이블 데이터는 필터/정렬/페이지 변경 시 리로드
  useEffect(() => {
    fetchTableData();
  }, [page, filter, sortBy, sortOrder]);

  // 통계 데이터만 가져오는 함수
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '1', // 통계만 필요하므로 최소한의 데이터만
        filter: 'all'
      });

      const response = await fetch(`/api/admin/consultations?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('통계 로딩 실패:', error);
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  };

  // 테이블 데이터만 가져오는 함수
  const fetchTableData = async () => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        filter: filter,
        sortBy: sortBy,
        order: sortOrder
      });

      const response = await fetch(`/api/admin/consultations?${params}`);
      const data = await response.json();

      if (data.success) {
        setConsultations(data.consultations);
        setTotalPages(data.pagination.totalPages);
        // 필터가 변경되었을 때만 통계 업데이트
        if (filter !== 'all' || !stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('상세리포트 목록 로딩 실패:', error);
    } finally {
      setTableLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num || 0);
  };

  return (
    <div className="report-management">
      <div className="management-header">
        <h2>상세리포트 관리</h2>
      </div>

      {statsLoading ? (
        <div className="loading-container">
          <p>상세리포트 통계를 불러오는 중...</p>
        </div>
      ) : (
        <>
          {stats && (
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-label">전체 상세리포트</span>
                <span className="stat-value">{formatNumber(stats.total)}건</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">결제 완료</span>
                <span className="stat-value paid">{formatNumber(stats.paid)}건</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">미결제</span>
                <span className="stat-value unpaid">{formatNumber(stats.unpaid)}건</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">총 매출</span>
                <span className="stat-value revenue">{formatCurrency(stats.totalRevenue)}</span>
              </div>
            </div>
          )}

          {stats && stats.monthlyRevenue && (
            <div className="revenue-chart">
              <h3>월별 매출 추이</h3>
              <div className="chart-container">
                {stats.monthlyRevenue.map((month, index) => (
                  <div key={index} className="month-item">
                    <div className="month-bar-wrapper">
                      <div
                        className="month-bar"
                        style={{
                          height: `${(month.revenue / Math.max(...stats.monthlyRevenue.map(m => m.revenue)) * 100) || 5}%`
                        }}
                      >
                        <span className="month-revenue">{formatCurrency(month.revenue)}</span>
                      </div>
                    </div>
                    <span className="month-label">{month.month}</span>
                    <span className="month-count">{month.count}건</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="table-controls">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => { setFilter('all'); setPage(1); }}
              >
                전체
              </button>
              <button
                className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
                onClick={() => { setFilter('paid'); setPage(1); }}
              >
                결제 완료
              </button>
              <button
                className={`filter-btn ${filter === 'unpaid' ? 'active' : ''}`}
                onClick={() => { setFilter('unpaid'); setPage(1); }}
              >
                미결제
              </button>
            </div>

            <div className="sort-controls">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setPage(1);
                }}
                className="sort-select"
              >
                <option value="createdAt-desc">신청일 최신순</option>
                <option value="createdAt-asc">신청일 오래된순</option>
                <option value="paidAt-desc">결제일 최신순</option>
                <option value="paidAt-asc">결제일 오래된순</option>
                <option value="birthDate-desc">생년월일 최신순</option>
                <option value="birthDate-asc">생년월일 오래된순</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            {tableLoading ? (
              <div className="table-loading">
                <p>데이터를 불러오는 중...</p>
              </div>
            ) : (
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>사용자</th>
                    <th>입력한 생년월일</th>
                    <th>결제 상태</th>
                    <th>결제 금액</th>
                    <th>결제일</th>
                    <th>신청일</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td>{consultation.user.email}</td>
                    <td>
                      {consultation.birthDate
                        ? new Date(consultation.birthDate).toLocaleDateString('ko-KR')
                        : '-'}
                      {consultation.lunarCalendar && ' (음)'}
                    </td>
                    <td>
                      {consultation.isPaid ? (
                        <span className="status-badge paid">결제완료</span>
                      ) : (
                        <span className="status-badge unpaid">미결제</span>
                      )}
                    </td>
                    <td>{consultation.isPaid ? formatCurrency(consultation.paymentAmount) : '-'}</td>
                    <td>{formatDate(consultation.paidAt)}</td>
                    <td>{formatDate(consultation.createdAt)}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="page-btn"
            >
              이전
            </button>
            <span className="page-info">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="page-btn"
            >
              다음
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .report-management {
          padding: 20px 0;
        }

        .management-header {
          margin-bottom: 30px;
        }

        .management-header h2 {
          margin: 0;
          color: #d4af37;
          font-size: 24px;
        }

        .table-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sort-select {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .sort-select:focus {
          outline: none;
          border-color: rgba(212, 175, 55, 0.6);
        }

        .sort-select option {
          background: #1a1a1a;
          color: #fff;
        }

        .filter-btn {
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #999;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: rgba(212, 175, 55, 0.5);
        }

        .filter-btn.active {
          background: rgba(212, 175, 55, 0.2);
          border-color: #d4af37;
          color: #d4af37;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          color: #999;
          font-size: 14px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #fff;
        }

        .stat-value.paid {
          color: #4caf50;
        }

        .stat-value.unpaid {
          color: #ff9800;
        }

        .stat-value.revenue {
          color: #d4af37;
        }

        .revenue-chart {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .revenue-chart h3 {
          margin: 0 0 20px 0;
          color: #d4af37;
          font-size: 16px;
        }

        .chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 200px;
          gap: 15px;
        }

        .month-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .month-bar-wrapper {
          width: 100%;
          height: 150px;
          display: flex;
          align-items: flex-end;
        }

        .month-bar {
          width: 100%;
          background: linear-gradient(to top, #d4af37, #f4e4bc);
          border-radius: 4px 4px 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 8px;
          position: relative;
        }

        .month-revenue {
          font-size: 10px;
          color: #0a0a0a;
          font-weight: bold;
          text-align: center;
          word-break: break-all;
        }

        .month-label {
          font-size: 11px;
          color: #999;
        }

        .month-count {
          font-size: 10px;
          color: #777;
        }

        .table-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 30px;
        }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
        }

        .reports-table thead {
          background: rgba(212, 175, 55, 0.1);
        }

        .reports-table th {
          padding: 12px;
          text-align: left;
          font-weight: 500;
          color: #d4af37;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .reports-table td {
          padding: 12px;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .reports-table tbody tr:hover {
          background: rgba(212, 175, 55, 0.05);
        }


        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.paid {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .status-badge.unpaid {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }

        .page-btn {
          padding: 8px 16px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #d4af37;
          cursor: pointer;
          transition: background 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.2);
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          color: #999;
        }

        .loading-container {
          padding: 40px;
          text-align: center;
          color: #999;
        }

        .table-loading {
          padding: 60px;
          text-align: center;
          color: #999;
        }

        @media (max-width: 1200px) {
          .stats-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .table-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .filter-buttons {
            width: 100%;
            justify-content: space-between;
          }

          .sort-controls {
            width: 100%;
          }

          .sort-select {
            width: 100%;
          }

          .stats-summary {
            grid-template-columns: 1fr 1fr;
          }

          .chart-container {
            height: 150px;
            gap: 8px;
          }

          .month-revenue {
            font-size: 9px;
          }

          .table-container {
            overflow-x: auto;
          }

          .reports-table {
            min-width: 700px;
          }
        }
      `}</style>
    </div>
  );
}