'use client';

import { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithNaver, signInWithKakao, getCurrentUser } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 이미 로그인된 사용자 체크
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.push('/');
        }
      } catch (error) {
        // 로그인되지 않은 상태는 정상
      }
    };
    checkUser();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      // OAuth는 리디렉트되므로 여기서 router.push 불필요
    } catch (error) {
      setError('구글 로그인 실패: ' + error.message);
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithNaver();
    } catch (error) {
      setError('네이버 로그인 실패: ' + error.message);
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithKakao();
    } catch (error) {
      setError('카카오 로그인 실패: ' + error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { user } = await signUpWithEmail(email, password);
        if (user && !user.email_confirmed_at) {
          setError('회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.');
        } else {
          router.push('/');
        }
      } else {
        await signInWithEmail(email, password);
        router.push('/');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="analyzer-layout">
          <div className="analyzer-card">
            <div className="card-header">
              <h1 className="sage-title">{isSignUp ? '회원가입' : '로그인'}</h1>
              <p className="sage-description">
                토리의 찻집에 오신 것을 환영합니다
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="analyzer-form">
              <div className="form-section">
                <div className="input-group">
                  <label>이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>비밀번호</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? '처리중...' : (isSignUp ? '회원가입' : '로그인')}
              </button>

              <p style={{ textAlign: 'center', margin: '20px 0' }}>
                {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--starlight-orange)',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  {isSignUp ? '로그인' : '회원가입'}
                </button>
              </p>

              <div className="divider" style={{ margin: '30px 0', textAlign: 'center', color: 'var(--text-muted-color)' }}>
                또는
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  disabled={loading}
                >
                  <span style={{ marginRight: '10px' }}>🔷</span>
                  구글로 로그인
                </button>

                <button
                  type="button"
                  onClick={handleNaverLogin}
                  className="btn btn-secondary"
                  style={{ width: '100%', backgroundColor: '#03C75A', borderColor: '#03C75A' }}
                  disabled={loading}
                >
                  <span style={{ marginRight: '10px' }}>🟢</span>
                  네이버로 로그인
                </button>

                <button
                  type="button"
                  onClick={handleKakaoLogin}
                  className="btn btn-secondary"
                  style={{ width: '100%', backgroundColor: '#FEE500', borderColor: '#FEE500', color: '#000' }}
                  disabled={loading}
                >
                  <span style={{ marginRight: '10px' }}>💬</span>
                  카카오로 로그인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}