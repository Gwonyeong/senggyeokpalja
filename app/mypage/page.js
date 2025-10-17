"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChange,
  signOut,
  deleteAccount,
} from "../../lib/supabase-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageWrapper from "@/components/PageWrapper";
import { calculateSaju, determinePaljaType } from "../../lib/saju-utils";

export default function MyPage() {
  const [analysisResults, setAnalysisResults] = useState([]);
  const [consultationResults, setConsultationResults] = useState([]);
  const [consultationPage, setConsultationPage] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "unknown",
    gender: "male",
    mbti: "",
    calendar: "solar",
    isLeapMonth: false,
    phone: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [database, setDatabase] = useState(null);
  const [calculatedPersonalityType, setCalculatedPersonalityType] =
    useState(null);
  const router = useRouter();

  // 생시 매핑 함수
  const getBirthTimeDisplay = (birthTime) => {
    if (!birthTime) return null;

    const time = new Date(birthTime);
    const hour = time.getUTCHours();
    const minute = time.getUTCMinutes();

    const timeMap = {
      0: { emoji: "🐭", name: "자시" }, // 23:30 ~ 01:29
      1: { emoji: "🐮", name: "축시" }, // 01:30 ~ 03:29
      2: { emoji: "🐯", name: "인시" }, // 03:30 ~ 05:29
      3: { emoji: "🐰", name: "묘시" }, // 05:30 ~ 07:29
      4: { emoji: "🐲", name: "진시" }, // 07:30 ~ 09:29
      5: { emoji: "🐍", name: "사시" }, // 09:30 ~ 11:29
      6: { emoji: "🐴", name: "오시" }, // 11:30 ~ 13:29
      7: { emoji: "🐑", name: "미시" }, // 13:30 ~ 15:29
      8: { emoji: "🐵", name: "신시" }, // 15:30 ~ 17:29
      9: { emoji: "🐔", name: "유시" }, // 17:30 ~ 19:29
      10: { emoji: "🐶", name: "술시" }, // 19:30 ~ 21:29
      11: { emoji: "🐷", name: "해시" }, // 21:30 ~ 23:29
    };

    // 시간 인덱스 계산 (analyze 페이지와 동일한 로직)
    let timeIndex = 6; // 기본값 오시

    if (hour === 0 && minute >= 30) timeIndex = 0;
    else if (hour === 1 || (hour === 2 && minute < 30)) timeIndex = 0;
    else if ((hour === 2 && minute >= 30) || (hour === 3 && minute < 30))
      timeIndex = 1;
    else if ((hour === 3 && minute >= 30) || (hour === 4 && minute < 30))
      timeIndex = 1;
    else if ((hour === 4 && minute >= 30) || (hour === 5 && minute < 30))
      timeIndex = 2;
    else if ((hour === 5 && minute >= 30) || (hour === 6 && minute < 30))
      timeIndex = 2;
    else if ((hour === 6 && minute >= 30) || (hour === 7 && minute < 30))
      timeIndex = 3;
    else if ((hour === 7 && minute >= 30) || (hour === 8 && minute < 30))
      timeIndex = 3;
    else if ((hour === 8 && minute >= 30) || (hour === 9 && minute < 30))
      timeIndex = 4;
    else if ((hour === 9 && minute >= 30) || (hour === 10 && minute < 30))
      timeIndex = 4;
    else if ((hour === 10 && minute >= 30) || (hour === 11 && minute < 30))
      timeIndex = 5;
    else if ((hour === 11 && minute >= 30) || (hour === 12 && minute < 30))
      timeIndex = 5;
    else if ((hour === 12 && minute >= 30) || (hour === 13 && minute < 30))
      timeIndex = 6;
    else if ((hour === 13 && minute >= 30) || (hour === 14 && minute < 30))
      timeIndex = 6;
    else if ((hour === 14 && minute >= 30) || (hour === 15 && minute < 30))
      timeIndex = 7;
    else if ((hour === 15 && minute >= 30) || (hour === 16 && minute < 30))
      timeIndex = 7;
    else if ((hour === 16 && minute >= 30) || (hour === 17 && minute < 30))
      timeIndex = 8;
    else if ((hour === 17 && minute >= 30) || (hour === 18 && minute < 30))
      timeIndex = 8;
    else if ((hour === 18 && minute >= 30) || (hour === 19 && minute < 30))
      timeIndex = 9;
    else if ((hour === 19 && minute >= 30) || (hour === 20 && minute < 30))
      timeIndex = 9;
    else if ((hour === 20 && minute >= 30) || (hour === 21 && minute < 30))
      timeIndex = 10;
    else if ((hour === 21 && minute >= 30) || (hour === 22 && minute < 30))
      timeIndex = 10;
    else if ((hour === 22 && minute >= 30) || (hour === 23 && minute < 30))
      timeIndex = 11;
    else if (hour === 23 && minute >= 30) timeIndex = 0;

    const timeInfo = timeMap[timeIndex];
    return timeInfo ? `${timeInfo.emoji} ${timeInfo.name}` : null;
  };

  useEffect(() => {
    // Supabase 인증 상태 감시
    const {
      data: { subscription },
    } = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser({
          name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "Unknown",
          email: authUser.email,
          photoURL: authUser.user_metadata?.avatar_url || "",
          joinDate: authUser.created_at,
        });

        // 데이터베이스에서 분석 결과 불러오기
        fetchAnalysisHistory();

        // 상담 결과 불러오기
        fetchConsultationHistory();

        // 프로필 정보 불러오기
        fetchProfile();

        // 데이터베이스 불러오기
        fetchDatabase();

        setLoading(false);
      } else {
        // 로그인하지 않은 경우 로그인 페이지로 리디렉트
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 프로필이 변경될 때마다 팔자유형 재계산
  useEffect(() => {
    const updatePersonalityType = async () => {
      if (profile) {
        const calculated = await calculatePersonalityType(profile);
        setCalculatedPersonalityType(calculated);
      }
    };

    updatePersonalityType();
  }, [profile]);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch("/api/analysis/history");
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
      }
    } catch (error) {
      console.error("Failed to fetch analysis history:", error);
    }
  };

  const fetchConsultationHistory = async () => {
    try {
      const response = await fetch("/api/consultation/history");
      if (response.ok) {
        const data = await response.json();
        // API 응답이 { data: [], pagination: {} } 형태인 경우와
        // 배열 형태인 경우 모두 처리
        if (Array.isArray(data)) {
          setConsultationResults(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setConsultationResults(data.data);
        } else {
          console.error("Unexpected consultation history format:", data);
          setConsultationResults([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch consultation history:", error);
      setConsultationResults([]);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.profile);
          // 편집 폼 데이터 초기화
          populateEditForm(data.profile);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  // 데이터베이스 로드
  const fetchDatabase = async () => {
    try {
      const response = await fetch("/database.json");
      if (response.ok) {
        const databaseData = await response.json();
        setDatabase(databaseData);
      }
    } catch (error) {
      console.error("Failed to fetch database:", error);
    }
  };

  // 프로필 데이터를 편집 폼에 채우기
  const populateEditForm = (profileData) => {
    if (!profileData) return;

    const birthDate = profileData.birthDate
      ? new Date(profileData.birthDate)
      : null;
    const birthTime = profileData.birthTime
      ? new Date(profileData.birthTime)
      : null;

    // 생시를 hour index로 변환
    let hourIndex = "unknown";
    if (birthTime) {
      const hour = birthTime.getUTCHours();
      const minute = birthTime.getUTCMinutes();

      if (hour === 0 && minute >= 30) hourIndex = "0";
      else if (hour === 1 || (hour === 2 && minute < 30)) hourIndex = "0";
      else if ((hour === 2 && minute >= 30) || (hour === 3 && minute < 30))
        hourIndex = "1";
      else if ((hour === 3 && minute >= 30) || (hour === 4 && minute < 30))
        hourIndex = "1";
      else if ((hour === 4 && minute >= 30) || (hour === 5 && minute < 30))
        hourIndex = "2";
      else if ((hour === 5 && minute >= 30) || (hour === 6 && minute < 30))
        hourIndex = "2";
      else if ((hour === 6 && minute >= 30) || (hour === 7 && minute < 30))
        hourIndex = "3";
      else if ((hour === 7 && minute >= 30) || (hour === 8 && minute < 30))
        hourIndex = "3";
      else if ((hour === 8 && minute >= 30) || (hour === 9 && minute < 30))
        hourIndex = "4";
      else if ((hour === 9 && minute >= 30) || (hour === 10 && minute < 30))
        hourIndex = "4";
      else if ((hour === 10 && minute >= 30) || (hour === 11 && minute < 30))
        hourIndex = "5";
      else if ((hour === 11 && minute >= 30) || (hour === 12 && minute < 30))
        hourIndex = "5";
      else if ((hour === 12 && minute >= 30) || (hour === 13 && minute < 30))
        hourIndex = "6";
      else if ((hour === 13 && minute >= 30) || (hour === 14 && minute < 30))
        hourIndex = "6";
      else if ((hour === 14 && minute >= 30) || (hour === 15 && minute < 30))
        hourIndex = "7";
      else if ((hour === 15 && minute >= 30) || (hour === 16 && minute < 30))
        hourIndex = "7";
      else if ((hour === 16 && minute >= 30) || (hour === 17 && minute < 30))
        hourIndex = "8";
      else if ((hour === 17 && minute >= 30) || (hour === 18 && minute < 30))
        hourIndex = "8";
      else if ((hour === 18 && minute >= 30) || (hour === 19 && minute < 30))
        hourIndex = "9";
      else if ((hour === 19 && minute >= 30) || (hour === 20 && minute < 30))
        hourIndex = "9";
      else if ((hour === 20 && minute >= 30) || (hour === 21 && minute < 30))
        hourIndex = "10";
      else if ((hour === 21 && minute >= 30) || (hour === 22 && minute < 30))
        hourIndex = "10";
      else if ((hour === 22 && minute >= 30) || (hour === 23 && minute < 30))
        hourIndex = "11";
      else if (hour === 23 && minute >= 30) hourIndex = "0";
    }

    setEditFormData({
      name: profileData.name || "",
      year: birthDate ? birthDate.getFullYear().toString() : "",
      month: birthDate ? (birthDate.getMonth() + 1).toString() : "",
      day: birthDate ? birthDate.getDate().toString() : "",
      hour: hourIndex,
      gender: profileData.gender || "male",
      mbti: profileData.mbti || "",
      calendar: profileData.calendar || "solar",
      isLeapMonth: profileData.isLeapMonth || false,
      phone: profileData.phone || "",
    });
  };

  // 프로필 수정 모달 열기
  const openEditModal = () => {
    populateEditForm(profile);
    setShowEditModal(true);
  };

  // 프로필 수정 모달 닫기
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditLoading(false);
  };

  // 프로필 데이터를 기반으로 팔자유형 계산
  const calculatePersonalityType = async (profileData) => {
    if (
      !profileData?.birthDate ||
      !profileData?.gender
    ) {
      return null;
    }

    try {
      const inputBirthDate = new Date(profileData.birthDate);

      let year = inputBirthDate.getFullYear();
      let month = inputBirthDate.getMonth() + 1;
      let day = inputBirthDate.getDate();

      // 음력인 경우 양력으로 변환
      if (profileData.calendar === "lunar") {
        const lunIl = profileData.isLeapMonth ? "1" : "0";
        const convertResponse = await fetch(
          `/api/calendar/convert?lunYear=${year}&lunMonth=${month}&lunDay=${day}&lunIl=${lunIl}`
        );

        if (convertResponse.ok) {
          const convertResult = await convertResponse.json();
          year = parseInt(convertResult.solarYear);
          month = parseInt(convertResult.solarMonth);
          day = parseInt(convertResult.solarDay);
        } else {
          console.error("음력 변환 실패");
          return null;
        }
      }

      // 생시를 시간 인덱스로 변환 (생시가 없으면 기본값 6 사용)
      let timeIndex = 6; // 기본값 오시

      if (profileData.birthTime) {
        const birthTime = new Date(profileData.birthTime);
        const hour = birthTime.getUTCHours();
        const minute = birthTime.getUTCMinutes();

        if (hour === 0 && minute >= 30) timeIndex = 0;
        else if (hour === 1 || (hour === 2 && minute < 30)) timeIndex = 0;
        else if ((hour === 2 && minute >= 30) || (hour === 3 && minute < 30))
          timeIndex = 1;
        else if ((hour === 3 && minute >= 30) || (hour === 4 && minute < 30))
          timeIndex = 1;
        else if ((hour === 4 && minute >= 30) || (hour === 5 && minute < 30))
          timeIndex = 2;
        else if ((hour === 5 && minute >= 30) || (hour === 6 && minute < 30))
          timeIndex = 2;
        else if ((hour === 6 && minute >= 30) || (hour === 7 && minute < 30))
          timeIndex = 3;
        else if ((hour === 7 && minute >= 30) || (hour === 8 && minute < 30))
          timeIndex = 3;
        else if ((hour === 8 && minute >= 30) || (hour === 9 && minute < 30))
          timeIndex = 4;
        else if ((hour === 9 && minute >= 30) || (hour === 10 && minute < 30))
          timeIndex = 4;
        else if ((hour === 10 && minute >= 30) || (hour === 11 && minute < 30))
          timeIndex = 5;
        else if ((hour === 11 && minute >= 30) || (hour === 12 && minute < 30))
          timeIndex = 5;
        else if ((hour === 12 && minute >= 30) || (hour === 13 && minute < 30))
          timeIndex = 6;
        else if ((hour === 13 && minute >= 30) || (hour === 14 && minute < 30))
          timeIndex = 6;
        else if ((hour === 14 && minute >= 30) || (hour === 15 && minute < 30))
          timeIndex = 7;
        else if ((hour === 15 && minute >= 30) || (hour === 16 && minute < 30))
          timeIndex = 7;
        else if ((hour === 16 && minute >= 30) || (hour === 17 && minute < 30))
          timeIndex = 8;
        else if ((hour === 17 && minute >= 30) || (hour === 18 && minute < 30))
          timeIndex = 8;
        else if ((hour === 18 && minute >= 30) || (hour === 19 && minute < 30))
          timeIndex = 9;
        else if ((hour === 19 && minute >= 30) || (hour === 20 && minute < 30))
          timeIndex = 9;
        else if ((hour === 20 && minute >= 30) || (hour === 21 && minute < 30))
          timeIndex = 10;
        else if ((hour === 21 && minute >= 30) || (hour === 22 && minute < 30))
          timeIndex = 10;
        else if ((hour === 22 && minute >= 30) || (hour === 23 && minute < 30))
          timeIndex = 11;
        else if (hour === 23 && minute >= 30) timeIndex = 0;
      }

      // Date 객체 생성 (calculateSaju는 Date 객체를 받음)
      const birthDateObj = new Date(year, month - 1, day);

      // 사주팔자 계산
      const sajuData = calculateSaju(birthDateObj, timeIndex);

      // 성격 유형 결정
      const personalityType = determinePaljaType(sajuData);

      return personalityType;
    } catch (error) {
      console.error("팔자유형 계산 오류:", error);
    }

    return null;
  };

  // 프로필 수정 제출
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      // birthTime을 시간으로 변환
      let birthTimeString = null;
      if (editFormData.hour !== "unknown") {
        const hourIndex = parseInt(editFormData.hour);
        const timeRanges = [
          "00:30",
          "02:30",
          "04:30",
          "06:30",
          "08:30",
          "10:30",
          "12:30",
          "14:30",
          "16:30",
          "18:30",
          "20:30",
          "22:30",
        ];
        birthTimeString = timeRanges[hourIndex];
      }

      // 생년월일 조합
      let birthDateString = null;
      if (editFormData.year && editFormData.month && editFormData.day) {
        birthDateString = `${editFormData.year}-${editFormData.month.padStart(
          2,
          "0"
        )}-${editFormData.day.padStart(2, "0")}`;
      }

      const updateData = {
        name: editFormData.name,
        birthDate: birthDateString,
        birthTime: birthTimeString,
        gender: editFormData.gender,
        mbti: editFormData.mbti,
        calendar: editFormData.calendar,
        isLeapMonth: editFormData.isLeapMonth,
        phone: editFormData.phone,
      };

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.profile);
          closeEditModal();
          alert("프로필이 성공적으로 수정되었습니다!");
        } else {
          throw new Error(data.error || "프로필 수정에 실패했습니다.");
        }
      } else {
        throw new Error("프로필 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정 중 오류가 발생했습니다: " + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      try {
        await signOut();
        router.push("/");
      } catch (error) {
        console.error("로그아웃 실패:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    // 2단계 확인
    const firstConfirm = confirm(
      "⚠️ 경고: 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.\n\n삭제될 데이터:\n- 프로필 정보\n- 분석 결과 히스토리\n- 모든 저장된 데이터\n\n정말로 계정을 삭제하시겠습니까?"
    );

    if (!firstConfirm) return;

    const secondConfirm = confirm(
      "마지막 확인입니다.\n\n계정 삭제는 되돌릴 수 없습니다.\n정말로 진행하시겠습니까?"
    );

    if (!secondConfirm) return;

    try {
      // 로딩 표시
      const deleteButton = document.querySelector(".btn-danger");
      deleteButton.textContent = "삭제 중...";
      deleteButton.disabled = true;

      await deleteAccount();

      // 성공 메시지 표시
      alert("계정이 성공적으로 삭제되었습니다. 이용해 주셔서 감사합니다.");

      // 홈페이지로 리디렉트
      router.push("/");
    } catch (error) {
      console.error("계정 삭제 실패:", error);

      // 버튼 상태 복원
      const deleteButton = document.querySelector(".btn-danger");
      deleteButton.textContent = "🗑️ 계정 삭제";
      deleteButton.disabled = false;

      if (error.message.includes("최근에 로그인")) {
        alert(error.message);
        // 재로그인을 위해 로그아웃
        try {
          await signOutUser();
          router.push("/");
        } catch (logoutError) {
          console.error("로그아웃 실패:", logoutError);
        }
      } else {
        alert(`계정 삭제 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="analyze-page">
        <div className="container">
          <div className="analyze-header">
            <h1>👤 마이페이지</h1>
            <p style={{ textAlign: "center", marginTop: "50px" }}>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="analyze-page">
        <div className="container">
          <div className="mypage-welcome">
            <div className="card welcome-card">
              <div className="card-header">
                <h2 className="card-title sage-title">
                  <span className="sage-subtitle">
                    토리의 찻집에 오신 것을 환영합니다
                  </span>
                </h2>
                <p className="sage-description">
                  로그인하시면 당신만의 팔자 분석 결과를 저장하고 관리할 수
                  있습니다.
                </p>
              </div>

              <div className="welcome-content">
                <div className="welcome-features">
                  <div className="feature-item">
                    <div className="feature-icon">📊</div>
                    <h3>분석 결과 저장</h3>
                    <p>당신의 팔자 분석과 시너지 결과를 안전하게 저장하세요</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">📈</div>
                    <h3>히스토리 관리</h3>
                    <p>시간에 따른 분석 결과 변화를 추적하고 비교해보세요</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🔐</div>
                    <h3>개인 맞춤 서비스</h3>
                    <p>개인화된 추천과 맞춤형 조언을 받아보세요</p>
                  </div>
                </div>

                <div className="welcome-actions">
                  <button
                    className="cta-button ink-brush-effect"
                    onClick={() => router.push("/")}
                  >
                    로그인하러 가기
                  </button>
                  <p className="welcome-note">
                    Google 또는 Kakao 계정으로 간편하게 로그인하세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="analyze-page" style={{ paddingTop: "120px" }}>
        <div className="container">
          {/* 프로필 정보 카드 */}
          <div
            className="card user-info-card"
            style={{
              marginBottom: "30px",
              background: "var(--card-bg-color)",
              padding: "0",
              borderRadius: "12px",
            }}
          >
            <div className="business-card-layout">
              {/* 좌측: 팔자유형 이미지 */}
              <div className="profile-avatar-section">
                {(() => {
                  // 프로필 정보가 완전하지 않은 경우 기본 이미지 표시
                  const hasCompleteProfile =
                    profile?.birthDate && profile?.gender;

                  if (!hasCompleteProfile) {
                    return (
                      <Image
                        src="/assets/images/service-1.png"
                        alt="기본 이미지"
                        width={120}
                        height={150}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    );
                  }

                  // 계산된 팔자유형 또는 저장된 personalityType 사용
                  const personalityType =
                    calculatedPersonalityType ||
                    profile?.personalityType ||
                    "NSIJ";

                  return (
                    <Image
                      src={`/assets/images/${personalityType}.png`}
                      alt={personalityType}
                      width={120}
                      height={150}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                      onError={(e) => {
                        // 이미지 로드 실패 시 기본 아바타 표시
                        e.target.style.display = "none";
                        e.target.parentNode.innerHTML = `
                              <div style="
                                width: 100%;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 28px;
                                color: var(--accent-color);
                                background: rgba(252, 163, 17, 0.1);
                                border-radius: 12px;
                              ">
                                ${
                                  profile?.name
                                    ? profile.name.charAt(0).toUpperCase()
                                    : "👤"
                                }
                              </div>
                            `;
                      }}
                    />
                  );
                })()}
              </div>

              {/* 우측: 사용자 정보 */}
              <div className="profile-info-section">
                {/* 팔자유형 표시 */}
                {(() => {
                  // 프로필 정보가 완전하지 않은 경우 안내 메시지 표시
                  const hasCompleteProfile =
                    profile?.birthDate && profile?.gender;

                  if (!hasCompleteProfile) {
                    return (
                      <div
                        className="personality-type-header"
                        style={{
                          textAlign: "center",
                          marginBottom: "20px",
                          paddingBottom: "16px",
                          borderBottom: "1px solid rgba(252, 163, 17, 0.2)",
                        }}
                      >
                        <h2
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "var(--text-muted-color)",
                            margin: "0",
                            fontFamily: "var(--heading-font)",
                            letterSpacing: "1px",
                            lineHeight: "1.3",
                          }}
                        >
                          생년월일을 입력하세요!
                        </h2>
                      </div>
                    );
                  }

                  const personalityType =
                    calculatedPersonalityType ||
                    profile?.personalityType ||
                    "NSIJ";

                  // 데이터베이스에서 alias 가져오기
                  const typeData = database?.[personalityType];
                  const displayName = typeData?.alias || personalityType;

                  return (
                    <div
                      className="personality-type-header"
                      style={{
                        textAlign: "center",
                        marginBottom: "20px",
                        paddingBottom: "16px",
                        borderBottom: "1px solid rgba(252, 163, 17, 0.2)",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "22px",
                          fontWeight: "700",
                          color: "var(--accent-color)",
                          margin: "0",
                          fontFamily: "var(--heading-font)",
                          letterSpacing: "1px",
                          lineHeight: "1.3",
                        }}
                      >
                        {displayName}
                      </h2>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted-color)",
                          margin: "4px 0 0 0",
                          letterSpacing: "1px",
                        }}
                      >
                        {personalityType}
                      </p>
                    </div>
                  );
                })()}

                <div className="profile-details">
                  {/* 이름, 성별, MBTI */}
                  <div className="detail-row">
                    <span className="detail-value">
                      {profile?.name || "미설정"}
                    </span>
                    <span className="detail-value">
                      {profile?.gender === "male"
                        ? "남자"
                        : profile?.gender === "female"
                        ? "여자"
                        : "미설정"}
                    </span>
                    <span className="detail-value">
                      {profile?.mbti || "미설정"}
                    </span>
                  </div>

                  {/* 양력-음력, 생년월일 */}
                  <div className="detail-row">
                    <span className="detail-value">
                      {profile?.calendar === "solar"
                        ? "양력"
                        : profile?.calendar === "lunar"
                        ? "음력"
                        : "미설정"}
                      {profile?.calendar === "lunar" &&
                        profile?.isLeapMonth &&
                        " (윤달)"}
                    </span>
                    <span className="detail-value">
                      {profile?.birthDate
                        ? new Date(profile.birthDate).toLocaleDateString(
                            "ko-KR"
                          )
                        : "미설정"}
                    </span>
                    {profile?.birthTime && (
                      <span className="detail-value">
                        {getBirthTimeDisplay(profile.birthTime)}
                      </span>
                    )}
                  </div>

                  {/* 이메일 */}
                  <div className="detail-row">
                    <span className="detail-value">
                      {profile?.email || user?.email || "미설정"}
                    </span>
                  </div>

                  {/* 전화번호 */}
                  <div className="detail-row">
                    <span className="detail-value">
                      {profile?.phone || "미설정"}
                    </span>
                  </div>

                  {/* 가입일 */}
                  <div className="detail-row">
                    <span className="detail-value">
                      가입일:{" "}
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString(
                            "ko-KR"
                          )
                        : user?.joinDate
                        ? new Date(user.joinDate).toLocaleDateString("ko-KR")
                        : "미설정"}
                    </span>
                  </div>

                  {/* 정보 수정 버튼 */}
                  <div
                    className="detail-row"
                    style={{ borderBottom: "none", paddingTop: "16px" }}
                  >
                    <button
                      className="edit-profile-btn"
                      onClick={openEditModal}
                      style={{
                        background: "var(--accent-color)",
                        color: "var(--ink-black)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "var(--muted-gold)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "var(--accent-color)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      ✏️ 정보 수정
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 그리드 */}
          <div
            className="mypage-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "30px",
              marginBottom: "40px",
            }}
          >
            {/* 토리와 상담 카드 */}
            <div
              className="card consultation-card"
              style={{
                background: "var(--card-bg-color)",
                padding: "25px",
                borderRadius: "12px",
              }}
            >
              <div className="card-header" style={{ marginBottom: "20px" }}>
                <h3
                  className="card-title sage-title"
                  style={{
                    color: "var(--starlight-orange)",
                    marginBottom: "8px",
                  }}
                >
                  🔮 인생 스포일러
                </h3>
              </div>
              <div id="consultation-history">
                {!consultationResults || consultationResults.length === 0 ? (
                  <p
                    className="no-data"
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted-color)",
                      padding: "20px",
                    }}
                  >
                    아직 상담 기록이 없습니다.{" "}
                    <a
                      href="/consultation"
                      style={{ color: "var(--accent-color)" }}
                    >
                      지금 상담해보세요!
                    </a>
                  </p>
                ) : (
                  <>
                    <div
                      style={{
                        maxHeight: "350px",
                        overflowY: "auto",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {(consultationResults || [])
                        .slice(consultationPage * 5, (consultationPage + 1) * 5)
                        .map((result) => (
                          <div
                            key={result.id}
                            style={{
                              padding: "15px",
                              borderBottom: "1px solid var(--border-color)",
                              border: "1px solid transparent",
                              borderRadius: "6px",
                              margin: "8px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              backgroundColor: "var(--card-bg-color)",
                            }}
                            onMouseEnter={(e) => {
                              const card = e.currentTarget;
                              card.style.border =
                                "1px solid var(--accent-color)";
                              card.style.backgroundColor =
                                "rgba(212, 175, 55, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                              const card = e.currentTarget;
                              card.style.border = "1px solid transparent";
                              card.style.backgroundColor =
                                "var(--card-bg-color)";
                            }}
                            onClick={() => {
                              router.push(`/consultation/result/${result.id}`);
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "8px",
                              }}
                            >
                              <h4
                                style={{
                                  color: "var(--accent-color)",
                                  fontSize: "14px",
                                  marginBottom: "0",
                                }}
                              >
                                {result.name || "이름 없음"}
                              </h4>
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: result.isPaid ? "#fff" : "#000",
                                  background: result.isPaid
                                    ? "#28a745"
                                    : "#ffc107",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "bold",
                                }}
                              >
                                {result.isPaid ? "결제 완료!" : "무료"}
                              </span>
                            </div>
                            {result.birthDate && (
                              <p
                                style={{
                                  color: "var(--text-color)",
                                  fontSize: "13px",
                                  marginBottom: "5px",
                                }}
                              >
                                생년월일:{" "}
                                {new Date(result.birthDate).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            )}
                            {getBirthTimeDisplay(result.birthTime) && (
                              <p
                                style={{
                                  color: "var(--text-color)",
                                  fontSize: "13px",
                                  marginBottom: "5px",
                                }}
                              >
                                생시: {getBirthTimeDisplay(result.birthTime)}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                            >
                              <p
                                style={{
                                  color: "var(--text-muted-color)",
                                  fontSize: "12px",
                                  marginBottom: "0",
                                }}
                              >
                                상담일:{" "}
                                {new Date(result.createdAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* 페이지네이션 */}
                    {consultationResults && consultationResults.length > 5 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "15px",
                          paddingTop: "15px",
                          borderTop: "1px solid var(--border-color)",
                        }}
                      >
                        <button
                          onClick={() =>
                            setConsultationPage(
                              Math.max(0, consultationPage - 1)
                            )
                          }
                          disabled={consultationPage === 0}
                          style={{
                            padding: "5px 10px",
                            background:
                              consultationPage === 0
                                ? "var(--border-color)"
                                : "var(--accent-color)",
                            color:
                              consultationPage === 0
                                ? "var(--text-muted-color)"
                                : "var(--ink-black)",
                            border: "none",
                            borderRadius: "4px",
                            cursor:
                              consultationPage === 0
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "12px",
                          }}
                        >
                          이전
                        </button>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted-color)",
                          }}
                        >
                          {consultationPage + 1} /{" "}
                          {Math.ceil((consultationResults?.length || 0) / 5)}
                        </span>
                        <button
                          onClick={() =>
                            setConsultationPage(
                              Math.min(
                                Math.ceil(
                                  (consultationResults?.length || 0) / 5
                                ) - 1,
                                consultationPage + 1
                              )
                            )
                          }
                          disabled={
                            consultationPage >=
                            Math.ceil((consultationResults?.length || 0) / 5) -
                              1
                          }
                          style={{
                            padding: "5px 10px",
                            background:
                              consultationPage >=
                              Math.ceil(
                                (consultationResults?.length || 0) / 5
                              ) -
                                1
                                ? "var(--border-color)"
                                : "var(--accent-color)",
                            color:
                              consultationPage >=
                              Math.ceil(
                                (consultationResults?.length || 0) / 5
                              ) -
                                1
                                ? "var(--text-muted-color)"
                                : "var(--ink-black)",
                            border: "none",
                            borderRadius: "4px",
                            cursor:
                              consultationPage >=
                              Math.ceil(
                                (consultationResults?.length || 0) / 5
                              ) -
                                1
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "12px",
                          }}
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 토리와의 대화록 카드 */}
            <div
              className="card analysis-card"
              style={{
                background: "var(--card-bg-color)",
                padding: "25px",
                borderRadius: "12px",
              }}
            >
              <div className="card-header" style={{ marginBottom: "20px" }}>
                <h3
                  className="card-title sage-title"
                  style={{
                    color: "var(--starlight-orange)",
                    marginBottom: "8px",
                  }}
                >
                  📜 토리와의 대화록
                </h3>
              </div>
              <div id="analysis-history">
                {analysisResults.length === 0 ? (
                  <p
                    className="no-data"
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted-color)",
                      padding: "20px",
                    }}
                  >
                    아직 분석 결과가 없습니다.{" "}
                    <a href="/analyze" style={{ color: "var(--accent-color)" }}>
                      지금 분석해보세요!
                    </a>
                  </p>
                ) : (
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {analysisResults.slice(0, 3).map((result) => (
                      <div
                        key={result.id}
                        style={{
                          padding: "15px",
                          borderBottom: "1px solid var(--border-color)",
                          border: "1px solid transparent",
                          borderRadius: "6px",
                          margin: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          backgroundColor: "var(--card-bg-color)",
                        }}
                        onMouseEnter={(e) => {
                          const card = e.currentTarget;
                          card.style.border = "1px solid var(--accent-color)";
                          card.style.backgroundColor =
                            "rgba(212, 175, 55, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          const card = e.currentTarget;
                          card.style.border = "1px solid transparent";
                          card.style.backgroundColor = "var(--card-bg-color)";
                        }}
                        onClick={() => {
                          router.push(
                            `/analyze?type=${result.personalityType}`
                          );
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: "8px" }}>
                              <h4
                                style={{
                                  color: "var(--accent-color)",
                                  fontSize: "14px",
                                  marginBottom: "0",
                                }}
                              >
                                {result.personalityType || "Unknown"}
                              </h4>
                            </div>
                            <p
                              style={{
                                color: "var(--text-color)",
                                fontSize: "13px",
                                marginBottom: "5px",
                              }}
                            >
                              이름: {result.name || "이름 없음"}
                            </p>
                            {result.birthDate && (
                              <p
                                style={{
                                  color: "var(--text-color)",
                                  fontSize: "13px",
                                  marginBottom: "5px",
                                }}
                              >
                                생년월일:{" "}
                                {new Date(result.birthDate).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                            >
                              <p
                                style={{
                                  color: "var(--text-muted-color)",
                                  fontSize: "12px",
                                  marginBottom: "0",
                                }}
                              >
                                검사일:{" "}
                                {new Date(result.createdAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </p>
                            </div>
                          </div>
                          {result.personalityType && (
                            <div
                              style={{
                                width: "70px",
                                height: "70px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "2px solid var(--accent-color)",
                                flexShrink: 0,
                                marginLeft: "15px",
                              }}
                            >
                              <Image
                                src={`/assets/images/${result.personalityType}.png`}
                                alt={result.personalityType}
                                width={70}
                                height={70}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 찻집 관리 카드 */}
            <div
              className="card account-card"
              style={{
                background: "var(--card-bg-color)",
                padding: "25px",
                borderRadius: "12px",
              }}
            >
              <div className="card-header" style={{ marginBottom: "20px" }}>
                <h3
                  className="card-title sage-title"
                  style={{
                    color: "var(--starlight-orange)",
                    marginBottom: "8px",
                  }}
                >
                  ⚙️ 찻집 관리
                </h3>
                <p
                  className="card-description"
                  style={{ color: "var(--text-muted-color)", fontSize: "14px" }}
                >
                  계정 설정과 데이터 관리
                </p>
              </div>
              <div
                className="account-actions"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <button
                  className="secondary-btn"
                  style={{ width: "100%" }}
                  onClick={handleLogout}
                >
                  🚪 로그아웃
                </button>
                <button
                  className="btn btn-danger"
                  style={{
                    width: "100%",
                    background: "#dc3545",
                    color: "white",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={handleDeleteAccount}
                  onMouseOver={(e) => (e.target.style.background = "#c82333")}
                  onMouseOut={(e) => (e.target.style.background = "#dc3545")}
                >
                  🗑️ 계정 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 프로필 수정 모달 */}
      {showEditModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeEditModal}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "var(--card-bg-color)",
              borderRadius: "16px",
              padding: "30px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "2px solid var(--accent-color)",
              boxShadow: "0 0 30px rgba(252, 163, 17, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-header"
              style={{ marginBottom: "20px", textAlign: "center" }}
            >
              <h2
                style={{
                  color: "var(--accent-color)",
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "8px",
                  fontFamily: "var(--heading-font)",
                }}
              >
                ✏️ 프로필 수정
              </h2>
              <p
                style={{
                  color: "var(--text-muted-color)",
                  fontSize: "14px",
                  margin: "0",
                }}
              >
                정보를 수정하여 더 정확한 분석을 받아보세요
              </p>
            </div>

            <form onSubmit={handleEditSubmit}>
              {/* 이름 */}
              <div className="form-section" style={{ marginBottom: "20px" }}>
                <div className="input-group">
                  <label
                    htmlFor="edit-name"
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-color)",
                      marginBottom: "8px",
                    }}
                  >
                    이름 *
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    placeholder="이름을 입력해주세요"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      backgroundColor: "var(--surface-color)",
                      color: "var(--text-color)",
                      fontSize: "16px",
                    }}
                  />
                </div>
              </div>

              {/* 생년월일 */}
              <div className="form-section" style={{ marginBottom: "20px" }}>
                <div className="input-group">
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-color)",
                      marginBottom: "8px",
                    }}
                  >
                    생년월일 *
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <select
                      value={editFormData.year}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          year: e.target.value,
                        })
                      }
                      required
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        backgroundColor: "var(--surface-color)",
                        color: "var(--text-color)",
                        fontSize: "16px",
                      }}
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
                      value={editFormData.month}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          month: e.target.value,
                        })
                      }
                      required
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        backgroundColor: "var(--surface-color)",
                        color: "var(--text-color)",
                        fontSize: "16px",
                      }}
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
                      value={editFormData.day}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          day: e.target.value,
                        })
                      }
                      required
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        backgroundColor: "var(--surface-color)",
                        color: "var(--text-color)",
                        fontSize: "16px",
                      }}
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
                </div>
              </div>

              {/* 태어난 시간 */}
              <div className="form-section" style={{ marginBottom: "20px" }}>
                <div className="input-group">
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-color)",
                      marginBottom: "8px",
                    }}
                  >
                    태어난 시간
                  </label>
                  <select
                    value={editFormData.hour}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, hour: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      backgroundColor: "var(--surface-color)",
                      color: "var(--text-color)",
                      fontSize: "16px",
                    }}
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
                </div>
              </div>

              {/* 성별과 양력/음력 */}
              <div className="form-section" style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div className="input-group">
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "var(--text-color)",
                        marginBottom: "8px",
                      }}
                    >
                      성별
                    </label>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="edit-gender"
                          value="male"
                          checked={editFormData.gender === "male"}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              gender: e.target.value,
                            })
                          }
                        />
                        <span style={{ color: "var(--text-color)" }}>남자</span>
                      </label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="edit-gender"
                          value="female"
                          checked={editFormData.gender === "female"}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              gender: e.target.value,
                            })
                          }
                        />
                        <span style={{ color: "var(--text-color)" }}>여자</span>
                      </label>
                    </div>
                  </div>

                  <div className="input-group">
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "var(--text-color)",
                        marginBottom: "8px",
                      }}
                    >
                      양력/음력
                    </label>
                    <div
                      style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="edit-calendar"
                          value="solar"
                          checked={editFormData.calendar === "solar"}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              calendar: e.target.value,
                            })
                          }
                        />
                        <span style={{ color: "var(--text-color)" }}>양력</span>
                      </label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="edit-calendar"
                          value="lunar"
                          checked={editFormData.calendar === "lunar"}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              calendar: e.target.value,
                            })
                          }
                        />
                        <span style={{ color: "var(--text-color)" }}>음력</span>
                      </label>
                      {editFormData.calendar === "lunar" && (
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={editFormData.isLeapMonth}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                isLeapMonth: e.target.checked,
                              })
                            }
                          />
                          <span style={{ color: "var(--text-color)" }}>
                            윤달
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MBTI */}
              <div className="form-section" style={{ marginBottom: "20px" }}>
                <div className="input-group">
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-color)",
                      marginBottom: "8px",
                    }}
                  >
                    MBTI 성격유형
                  </label>
                  <select
                    value={editFormData.mbti}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, mbti: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      backgroundColor: "var(--surface-color)",
                      color: "var(--text-color)",
                      fontSize: "16px",
                    }}
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
                </div>
              </div>

              {/* 전화번호 */}
              <div className="form-section" style={{ marginBottom: "30px" }}>
                <div className="input-group">
                  <label
                    htmlFor="edit-phone"
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-color)",
                      marginBottom: "8px",
                    }}
                  >
                    전화번호
                  </label>
                  <input
                    type="tel"
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="전화번호를 입력해주세요"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      backgroundColor: "var(--surface-color)",
                      color: "var(--text-color)",
                      fontSize: "16px",
                    }}
                  />
                </div>
              </div>

              {/* 버튼 */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editLoading}
                  style={{
                    padding: "12px 24px",
                    border: "2px solid var(--border-color)",
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    color: "var(--text-color)",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: editLoading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: editLoading
                      ? "var(--text-muted-color)"
                      : "var(--accent-color)",
                    color: "var(--ink-black)",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: editLoading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {editLoading ? "저장 중..." : "💾 저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
