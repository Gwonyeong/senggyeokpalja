'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChange, checkAdminAccess } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/PageWrapper';
import Dashboard from '@/components/admin/Dashboard';
import UserManagement from '@/components/admin/UserManagement';
import AnalysisStats from '@/components/admin/AnalysisStats';
import ConsultationManagement from '@/components/admin/ConsultationManagement';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'analyses':
        return <AnalysisStats />;
      case 'consultations':
        return <ConsultationManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <PageWrapper fullWidth>
      <section className="section admin-section">
        <div className="admin-container">
          <div className="admin-header">
            <div>
              <h1 className="section-title sage-title">관리자 대시보드</h1>
              <p className="section-subtitle">토리의 찻집 관리</p>
            </div>
            <div className="admin-user-info">
              <span className="admin-email">{user?.email}</span>
            </div>
          </div>

          <div className="admin-nav">
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="tab-icon">📊</span>
              대시보드
            </button>
            <button
              className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="tab-icon">👥</span>
              사용자 관리
            </button>
            <button
              className={`nav-tab ${activeTab === 'analyses' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyses')}
            >
              <span className="tab-icon">🔍</span>
              분석 통계
            </button>
            <button
              className={`nav-tab ${activeTab === 'consultations' ? 'active' : ''}`}
              onClick={() => setActiveTab('consultations')}
            >
              <span className="tab-icon">💬</span>
              상담 관리
            </button>
          </div>

          <div className="admin-content">
            {renderContent()}
          </div>
        </div>
      </section>

      <style jsx>{`
        .admin-section {
          min-height: calc(100vh - 100px);
          padding-top: 80px;
        }

        .admin-container {
          width: 100%;
          max-width: none;
          padding: 0 40px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-email {
          padding: 8px 16px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          color: #d4af37;
          font-size: 13px;
        }

        .admin-nav {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          color: #999;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .nav-tab:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.4);
          color: #fff;
        }

        .nav-tab.active {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1));
          border-color: #d4af37;
          color: #d4af37;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
        }

        .tab-icon {
          font-size: 18px;
        }

        .admin-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1200px) {
          .admin-container {
            padding: 0 24px;
          }
        }

        @media (max-width: 768px) {
          .admin-section {
            padding-top: 70px;
          }

          .admin-container {
            padding: 0 16px;
          }

          .admin-header {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start;
          }

          .admin-nav {
            gap: 8px;
            padding-bottom: 15px;
          }

          .nav-tab {
            padding: 10px 16px;
            font-size: 14px;
          }

          .tab-icon {
            font-size: 16px;
          }
        }
      `}</style>
    </PageWrapper>
  );
}