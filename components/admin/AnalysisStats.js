'use client';

import { useEffect, useState } from 'react';

export default function AnalysisStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analyses?type=overview');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('팔자유형 검사 통계 로딩 실패:', error);
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
        <h2>팔자유형 검사 통계</h2>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>통계를 불러오는 중...</p>
        </div>
      ) : (
        <div className="stats-content">
          {data && (
            <div className="overview-stats">
              <div className="summary-cards">
                <div className="summary-card">
                  <h3>전체 팔자유형 검사</h3>
                  <div className="summary-value">{formatNumber(data.totalAnalyses)}</div>
                </div>
                <div className="summary-card">
                  <h3>궁합 검사</h3>
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

        .distribution-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 20px;
        }

        .distribution-card h3 {
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



        @media (max-width: 1200px) {
          .distribution-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            align-items: stretch;
          }

          .distribution-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}