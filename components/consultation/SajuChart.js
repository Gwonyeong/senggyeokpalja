"use client";

import { useState, useEffect } from "react";
import {
  calculateSinsalFromConsultation,
  enrichSinsalData,
} from "../../lib/saju-utils";

export default function SajuChart({ consultation }) {
  const [sinsalData, setSinsalData] = useState({});
  const [sinsalJsonData, setSinsalJsonData] = useState([]);

  // 신살 JSON 데이터 로드
  useEffect(() => {
    const loadSinsalData = async () => {
      try {
        const response = await fetch("/documents/신살_풀패키지.json");
        const jsonData = await response.json();
        setSinsalJsonData(jsonData);
      } catch (error) {
        console.error("신살 데이터 로드 실패:", error);
      }
    };

    loadSinsalData();
  }, []);

  // 신살 계산
  useEffect(() => {
    if (!consultation || sinsalJsonData.length === 0) return;

    try {
      const calculatedSinsal = calculateSinsalFromConsultation(consultation);
      const enrichedSinsal = enrichSinsalData(calculatedSinsal, sinsalJsonData);
      setSinsalData(enrichedSinsal);
    } catch (error) {
      console.error("신살 계산 오류:", error);
    }
  }, [consultation, sinsalJsonData]);

  if (!consultation) {
    return (
      <div className="saju-chart-container">
        <p>사주 데이터를 불러오는 중...</p>
      </div>
    );
  }

  const {
    yearStem,
    yearBranch,
    monthStem,
    monthBranch,
    dayStem,
    dayBranch,
    timeStem,
    timeBranch,
  } = consultation;

  // 십성 데이터 추출 (천간 기준)
  const extractTenGodsForStem = (stem) => {
    if (!stem || !dayStem) return "-";

    // 일간과 같은 경우 비견
    if (stem === dayStem) return "비견";

    // 완전한 십성 매핑 테이블
    const tenGodMapping = {
      甲: {
        乙: "겁재",
        丙: "식신",
        丁: "상관",
        戊: "편재",
        己: "정재",
        庚: "편관",
        辛: "정관",
        壬: "편인",
        癸: "정인",
      },
      乙: {
        甲: "겁재",
        丙: "상관",
        丁: "식신",
        戊: "정재",
        己: "편재",
        庚: "정관",
        辛: "편관",
        壬: "정인",
        癸: "편인",
      },
      丙: {
        甲: "편인",
        乙: "정인",
        丁: "겁재",
        戊: "식신",
        己: "상관",
        庚: "편재",
        辛: "정재",
        壬: "편관",
        癸: "정관",
      },
      丁: {
        甲: "정인",
        乙: "편인",
        丙: "겁재",
        戊: "상관",
        己: "식신",
        庚: "정재",
        辛: "편재",
        壬: "정관",
        癸: "편관",
      },
      戊: {
        甲: "편관",
        乙: "정관",
        丙: "편인",
        丁: "정인",
        己: "겁재",
        庚: "식신",
        辛: "상관",
        壬: "편재",
        癸: "정재",
      },
      己: {
        甲: "정관",
        乙: "편관",
        丙: "정인",
        丁: "편인",
        戊: "겁재",
        庚: "상관",
        辛: "식신",
        壬: "정재",
        癸: "편재",
      },
      庚: {
        甲: "편재",
        乙: "정재",
        丙: "편관",
        丁: "정관",
        戊: "편인",
        己: "정인",
        辛: "겁재",
        壬: "식신",
        癸: "상관",
      },
      辛: {
        甲: "정재",
        乙: "편재",
        丙: "정관",
        丁: "편관",
        戊: "정인",
        己: "편인",
        庚: "겁재",
        壬: "상관",
        癸: "식신",
      },
      壬: {
        甲: "식신",
        乙: "상관",
        丙: "편재",
        丁: "정재",
        戊: "편관",
        己: "정관",
        庚: "편인",
        辛: "정인",
        癸: "겁재",
      },
      癸: {
        甲: "상관",
        乙: "식신",
        丙: "정재",
        丁: "편재",
        戊: "정관",
        己: "편관",
        庚: "정인",
        辛: "편인",
        壬: "겁재",
      },
    };

    return tenGodMapping[dayStem]?.[stem] || "-";
  };

  // 지지 십성 추출 (지지의 본기 십성 계산)
  const extractTenGodsForBranch = (branch) => {
    if (!branch || !dayStem) return "-";

    // 지지의 본기(장생) 매핑
    const branchToStemMapping = {
      子: "癸",
      丑: "己",
      寅: "甲",
      卯: "乙",
      辰: "戊",
      巳: "丙",
      午: "丁",
      未: "己",
      申: "庚",
      酉: "辛",
      戌: "戊",
      亥: "壬",
    };

    const branchMainStem = branchToStemMapping[branch];
    if (!branchMainStem) return "-";

    // 지지의 본기로 십성 계산
    return extractTenGodsForStem(branchMainStem);
  };

  // 신살 데이터 추출 (안전한 문자열 반환)
  const extractSinsal = () => {
    if (!sinsalData || Object.keys(sinsalData).length === 0) return "-";

    try {
      // 첫 번째 신살의 이름만 안전하게 추출
      const sinsalNames = Object.keys(sinsalData);
      if (sinsalNames.length > 0) {
        const firstSinsalName = sinsalNames[0];
        const firstSinsal = sinsalData[firstSinsalName];

        // 신살 정보에서 이름 추출
        if (firstSinsal && typeof firstSinsal === "object") {
          if (firstSinsal.info && firstSinsal.info.name_kr) {
            return String(firstSinsal.info.name_kr);
          }
          return String(firstSinsalName);
        }
        return String(firstSinsalName);
      }
      return "-";
    } catch (error) {
      console.error("신살 추출 오류:", error);
      return "-";
    }
  };

  // 천간과 지지의 한글 음 매핑
  const stemToKorean = {
    甲: "갑",
    乙: "을",
    丙: "병",
    丁: "정",
    戊: "무",
    己: "기",
    庚: "경",
    辛: "신",
    壬: "임",
    癸: "계",
  };

  const branchToKorean = {
    子: "자",
    丑: "축",
    寅: "인",
    卯: "묘",
    辰: "진",
    巳: "사",
    午: "오",
    未: "미",
    申: "신",
    酉: "유",
    戌: "술",
    亥: "해",
  };

  // 한자와 한글음을 함께 표시하는 함수
  const formatStemWithKorean = (stem) => {
    if (!stem || stem === "-") return "-";
    const korean = stemToKorean[stem];
    return korean ? `${stem}(${korean})` : stem;
  };

  const formatBranchWithKorean = (branch) => {
    if (!branch || branch === "-") return "-";
    const korean = branchToKorean[branch];
    return korean ? `${branch}(${korean})` : branch;
  };

  const chartData = [
    {
      position: "생시",
      sipseong_top: extractTenGodsForStem(timeStem),
      cheongan: formatStemWithKorean(timeStem),
      jiji: formatBranchWithKorean(timeBranch),
      sipseong_bottom: extractTenGodsForBranch(timeBranch),
      sinsal: extractSinsal(),
    },
    {
      position: "생일",
      sipseong_top: extractTenGodsForStem(dayStem),
      cheongan: formatStemWithKorean(dayStem),
      jiji: formatBranchWithKorean(dayBranch),
      sipseong_bottom: extractTenGodsForBranch(dayBranch),
      sinsal: extractSinsal(),
    },
    {
      position: "생월",
      sipseong_top: extractTenGodsForStem(monthStem),
      cheongan: formatStemWithKorean(monthStem),
      jiji: formatBranchWithKorean(monthBranch),
      sipseong_bottom: extractTenGodsForBranch(monthBranch),
      sinsal: extractSinsal(),
    },
    {
      position: "생년",
      sipseong_top: extractTenGodsForStem(yearStem),
      cheongan: formatStemWithKorean(yearStem),
      jiji: formatBranchWithKorean(yearBranch),
      sipseong_bottom: extractTenGodsForBranch(yearBranch),
      sinsal: extractSinsal(),
    },
  ];

  // 생년월일 포맷팅
  const formatBirthDate = (birthDate) => {
    if (!birthDate) return "";
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // 사용자 이름 추출 (additional_data의 name 사용)
  const userName = consultation?.additionalData?.name || "고객";
  return (
    <div className="saju-chart-container">
      {/* 제목과 생년월일 */}
      <div className="chart-header">
        <h3 className="chart-title">{userName}님의 사주원국표</h3>
        <p className="birth-date">{formatBirthDate(consultation?.birthDate)}</p>
      </div>

      <div className="saju-chart">
        <table className="saju-table">
          <thead>
            <tr>
              <th></th>
              {chartData.map((col, index) => (
                <th key={index} className="position-header">
                  {col.position}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="sipseong-row">
              <td className="row-label">십성</td>
              {chartData.map((col, index) => (
                <td key={index} className="sipseong-cell">
                  {col.sipseong_top}
                </td>
              ))}
            </tr>
            <tr className="cheongan-row">
              <td className="row-label">천간</td>
              {chartData.map((col, index) => (
                <td key={index} className="cheongan-cell">
                  {col.cheongan}
                </td>
              ))}
            </tr>
            <tr className="jiji-row">
              <td className="row-label">지지</td>
              {chartData.map((col, index) => (
                <td key={index} className="jiji-cell">
                  {col.jiji}
                </td>
              ))}
            </tr>
            <tr className="sipseong-row">
              <td className="row-label">십성</td>
              {chartData.map((col, index) => (
                <td key={index} className="sipseong-cell">
                  {col.sipseong_bottom}
                </td>
              ))}
            </tr>
            <tr className="sinsal-row">
              <td className="row-label">신살</td>
              {chartData.map((col, index) => (
                <td key={index} className="sinsal-cell">
                  {col.sinsal}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .saju-chart-container {
          margin: 20px 0;
          padding: 20px;
          background: rgba(212, 175, 55, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.1);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.1);
        }

        .chart-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .chart-title {
          color: #d4af37;
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          font-family: "Noto Serif KR", serif;
        }

        .birth-date {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin: 0;
          font-weight: 500;
        }

        .saju-chart {
          overflow-x: auto;
        }

        .saju-table {
          width: 100%;
          border-collapse: collapse;
          background: #131316;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .saju-table th,
        .saju-table td {
          padding: 12px 8px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 500;
        }

        .saju-table th {
          background: linear-gradient(135deg, #2a2a2e 0%, #1a1a1e 100%);
          color: #d4af37;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .position-header {
          font-size: 1rem;
          font-weight: 700;
        }

        .row-label {
          background: linear-gradient(135deg, #2a2a2e 0%, #1a1a1e 100%);
          color: #d4af37;
          font-weight: 600;
          font-size: 0.9rem;
          min-width: 60px;
          border-right: 2px solid #d4af37;
        }

        .sipseong-cell {
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cheongan-cell {
          background: rgba(212, 175, 55, 0.08);
          color: #d4af37;
          font-weight: 700;
          font-size: 1.1rem;
          border: 1px solid rgba(212, 175, 55, 0.15);
        }

        .jiji-cell {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 700;
          font-size: 1.1rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .sinsal-cell {
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          font-size: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 768px) {
          .saju-chart-container {
            padding: 15px;
            margin: 15px 0;
          }

          .saju-table th,
          .saju-table td {
            padding: 8px 4px;
            font-size: 0.8rem;
          }

          .cheongan-cell,
          .jiji-cell {
            font-size: 1rem;
          }

          .sinsal-cell {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
