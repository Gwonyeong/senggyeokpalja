import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // 서버 사이드에서 실행되는 경우 처리
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return [];
          return document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='))
            .reduce((acc, [name, value]) => {
              if (name && value) {
                acc.push({ name, value: decodeURIComponent(value) });
              }
              return acc;
            }, []);
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined' || typeof window === 'undefined') return;
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = {
              ...options,
              secure: window.location.protocol === 'https:',
              sameSite: 'lax',
              path: '/',
            };

            let cookieString = `${name}=${encodeURIComponent(value)}`;

            if (cookieOptions.maxAge) {
              cookieString += `; Max-Age=${cookieOptions.maxAge}`;
            }
            if (cookieOptions.domain) {
              cookieString += `; Domain=${cookieOptions.domain}`;
            }
            if (cookieOptions.path) {
              cookieString += `; Path=${cookieOptions.path}`;
            }
            if (cookieOptions.secure) {
              cookieString += `; Secure`;
            }
            if (cookieOptions.sameSite) {
              cookieString += `; SameSite=${cookieOptions.sameSite}`;
            }

            document.cookie = cookieString;
          });
        },
      },
    }
  );
}