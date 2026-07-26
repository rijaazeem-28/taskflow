# TaskFlow Desktop (Tauri + Rust)

Minimal Windows/macOS/Linux desktop shell. **Not part of the Vercel web deploy** — run only from this folder with its own `npm install`.

## Flow (what to explain)

1. **Frontend** (`src/main.js`) — local task list in `localStorage` (add / complete / delete)
2. **Vite** serves the UI on port `1420` during development
3. **Rust/Tauri** (`src-tauri`) — wraps that UI in a native window and can open the full web app via the opener plugin
4. Root / Vercel `npm run build` never builds this app

## Prerequisites

1. [Rust](https://www.rust-lang.org/tools/install) (`rustup`) — restart the terminal after install
2. Windows: [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Desktop development with C++)
3. Node 20+

## Setup

```bash
cd apps/desktop
npm install
npm run tauri:dev
```

Build installer (optional):

```bash
npm run tauri:build
```

> Tip: keep the web app separate (`npm run dev` in the monorepo root). This desktop app is a lightweight companion, not a second Vercel deploy.
