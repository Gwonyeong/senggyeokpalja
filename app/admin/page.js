'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChange, checkAdminAccess } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((supabaseUser) => {
      if (supabaseUser) {
        if (checkAdminAccess(supabaseUser)) {
          setUser(supabaseUser);
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>로딩 중...</p>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title sage-title">관리자 대시보드</h1>
        <p className="section-subtitle">토리의 찻집 관리</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>사용자 관리</h3>
            <p>전체 사용자: 0명</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              사용자 목록 보기
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>분석 통계</h3>
            <p>오늘의 분석: 0건</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              통계 보기
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>피드백 관리</h3>
            <p>미처리 피드백: 0건</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              피드백 보기
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>시스템 설정</h3>
            <p>서비스 상태: 정상</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              설정 관리
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}