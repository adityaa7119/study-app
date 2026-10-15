# StudyBuddy 📚

A production-grade AI-powered study platform for competitive exam aspirants (JEE, NEET, UPSC).

## Tech Stack

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide React
- **State**: Zustand with localStorage persistence
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI Tutor**: Google Gemini 3.8 Flash via `@google/genai` Interactions API
- **Charts**: Recharts
- **Deployment**: Vercel

## Features

| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Focus hours, streak, credits, exam countdown, 7-day study chart, subject progress |
| 📅 Planner | Interactive 7-day timetable with slot CRUD and one-click focus launch |
| 🛡️ Focus Shield | 25/50/90 min Pomodoro with tab-switch detection, credits, and ambient sounds |
| 🏆 Quiz Arena | Daily/weekly/duel quizzes with timer, explanations, and credit wagers |
| 📖 Library | Searchable formula cards and markdown notes viewer |
| 🤖 StudyBot | Gemini-powered AI chat with TTS, quick prompts, and conversation memory |
| ⚙️ Settings | Theme picker (Light/Dark/AMOLED), profile editor, credit shop |

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd studybuddy
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**
3. Copy your project URL and anon key from **Settings → API**

### 3. Get Gemini API Key

1. Visit [ai.google.dev](https://ai.google.dev) → **Get API Key**
2. Create a new key (free tier is sufficient)

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add GEMINI_API_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Production deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Project Structure

```
studybuddy/
├── app/
│   ├── (app)/                    # Protected route group
│   │   ├── layout.tsx            # Auth check + profile fetch
│   │   ├── dashboard/page.tsx
│   │   ├── planner/page.tsx
│   │   ├── quiz/page.tsx
│   │   ├── library/page.tsx
│   │   ├── focus/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   └── ai-tutor/route.ts     # Gemini API route handler
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing / auth page
│   └── globals.css
├── components/
│   ├── ai/StudyBot.tsx           # Chat slide-over
│   ├── auth/AuthForm.tsx
│   ├── dashboard/DashboardClient.tsx
│   ├── focus/FocusOverlay.tsx    # Full-screen focus mode
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   ├── library/LibraryClient.tsx
│   ├── planner/PlannerClient.tsx
│   ├── providers/ThemeInitializer.tsx
│   ├── quiz/QuizClient.tsx
│   ├── settings/SettingsClient.tsx
│   └── ui/Toaster.tsx
├── lib/
│   ├── store/useAppStore.ts      # Zustand global store
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client (SSR)
│   ├── types/database.ts         # TypeScript DB types
│   └── utils.ts
├── middleware.ts                  # Auth route protection
├── supabase/schema.sql            # Full DB schema + seed
├── .env.example
└── package.json
```

## Credit System

| Action | Credits |
|--------|---------|
| Welcome bonus | +100 |
| Focus session complete | +1.5× minutes |
| Early quit | -5 to -20 |
| Quiz correct answer | +10 each |
| Duel win (≥60%) | +50 (net) |
| Duel loss | -50 |
| Streak freeze | -100 |
| Bonus quiz set | -150 |
| XP boost | -200 |

## Supabase Auth Setup

In Supabase Dashboard → **Authentication → Settings**:
- Enable **Email** provider
- Set **Site URL** to your Vercel URL
- Add `http://localhost:3000/**` to **Redirect URLs** for local dev

## License

MIT
