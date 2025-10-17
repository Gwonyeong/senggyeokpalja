"use client";

import { useState, useEffect } from "react";

export default function UserInfoForm({
  initialData = {},
  onSubmit,
  isEditing = true,
  showButtons = true,
  onCancel,
  className = ""
}) {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "unknown",
    gender: "male",
    mbti: "",
    calendar: "solar",
    isLeapMonth: false,
    ...initialData
  });

  const [loading, setLoading] = useState(false);

  // initialData가 변경될 때 formData 업데이트
  useEffect(() => {
    if (initialData) {
      // birthDate를 년/월/일로 분리
      let year = "", month = "", day = "";
      if (initialData.birthDate) {
        const date = new Date(initialData.birthDate);
        year = date.getFullYear().toString();
        month = (date.getMonth() + 1).toString();
        day = date.getDate().toString();
      }

      // birthTime을 시간 인덱스로 변환
      let hour = "unknown";
      if (initialData.birthTime) {
        const time = new Date(initialData.birthTime);
        const timeHour = time.getUTCHours();
        const timeMinute = time.getUTCMinutes();

        // consultation/page.js와 동일한 시간 매핑 로직
        if (timeHour === 0 && timeMinute >= 30) hour = "0";
        else if (timeHour === 1 || (timeHour === 2 && timeMinute < 30)) hour = "0";
        else if ((timeHour === 2 && timeMinute >= 30) || (timeHour === 3 && timeMinute < 30)) hour = "1";
        else if ((timeHour === 3 && timeMinute >= 30) || (timeHour === 4 && timeMinute < 30)) hour = "1";
        else if ((timeHour === 4 && timeMinute >= 30) || (timeHour === 5 && timeMinute < 30)) hour = "2";
        else if ((timeHour === 5 && timeMinute >= 30) || (timeHour === 6 && timeMinute < 30)) hour = "2";
        else if ((timeHour === 6 && timeMinute >= 30) || (timeHour === 7 && timeMinute < 30)) hour = "3";
        else if ((timeHour === 7 && timeMinute >= 30) || (timeHour === 8 && timeMinute < 30)) hour = "3";
        else if ((timeHour === 8 && timeMinute >= 30) || (timeHour === 9 && timeMinute < 30)) hour = "4";
        else if ((timeHour === 9 && timeMinute >= 30) || (timeHour === 10 && timeMinute < 30)) hour = "4";
        else if ((timeHour === 10 && timeMinute >= 30) || (timeHour === 11 && timeMinute < 30)) hour = "5";
        else if ((timeHour === 11 && timeMinute >= 30) || (timeHour === 12 && timeMinute < 30)) hour = "5";
        else if ((timeHour === 12 && timeMinute >= 30) || (timeHour === 13 && timeMinute < 30)) hour = "6";
        else if ((timeHour === 13 && timeMinute >= 30) || (timeHour === 14 && timeMinute < 30)) hour = "6";
        else if ((timeHour === 14 && timeMinute >= 30) || (timeHour === 15 && timeMinute < 30)) hour = "7";
        else if ((timeHour === 15 && timeMinute >= 30) || (timeHour === 16 && timeMinute < 30)) hour = "7";
        else if ((timeHour === 16 && timeMinute >= 30) || (timeHour === 17 && timeMinute < 30)) hour = "8";
        else if ((timeHour === 17 && timeMinute >= 30) || (timeHour === 18 && timeMinute < 30)) hour = "8";
        else if ((timeHour === 18 && timeMinute >= 30) || (timeHour === 19 && timeMinute < 30)) hour = "9";
        else if ((timeHour === 19 && timeMinute >= 30) || (timeHour === 20 && timeMinute < 30)) hour = "9";
        else if ((timeHour === 20 && timeMinute >= 30) || (timeHour === 21 && timeMinute < 30)) hour = "10";
        else if ((timeHour === 21 && timeMinute >= 30) || (timeHour === 22 && timeMinute < 30)) hour = "10";
        else if ((timeHour === 22 && timeMinute >= 30) || (timeHour === 23 && timeMinute < 30)) hour = "11";
        else if (timeHour === 23 && timeMinute >= 30) hour = "0";
        else hour = "6"; // 기본값
      }

      setFormData({
        name: initialData.name || "",
        year,
        month,
        day,
        hour,
        gender: initialData.gender || "male",
        mbti: initialData.mbti || "",
        calendar: initialData.calendar || "solar",
        isLeapMonth: initialData.isLeapMonth || false,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    setLoading(true);
    try {
      // 생년월일을 ISO 문자열로 변환
      const birthDate = formData.year && formData.month && formData.day
        ? new Date(formData.year, formData.month - 1, formData.day).toISOString().split('T')[0]
        : null;

      // 생시를 시간 문자열로 변환
      let birthTime = null;
      if (formData.hour !== "unknown") {
        const timeMapping = {
          "0": "01:00", // 자시 (23:30~01:29의 중간)
          "1": "02:30", // 축시 (01:30~03:29의 중간)
          "2": "04:30", // 인시 (03:30~05:29의 중간)
          "3": "06:30", // 묘시 (05:30~07:29의 중간)
          "4": "08:30", // 진시 (07:30~09:29의 중간)
          "5": "10:30", // 사시 (09:30~11:29의 중간)
          "6": "12:30", // 오시 (11:30~13:29의 중간)
          "7": "14:30", // 미시 (13:30~15:29의 중간)
          "8": "16:30", // 신시 (15:30~17:29의 중간)
          "9": "18:30", // 유시 (17:30~19:29의 중간)
          "10": "20:30", // 술시 (19:30~21:29의 중간)
          "11": "22:30", // 해시 (21:30~23:29의 중간)
        };
        birthTime = timeMapping[formData.hour];
      }

      const submitData = {
        name: formData.name,
        birthDate,
        birthTime,
        gender: formData.gender,
        mbti: formData.mbti,
        calendar: formData.calendar,
        isLeapMonth: formData.isLeapMonth,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`analyzer-form ${className}`}>
      <div className="form-section">
        <div className="input-group">
          {!isEditing && <label htmlFor="name">이름</label>}
          {isEditing ? (
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="이름을 입력해주세요"
              required
              autoComplete="name"
            />
          ) : (
            <div className="form-display-value">{formData.name || "-"}</div>
          )}
        </div>
      </div>

      <div className="form-section">
        <div className="input-group">
          {!isEditing && <label>생년월일</label>}
          {isEditing ? (
            <div className="date-picker-container">
              <select
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                required
                autoComplete="bday-year"
              >
                <option value="">년</option>
                {Array.from({ length: 124 }, (_, i) => 2024 - i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
              <select
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
                required
                autoComplete="bday-month"
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                  (month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  )
                )}
              </select>
              <select
                value={formData.day}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value })
                }
                required
                autoComplete="bday-day"
              >
                <option value="">일</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(
                  (day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  )
                )}
              </select>
            </div>
          ) : (
            <div className="form-display-value">
              {formData.year && formData.month && formData.day
                ? `${formData.year}년 ${formData.month}월 ${formData.day}일`
                : "-"
              }
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <div className="input-group">
          {!isEditing && <label>태어난 시간</label>}
          {isEditing ? (
            <select
              value={formData.hour}
              onChange={(e) =>
                setFormData({ ...formData, hour: e.target.value })
              }
            >
              <option value="unknown">⏰ 시간을 몰라요</option>
              <option value="0">🐭 23:30 ~ 01:29 (자시)</option>
              <option value="1">🐮 01:30 ~ 03:29 (축시)</option>
              <option value="2">🐯 03:30 ~ 05:29 (인시)</option>
              <option value="3">🐰 05:30 ~ 07:29 (묘시)</option>
              <option value="4">🐲 07:30 ~ 09:29 (진시)</option>
              <option value="5">🐍 09:30 ~ 11:29 (사시)</option>
              <option value="6">🐴 11:30 ~ 13:29 (오시)</option>
              <option value="7">🐑 13:30 ~ 15:29 (미시)</option>
              <option value="8">🐵 15:30 ~ 17:29 (신시)</option>
              <option value="9">🐔 17:30 ~ 19:29 (유시)</option>
              <option value="10">🐶 19:30 ~ 21:29 (술시)</option>
              <option value="11">🐷 21:30 ~ 23:29 (해시)</option>
            </select>
          ) : (
            <div className="form-display-value">
              {formData.hour !== "unknown" ? {
                "0": "🐭 자시 (23:30~01:29)",
                "1": "🐮 축시 (01:30~03:29)",
                "2": "🐯 인시 (03:30~05:29)",
                "3": "🐰 묘시 (05:30~07:29)",
                "4": "🐲 진시 (07:30~09:29)",
                "5": "🐍 사시 (09:30~11:29)",
                "6": "🐴 오시 (11:30~13:29)",
                "7": "🐑 미시 (13:30~15:29)",
                "8": "🐵 신시 (15:30~17:29)",
                "9": "🐔 유시 (17:30~19:29)",
                "10": "🐶 술시 (19:30~21:29)",
                "11": "🐷 해시 (21:30~23:29)",
              }[formData.hour] : "⏰ 시간을 몰라요"}
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <div className="form-row">
          <div className="input-group">
            {!isEditing && <label>성별</label>}
            {isEditing ? (
              <div className="radio-group">
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value,
                    })
                  }
                  autoComplete="sex"
                />
                <label htmlFor="male">남자</label>
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value,
                    })
                  }
                  autoComplete="sex"
                />
                <label htmlFor="female">여자</label>
              </div>
            ) : (
              <div className="form-display-value">
                {formData.gender === "male" ? "남자" : "여자"}
              </div>
            )}
          </div>
          <div className="input-group">
            {!isEditing && <label>양력/음력</label>}
            {isEditing ? (
              <div className="radio-group">
                <input
                  type="radio"
                  id="solar"
                  name="calendar"
                  value="solar"
                  checked={formData.calendar === "solar"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calendar: e.target.value,
                    })
                  }
                />
                <label htmlFor="solar">양력</label>
                <input
                  type="radio"
                  id="lunar"
                  name="calendar"
                  value="lunar"
                  checked={formData.calendar === "lunar"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calendar: e.target.value,
                    })
                  }
                />
                <label htmlFor="lunar">음력</label>
                {formData.calendar === "lunar" && (
                  <>
                    <input
                      type="checkbox"
                      id="isLeapMonth"
                      checked={formData.isLeapMonth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isLeapMonth: e.target.checked,
                        })
                      }
                      style={{ marginLeft: "10px" }}
                    />
                    <label htmlFor="isLeapMonth">윤달</label>
                  </>
                )}
              </div>
            ) : (
              <div className="form-display-value">
                {formData.calendar === "solar" ? "양력" : "음력"}
                {formData.calendar === "lunar" && formData.isLeapMonth && " (윤달)"}
              </div>
            )}
          </div>
        </div>
        <div className="input-group">
          {!isEditing && <label>MBTI</label>}
          {isEditing ? (
            <select
              value={formData.mbti}
              onChange={(e) =>
                setFormData({ ...formData, mbti: e.target.value })
              }
            >
              <option value="">모르겠어요</option>
              <option value="INTJ">INTJ - 전략가</option>
              <option value="INTP">INTP - 논리술사</option>
              <option value="ENTJ">ENTJ - 통솔자</option>
              <option value="ENTP">ENTP - 변론가</option>
              <option value="INFJ">INFJ - 옹호자</option>
              <option value="INFP">INFP - 중재자</option>
              <option value="ENFJ">ENFJ - 선도자</option>
              <option value="ENFP">ENFP - 활동가</option>
              <option value="ISTJ">ISTJ - 현실주의자</option>
              <option value="ISFJ">ISFJ - 수호자</option>
              <option value="ESTJ">ESTJ - 경영자</option>
              <option value="ESFJ">ESFJ - 집정관</option>
              <option value="ISTP">ISTP - 장인</option>
              <option value="ISFP">ISFP - 모험가</option>
              <option value="ESTP">ESTP - 사업가</option>
              <option value="ESFP">ESFP - 연예인</option>
            </select>
          ) : (
            <div className="form-display-value">
              {formData.mbti ? `${formData.mbti} - ${
                {
                  "INTJ": "전략가",
                  "INTP": "논리술사",
                  "ENTJ": "통솔자",
                  "ENTP": "변론가",
                  "INFJ": "옹호자",
                  "INFP": "중재자",
                  "ENFJ": "선도자",
                  "ENFP": "활동가",
                  "ISTJ": "현실주의자",
                  "ISFJ": "수호자",
                  "ESTJ": "경영자",
                  "ESFJ": "집정관",
                  "ISTP": "장인",
                  "ISFP": "모험가",
                  "ESTP": "사업가",
                  "ESFP": "연예인"
                }[formData.mbti] || ""
              }` : "모르겠어요"}
            </div>
          )}
        </div>
      </div>

      {showButtons && isEditing && (
        <div className="form-footer">
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            {onCancel && (
              <button
                type="button"
                className="secondary-btn"
                onClick={onCancel}
                disabled={loading}
              >
                취소
              </button>
            )}
            <button
              type="submit"
              className="cta-button ink-brush-effect"
              disabled={loading}
            >
              {loading ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}