'use client';

import { useEffect, useState } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [provider, setProvider] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm, provider]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        provider: provider
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('사용자 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>사용자 관리</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="이메일 또는 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="provider-select"
          >
            <option value="">전체 제공자</option>
            <option value="google">Google</option>
            <option value="naver">Naver</option>
            <option value="kakao">Kakao</option>
          </select>
          <button type="submit" className="search-btn">검색</button>
        </form>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>사용자 목록을 불러오는 중...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>이메일</th>
                  <th>이름</th>
                  <th>제공자</th>
                  <th>가입일</th>
                  <th>마지막 분석</th>
                  <th>분석 수</th>
                  <th>상담 수</th>
                  <th>유료 상담</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.displayName || '-'}</td>
                    <td>
                      <span className={`provider-badge ${user.provider}`}>
                        {user.provider || 'unknown'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{user.lastAnalysis ? formatDate(user.lastAnalysis) : '-'}</td>
                    <td className="text-center">{user._count.analysisResults}</td>
                    <td className="text-center">{user._count.consultationResults}</td>
                    <td className="text-center">
                      {user.hasPaidConsultation ? (
                        <span className="paid-badge">✓</span>
                      ) : (
                        <span className="unpaid-badge">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        .user-management {
          padding: 20px 0;
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .management-header h2 {
          margin: 0;
          color: #d4af37;
          font-size: 24px;
        }

        .search-form {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-input {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #fff;
          width: 250px;
        }

        .search-input::placeholder {
          color: #777;
        }

        .provider-select {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #fff;
        }

        .search-btn {
          padding: 8px 20px;
          background: #d4af37;
          border: none;
          border-radius: 6px;
          color: #0a0a0a;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .search-btn:hover {
          opacity: 0.8;
        }

        .table-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 30px;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table thead {
          background: rgba(212, 175, 55, 0.1);
        }

        .users-table th {
          padding: 12px;
          text-align: left;
          font-weight: 500;
          color: #d4af37;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .users-table td {
          padding: 12px;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .users-table tbody tr:hover {
          background: rgba(212, 175, 55, 0.05);
        }

        .provider-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .provider-badge.google {
          background: rgba(66, 133, 244, 0.2);
          color: #4285f4;
        }

        .provider-badge.naver {
          background: rgba(3, 199, 90, 0.2);
          color: #03c75a;
        }

        .provider-badge.kakao {
          background: rgba(255, 235, 0, 0.2);
          color: #fee500;
        }

        .provider-badge.unknown {
          background: rgba(255, 255, 255, 0.1);
          color: #999;
        }

        .text-center {
          text-align: center;
        }

        .paid-badge {
          color: #4caf50;
          font-weight: bold;
        }

        .unpaid-badge {
          color: #777;
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

        @media (max-width: 768px) {
          .management-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-form {
            flex-direction: column;
          }

          .search-input,
          .provider-select {
            width: 100%;
          }

          .table-container {
            overflow-x: auto;
          }

          .users-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
}