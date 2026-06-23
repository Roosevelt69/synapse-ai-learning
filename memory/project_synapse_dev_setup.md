---
name: project-synapse-dev-setup
description: Test harness setup for Synapse app — dev seeder, dev panel, auth bypass
metadata:
  type: project
---

Added a complete test harness for streak/lesson verification in May 2026.

**Files created/modified:**
- `utils/devSeeder.ts` — scenario seeders (fresh, active streak, at-risk, broken, course complete, full progress, ready-for-increment)
- `app/dev.tsx` — dev panel screen with live state display and scenario buttons
- `app/index.tsx` — `__DEV__` bypass: no session → uses local AsyncStorage instead of forcing auth
- `app/auth.tsx` — "Skip Auth → Fresh User" and "Open Dev Panel" buttons (dev builds only)
- `app/_layout.tsx` — registered `app/dev.tsx` in the Stack (conditional on `__DEV__`)
- `app/(tabs)/profile.tsx` — "⚙️ Open Dev Panel" button at bottom of profile (dev only)
- `Screenshots/TESTING_GUIDE.md` — screen-by-screen test checklist with streak logic table

**Why:** User needed to simulate lesson completions to verify streak counting without going through the full UI flow for every test run.

**How to apply:** When testing streak/XP logic, run `npx expo start --clear`, use the Dev Panel to seed a scenario, navigate to Home/Profile tabs, pull to refresh, and observe the state.
