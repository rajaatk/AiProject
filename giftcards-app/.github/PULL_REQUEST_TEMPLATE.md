## Summary
- Gift card scanner app with storage and expiry notifications
- Expo Router navigation, SQLite on native, localStorage on web

## Changes
- Routing: `app/_layout.tsx`, screens under `app/`
- Storage: `lib/db.native.ts` (expo-sqlite), `lib/db.web.ts` (localStorage)
- Notifications: `lib/notifications.ts`; guarded on web
- Config: `package.json` main -> `expo-router/entry`, `app.json` plugins

## How to test
1. Install deps: `npm install`
2. Web: `npm run web` → Add a card, verify it appears and persists on refresh
3. Android/iOS: `npm run android`/`npm run ios` → Add card; if expiry set, a scheduled notification should be created

## Screenshots
<!-- Attach screenshots or recordings if available -->

## Notes
- `App.tsx` and `index.ts` are kept but unused by router
- Web uses localStorage; can upgrade to IndexedDB later