# TaskFlow

Premium SaaS task management — **one monorepo** for web, Chrome extension, mobile, and desktop.

TaskFlow is production-oriented: Supabase Auth, local-first persistence with Supabase sync, analytics, activity timeline, Kanban, calendar, categories, and a polished dashboard.

## Monorepo structure

```
task/
├── apps/
│   ├── web/          # Next.js 16 App Router (primary product)
│   ├── extension/    # Chrome extension shell
│   ├── mobile/       # Expo / React Native shell
│   └── desktop/      # Electron / Tauri shell
├── packages/
│   ├── shared/       # Types, Zod schemas, constants, utils (@taskflow/shared)
│   └── ui/           # Design tokens (@taskflow/ui)
└── package.json      # npm workspaces root
```

Shared business logic lives in `@taskflow/shared`. Visual tokens live in `@taskflow/ui`. Platform apps should import those packages instead of duplicating rules or colors.

## Tech stack (web)

- Next.js 16 · React 19 · TypeScript · Tailwind CSS 4
- shadcn/ui · Framer Motion · Lucide · Recharts · @dnd-kit
- React Hook Form · Zod · Sonner
- Supabase Auth · Prisma · PostgreSQL · Resend

## Features

- Landing, signup/login, protected routes, profile + settings
- Dashboard with live stats, charts, upcoming tasks, activity
- Tasks CRUD, search, filters, sort, reminders, undo delete
- Categories, Kanban board, calendar
- Analytics (weekly/monthly charts, streaks, productivity score)
- Activity timeline (searchable / filterable)
- Skeleton loaders, empty states, 404 / error boundaries
- Responsive layout (desktop → mobile bottom nav)

## Installation

```bash
npm install
cp apps/web/.env.example apps/web/.env
```

Fill `apps/web/.env` with your Supabase, database, and Resend values (see below).

### Database schema (Supabase SQL Editor)

Run these in order:

1. `apps/web/supabase/schema.sql` — profiles + tasks
2. `apps/web/supabase/schema-phase2.sql` — categories, settings, reminders, profile extras

Then generate the Prisma client:

```bash
npm run db:generate
```

Optional (if your Postgres host is reachable from your machine):

```bash
npm run db:push
```

> Note: Supabase direct `db.*.supabase.co:5432` is often IPv6-only. Prefer the **connection pooler** URLs from the Supabase dashboard. The web app also persists to `apps/web/.data/` and syncs via the Supabase service role when tables exist.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only admin key (never expose to client) |
| `DATABASE_URL` | Recommended | Prisma / pooler connection string |
| `DIRECT_URL` | Recommended | Direct/session URL for migrations |
| `RESEND_API_KEY` | For email | Resend API key |
| `RESEND_FROM_EMAIL` | For email | Verified sender address |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL (auth redirects) |
| `NEXT_PUBLIC_APP_NAME` | Optional | Brand name (default TaskFlow) |

See `apps/web/.env.example` for a complete template.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Next.js web app |
| `npm run build` | Generate Prisma client + build web |
| `npm run db:generate` | Prisma generate |
| `npm run db:push` | Push schema to Postgres |
| `npm run db:studio` | Open Prisma Studio |

## Deployment (Vercel)

1. Import the monorepo into Vercel.
2. Set **Root Directory** to the repo root (or configure workspace build).
3. Build command: `npm run build`
4. Output: Next.js app at `apps/web` — set project root to `apps/web` *or* use root scripts that target `@taskflow/web`.
5. Add all environment variables from the table above.
6. Set `NEXT_PUBLIC_APP_URL` to your production domain.
7. In Supabase Auth → URL configuration, add the production site URL and redirect URLs (`/auth/callback`).
8. Redeploy after env changes.

### Security checklist

- Never commit `.env` or service-role keys
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only
- Protected routes are enforced in middleware (`/dashboard`, `/tasks`, `/analytics`, `/activity`, …)
- Inputs validated with Zod in server actions
- API routes should always resolve the authenticated user before mutating data

## Folder map (web)

```
apps/web/src/
├── actions/       # Server actions (auth, tasks, categories, profile, activity)
├── app/           # App Router pages, API routes, error/loading boundaries
├── components/    # UI + shared layout components
├── features/      # Feature shells (dashboard, analytics, board, …)
├── lib/           # Supabase clients, analytics, local store, utils
├── providers/     # Theme / toast providers
└── services/      # Data access layer
```

## Mobile (Expo) & Desktop (Tauri)

Minimal companion apps live **outside** the npm workspaces used by Vercel, so they do not affect web deploys.

| App | Folder | Run |
|-----|--------|-----|
| Android (Expo) | `apps/mobile` | `cd apps/mobile && npm install && npx expo start` |
| Desktop (Tauri) | `apps/desktop` | Install Rust, then `cd apps/desktop && npm install && npm run tauri:dev` |

Root scripts (optional): `npm run mobile:start`, `npm run desktop:dev`  
Root `npm run build` / Vercel still build **only** `@taskflow/web`.

## Realtime (live tasks)

Dashboard and My Tasks subscribe to **Supabase Realtime** (`postgres_changes` + broadcast).

1. Run `apps/web/supabase/schema-realtime.sql` in the Supabase SQL Editor (once)
2. Open TaskFlow in two browser tabs
3. Create/complete a task in one tab — the other updates without a manual refresh (look for the **Live** badge)

## Chrome extension

Quick-capture extension in `apps/extension` (Manifest V3).

1. Run `npm run dev` and sign in at localhost:3000
2. **Settings → Chrome extension → Generate token**
3. Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → select `apps/extension`
4. Extension Options: paste token, URL `http://localhost:3000`, click **Test**
5. Popup: create/view tasks · Right-click selection → **Add to TaskFlow**

Full demo steps: `apps/extension/README.md`.

## License

Private — all rights reserved unless otherwise noted.
