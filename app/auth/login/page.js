'use client';

import { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase-config';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (error) {
      setError('구글 로그인 실패: ' + error.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (error) {
      setError(error.message);
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {isSignUp ? '회원가입' : '로그인'}
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

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                <span style={{ marginRight: '10px' }}>🔷</span>
                구글로 로그인
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}