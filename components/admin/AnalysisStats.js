'use client';

import { useEffect, useState } from 'react';

export default function AnalysisStats() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analyses?type=${activeTab}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('분석 통계 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num || 0);
  };

  return (
    <div className="analysis-stats">
      <div className="stats-header">
        <h2>분석 통계</h2>
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            전체 통계
          </button>
          <button
            className={`tab-btn ${activeTab === 'synergy' ? 'active' : ''}`}
            onClick={() => setActiveTab('synergy')}
          >
            궁합 분석
          </button>
          <button
            className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            최근 분석
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>통계를 불러오는 중...</p>
        </div>
      ) : (
        <div className="stats-content">
          {activeTab === 'overview' && data && (
            <div className="overview-stats">
              <div className="summary-cards">
                <div className="summary-card">
                  <h3>전체 분석</h3>
                  <div className="summary-value">{formatNumber(data.totalAnalyses)}</div>
                </div>
                <div className="summary-card">
                  <h3>궁합 분석</h3>
                  <div className="summary-value">{formatNumber(data.totalSynergies)}</div>
                </div>
              </div>

              <div className="distribution-grid">
                <div className="distribution-card">
                  <h3>MBTI 분포</h3>
                  <div className="distribution-list">
                    {data.mbtiDistribution.slice(0, 8).map((item, index) => (
                      <div key={index} className="distribution-item">
                        <span className="item-label">{item.type}</span>
                        <div className="item-bar">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${(item.count / data.mbtiDistribution[0].count * 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="item-count">{formatNumber(item.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="distribution-card">
                  <h3>팔자 유형 분포</h3>
                  <div className="distribution-list">
                    {data.paljaDistribution.slice(0, 5).map((item, index) => (
                      <div key={index} className="distribution-item">
                        <span className="item-label">{item.type}</span>
                        <div className="item-bar">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${(item.count / data.paljaDistribution[0].count * 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="item-count">{formatNumber(item.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="distribution-card">
                  <h3>달력 사용 비율</h3>
                  <div className="calendar-stats">
                    {data.calendarDistribution.map((item, index) => (
                      <div key={index} className="calendar-item">
                        <span className="calendar-type">{item.type}</span>
                        <div className="calendar-percentage">
                          {((item.count / data.totalAnalyses) * 100).toFixed(1)}%
                        </div>
                        <div className="calendar-count">{formatNumber(item.count)}건</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="distribution-card">
                  <h3>시간대별 분석 패턴</h3>
                  <div className="hourly-chart">
                    {data.hourlyPattern.map((hour, index) => (
                      <div key={index} className="hour-bar-wrapper">
                        <div
                          className="hour-bar"
                          style={{
                            height: `${(hour.count / Math.max(...data.hourlyPattern.map(h => h.count)) * 100) || 5}%`
                          }}
                        >
                          <span className="hour-count">{hour.count}</span>
                        </div>
                        <span className="hour-label">{index % 3 === 0 ? hour.hour : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'synergy' && data && (
            <div className="synergy-stats">
              <div className="summary-cards">
                <div className="summary-card">
                  <h3>전체 궁합 분석</h3>
                  <div className="summary-value">{formatNumber(data.total)}</div>
                </div>
                <div className="summary-card">
                  <h3>평균 궁합 점수</h3>
                  <div className="summary-value">{data.averageScore.toFixed(1)}점</div>
                </div>
              </div>

              <div className="synergy-grid">
                <div className="synergy-card">
                  <h3>점수 분포</h3>
                  <div className="score-distribution">
                    {data.scoreDistribution.map((range, index) => (
                      <div key={index} className="score-range">
                        <span className="range-label">{range.range}점</span>
                        <div className="range-bar">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${(range.count / Math.max(...data.scoreDistribution.map(r => r.count)) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="range-count">{formatNumber(range.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="synergy-card">
                  <h3>인기 조합 TOP 10</h3>
                  <div className="combination-list">
                    {data.popularCombinations.map((combo, index) => (
                      <div key={index} className="combination-item">
                        <span className="combo-rank">{index + 1}</span>
                        <span className="combo-types">
                          {combo.userType} ❤️ {combo.partnerType}
                        </span>
                        <span className="combo-count">{formatNumber(combo.count)}회</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recent' && data && (
            <div className="recent-analyses">
              <div className="table-container">
                <table className="analyses-table">
                  <thead>
                    <tr>
                      <th>사용자</th>
                      <th>성격 유형</th>
                      <th>MBTI</th>
                      <th>팔자</th>
                      <th>생년월일</th>
                      <th>달력</th>
                      <th>분석일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.analyses.map((analysis) => (
                      <tr key={analysis.id}>
                        <td>{analysis.user.email}</td>
                        <td>{analysis.personalityType}</td>
                        <td>{analysis.mbtiType || '-'}</td>
                        <td>{analysis.paljaType || '-'}</td>
                        <td>
                          {analysis.birthDate
                            ? new Date(analysis.birthDate).toLocaleDateString('ko-KR')
                            : '-'}
                        </td>
                        <td>{analysis.lunarCalendar ? '음력' : '양력'}</td>
                        <td>
                          {new Date(analysis.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .analysis-stats {
          padding: 20px 0;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .stats-header h2 {
          margin: 0;
          color: #d4af37;
          font-size: 24px;
        }

        .tab-nav {
          display: flex;
          gap: 10px;
        }

        .tab-btn {
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #999;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          border-color: rgba(212, 175, 55, 0.5);
        }

        .tab-btn.active {
          background: rgba(212, 175, 55, 0.2);
          border-color: #d4af37;
          color: #d4af37;
        }

        .loading-container {
          padding: 40px;
          text-align: center;
          color: #999;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #999;
          font-size: 14px;
        }

        .summary-value {
          font-size: 28px;
          font-weight: bold;
          color: #d4af37;
        }

        .distribution-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .synergy-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .distribution-card,
        .synergy-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 20px;
        }

        .distribution-card h3,
        .synergy-card h3 {
          margin: 0 0 20px 0;
          color: #d4af37;
          font-size: 16px;
        }

        .distribution-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .distribution-item,
        .score-range {
          display: grid;
          grid-template-columns: 100px 1fr 60px;
          align-items: center;
          gap: 10px;
        }

        .item-label,
        .range-label {
          font-size: 13px;
          color: #fff;
        }

        .item-bar,
        .range-bar {
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(to right, #d4af37, #f4e4bc);
          border-radius: 8px;
        }

        .item-count,
        .range-count {
          font-size: 12px;
          color: #999;
          text-align: right;
        }

        .calendar-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .calendar-item {
          text-align: center;
          padding: 15px;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 8px;
        }

        .calendar-type {
          display: block;
          font-size: 14px;
          color: #999;
          margin-bottom: 8px;
        }

        .calendar-percentage {
          font-size: 24px;
          font-weight: bold;
          color: #d4af37;
          margin-bottom: 4px;
        }

        .calendar-count {
          font-size: 12px;
          color: #777;
        }

        .hourly-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 120px;
          gap: 2px;
        }

        .hour-bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .hour-bar {
          width: 100%;
          background: linear-gradient(to top, #d4af37, #f4e4bc);
          border-radius: 2px 2px 0 0;
          position: relative;
        }

        .hour-count {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          color: #999;
        }

        .hour-label {
          font-size: 10px;
          color: #777;
        }

        .combination-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .combination-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
        }

        .combo-rank {
          width: 24px;
          height: 24px;
          background: #d4af37;
          color: #0a0a0a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
        }

        .combo-types {
          flex: 1;
          font-size: 14px;
        }

        .combo-count {
          font-size: 13px;
          color: #999;
        }

        .table-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          overflow: hidden;
        }

        .analyses-table {
          width: 100%;
          border-collapse: collapse;
        }

        .analyses-table thead {
          background: rgba(212, 175, 55, 0.1);
        }

        .analyses-table th {
          padding: 12px;
          text-align: left;
          font-weight: 500;
          color: #d4af37;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .analyses-table td {
          padding: 12px;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .analyses-table tbody tr:hover {
          background: rgba(212, 175, 55, 0.05);
        }

        @media (max-width: 1200px) {
          .distribution-grid,
          .synergy-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            align-items: stretch;
          }

          .tab-nav {
            width: 100%;
            justify-content: space-between;
          }

          .distribution-grid,
          .synergy-grid {
            grid-template-columns: 1fr;
          }

          .table-container {
            overflow-x: auto;
          }

          .analyses-table {
            min-width: 700px;
          }
        }
      `}</style>
    </div>
  );
}