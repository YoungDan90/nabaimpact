# Naba Impact Platform

AI-powered grants, workshops, and budget management platform for Naba Impact.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Postgres database, Row Level Security)
- **Anthropic Claude API** (grant discovery, application drafting, workshop planning)
- **Tailwind CSS**
- **Vercel** (deployment)

## Features
- 🔍 **AI Grant Finder** — live UK grant search matched to your workshops
- 🏛 **Building Grants** — capital/premises grants for Naba Impact + Alignment Church
- ✍️ **AI Application Drafter** — full applications grounded in your actual workshop programme
- 📋 **Workshop Planner** — AI-generated workshop plans with timed agendas
- 💰 **Budget Tracker** — per-workshop spending against awarded grant budgets
- 👥 **Role-based views** — Director, Coordinator, Finance, Volunteer

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd naba-impact
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial.sql`
3. Go to **Settings > API** and copy your Project URL and anon key

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

Get your Anthropic API key at [console.anthropic.com](https://console.anthropic.com)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add the three environment variables in Vercel's project settings
4. Deploy — done

---

## Role-based Access

| Role | Access |
|------|--------|
| Director | Full access — all tabs |
| Workshop Coordinator | Dashboard, Workshops, Budget |
| Finance | Dashboard, Applications, Budget |
| Volunteer | Workshops (read-focused) |

> To add real authentication, integrate Supabase Auth and update the RLS policies in `001_initial.sql` to use `auth.uid()`.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai-draft/          # AI application drafting
│   │   ├── ai-plan-workshop/  # AI workshop planning
│   │   └── find-grants/       # AI grant discovery (programme + building)
│   ├── dashboard/             # Live overview
│   ├── finder/                # AI Grant Finder
│   ├── workshops/             # Workshop planner + budget
│   ├── applications/          # Application tracker
│   ├── budget/                # Budget tracker
│   └── building/              # Building & premises grants
├── components/
│   ├── Shell.tsx              # Topbar + role switcher layout
│   └── ui.tsx                 # Shared components
├── lib/
│   ├── supabase.ts            # Supabase client
│   └── config.ts              # Roles, constants, Naba context
└── types/
    └── index.ts               # TypeScript types
```

---

## Adding Team Authentication

When you're ready to add proper user accounts:

1. Enable **Email Auth** in Supabase Auth settings
2. Add `@supabase/ssr` middleware for session handling
3. Update RLS policies to use `auth.uid()` per user/role
4. Map Supabase user metadata to the role system in `Shell.tsx`

---

## AI Integration Notes

All AI features use **Claude claude-sonnet-4-20250514** via the Anthropic API.

- Grant discovery uses `web_search` tool for live results
- Application drafts read your Supabase workshops before writing — ensuring every draft is grounded in your real programme
- Workshop plans are generated server-side and saved back to Supabase

The `NABA_CONTEXT` constant in `src/lib/config.ts` defines Naba's identity and is injected into every AI prompt — update this if your organisation details change.
