'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { upsertProfile } from '@/lib/supabase-auth';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();

      try {
        // URL에서 인증 코드 처리
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=callback_failed');
          return;
        }

        if (data.session) {
          // 사용자 프로필 생성/업데이트
          await upsertProfile(data.session.user);

          // 홈페이지로 리디렉트
          router.push('/');
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        router.push('/auth/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>🔮</div>
      <p>로그인 처리 중...</p>
    </div>
  );
}