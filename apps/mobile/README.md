# TaskFlow Mobile (Expo)

Minimal Android companion app. **Not part of the Vercel web deploy** — installed and run only from this folder.

## Flow (what to explain)

1. `App.tsx` holds local task state
2. Tasks persist with `AsyncStorage`
3. UI lets you add / complete / delete tasks
4. “Open full TaskFlow web app” opens the browser URL

## Setup

Requires **Expo Go SDK 54** (current Play Store / App Store version).

```bash
cd apps/mobile
npm install --legacy-peer-deps
npx expo start
```

Scan the QR code with **Expo Go** on your phone (same Wi‑Fi), or use `--tunnel` if needed.

> Root `npm run build` / Vercel only builds `apps/web`. Mobile deps are **not** in the npm workspaces install.
