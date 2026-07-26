# TaskFlow Chrome Extension

Manifest V3 extension for **quick task capture** and **recent task viewing**, wired to the TaskFlow web app.

## Features

- Popup: create a task + view recent tasks
- Context menu: **Add to TaskFlow** on selected text
- Context menu: **Save page as TaskFlow task**
- Badge shows open task count
- Desktop notification on capture
- Token auth from TaskFlow Settings (works even when cookies are not shared)

## Load in Chrome (for your Loom demo)

1. Start the web app: from the monorepo root run `npm run dev`
2. Sign in at [http://localhost:3000](http://localhost:3000)
3. Open **Settings → Chrome extension → Generate token** and copy it
4. Chrome → `chrome://extensions`
5. Enable **Developer mode**
6. **Load unpacked** → select this folder: `apps/extension`
7. Click **Details → Extension options** (or the ⚙ in the popup)
8. Set App URL to `http://localhost:3000` and paste the token → **Save** → **Test**
9. Pin the extension, open the popup, add a task
10. On any webpage, highlight text → right-click → **Add to TaskFlow**

## Project files

```
apps/extension/
├── manifest.json
├── background.js          # context menus, badge, notifications
├── popup.html / popup.js  # quick create + recent list
├── options.html / options.js
├── lib/api.js
└── icons/
```

## API used

- `GET /api/extension/tasks` — recent tasks + pending count
- `POST /api/extension/tasks` — create task
- `POST /api/extension/token` — generate token (web Settings)
- `DELETE /api/extension/token` — revoke token
