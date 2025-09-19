# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Operations
- `npm run db:generate` - Generate Prisma client from schema
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio for database exploration
- `npm run db:seed` - Seed database with initial data

### Migration
- `npm run migrate:firebase` - Migrate data from Firebase to Supabase

### Testing Single Components
When testing a specific page or component:
1. Start dev server: `npm run dev`
2. Navigate to the specific route (e.g., `/analyze`, `/synergy`, `/mypage`)

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.3 with App Router
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Auth**: Supabase Auth (Google, Naver, Kakao social providers)
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Korean Calendar**: manseryeok library for lunar calendar calculations

### Application Flow
1. **Authentication**: Users authenticate via Supabase Auth with social providers
2. **Analysis**: Birth date/time input → Korean saju calculations → Personality type determination → Results display
3. **Data Storage**: Analysis results stored in PostgreSQL with user profiles
4. **Sharing**: Server-side rendered share pages with dynamic metadata for social platforms

### Key Modules
- `lib/saju-utils.js`: Korean traditional fortune-telling calculations (천간, 지지, 오행)
- `lib/supabase.js`: Supabase client initialization and auth helpers
- `lib/share-data.js`: In-memory store for temporary share data
- `lib/user-utils.js`: User profile and authentication utilities

### Database Operations
**IMPORTANT**: All database operations MUST use Prisma ORM exclusively.
- **Server-side only**: Import `import { prisma } from '@/lib/prisma'` ONLY in API routes
- **Client-side**: NEVER import Prisma directly - use API routes instead
- NEVER use direct Supabase database calls (`.from()`, `.insert()`, `.update()`, `.delete()`)
- Use Supabase ONLY for authentication, not data operations
- Pattern: Client → API Route → Prisma → Database

### Database Schema (Prisma)
Main tables:
- `profiles`: User profiles extending Supabase auth.users
- `personality_types`: 16 MBTI × Palja personality combinations
- `analysis_results`: User's personality analysis history
- `synergy_analysis`: Compatibility analysis between users
- `saved_results`: User's bookmarked analyses

### API Routes Pattern
API routes in `app/api/` handle:
- User profile operations
- Analysis result storage
- Share data management
- Admin operations

### Styling Theme
- Dark theme with Korean aesthetic (ink-black #0a0a0a, gold #d4af37)
- Fonts: Noto Serif KR (titles), Pretendard (body)
- Custom CSS variables in `app/globals.css` for consistent theming

### Migration Context
Project is transitioning from Firebase to Supabase:
- Legacy Firebase config exists for migration purposes
- Use Supabase for all new features
- Migration scripts in `scripts/` directory

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=postgresql://...
```

For migration:
```
SUPABASE_SERVICE_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```