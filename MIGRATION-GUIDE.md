# 성격팔자 Next.js + Supabase Migration Guide

## 📋 마이그레이션 체크리스트

### 1. Supabase 프로젝트 설정
- [ ] [Supabase](https://supabase.com) 계정 생성
- [ ] 새 프로젝트 생성
- [ ] 프로젝트 URL과 API 키 복사

### 2. 환경 변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local` 파일에 Supabase 정보 입력

### 3. 데이터베이스 스키마 생성
Supabase Dashboard > SQL Editor에서 `database/schema.sql` 실행

### 4. 데이터 마이그레이션
```bash
# 필요한 패키지 설치
cd scripts
npm install firebase-admin dotenv

# 마이그레이션 실행
node migrate-firebase-to-supabase.js
```

### 5. 인증 설정
Supabase Dashboard > Authentication에서:
- Google OAuth 설정
- Naver OAuth 설정 (커스텀 provider)
- Kakao OAuth 설정 (커스텀 provider)

## 🚀 개발 서버 실행
```bash
npm run dev
```

## 📁 프로젝트 구조
```
nextjs-app/
├── app/                  # Next.js App Router
│   ├── page.js          # 홈페이지 (index.html)
│   ├── analyze/         # 분석 페이지
│   ├── synergy/         # 시너지 분석
│   ├── mypage/          # 마이페이지
│   └── admin/           # 관리자 대시보드
├── components/          # React 컴포넌트
├── lib/                 # Supabase 클라이언트
├── database/           # SQL 스키마
└── scripts/            # 마이그레이션 스크립트
```

## 🔄 주요 변경사항

### Firebase → Supabase
- **Authentication**: Firebase Auth → Supabase Auth
- **Database**: Firestore/Realtime DB → PostgreSQL
- **Storage**: Firebase Storage → Supabase Storage
- **Functions**: Cloud Functions → Edge Functions / API Routes

### HTML/JS → Next.js
- **라우팅**: 파일 기반 라우팅 (App Router)
- **상태 관리**: React Hooks
- **스타일링**: Tailwind CSS
- **API**: Next.js API Routes

## 📝 참고사항
- User Auth 마이그레이션은 수동으로 진행 필요
- `users-to-migrate.json` 파일 확인
- 소셜 로그인 재설정 필요