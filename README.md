# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits, built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

## Project Overview

Habit Tracker lets you create and manage daily habits, track your current streak, and mark habits complete for today. All data is stored locally in `localStorage` — no backend required. The app installs as a PWA and works offline after an initial load.

---

## Setup

**Prerequisites:** Node.js 18+, pnpm

```bash
cd habit-tracker
pnpm install
```

No Playwright browser installation is needed — the E2E tests are configured to use your system-installed Chrome via `channel: 'chrome'` in `playwright.config.ts`.

---

## Running the App

```bash
pnpm dev        # Development server at http://localhost:3000
pnpm build      # Production build
pnpm start      # Serve production build
```

---

## Running Tests

```bash
pnpm test:unit          # Unit tests (Vitest + coverage report)
pnpm test:integration   # Integration/component tests (Vitest + RTL)
pnpm test:e2e           # End-to-end tests (Playwright)
pnpm test               # All three in sequence
```

> E2E tests automatically build and start the server via the `webServer` config in `playwright.config.ts`. If `pnpm dev` is already running on port 3000, Playwright will reuse it (`reuseExistingServer: true`).

---

## Local Persistence Structure

All data is stored in browser `localStorage` under three keys:

| Key | Shape | Purpose |
|-----|-------|---------|
| `habit-tracker-users` | `User[]` | All registered user accounts |
| `habit-tracker-session` | `Session \| null` | Currently logged-in session |
| `habit-tracker-habits` | `Habit[]` | All habits across all users |

**User shape:**
```json
{ "id": "string", "email": "string", "password": "string", "createdAt": "ISO string" }
```

**Session shape:**
```json
{ "userId": "string", "email": "string" }
```

**Habit shape:**
```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "description": "string",
  "frequency": "daily",
  "createdAt": "ISO string",
  "completions": ["YYYY-MM-DD", ...]
}
```

Habits are filtered by `userId` on the dashboard so each user only sees their own habits. All reads and writes go through `src/lib/storage.ts` using keys defined in `src/lib/constants.ts`.

---

## PWA Support

The app supports installability and basic offline capability via:

- **`public/manifest.json`** — Declares the app name, icons, theme color, and `display: standalone` so browsers offer the "Add to Home Screen" prompt.
- **`public/sw.js`** — A service worker using a network-first with cache fallback strategy. On first load it pre-caches the app shell routes (`/`, `/login`, `/signup`, `/dashboard`). Subsequent navigations are served from cache when offline, preventing a hard crash.
- **Icons** — 192×192 and 512×512 PNGs at `public/icons/`.
- **Registration** — The service worker is registered via an inline script in `src/app/layout.tsx` using `window.addEventListener('load', ...)` so it does not block rendering.

---

## Trade-offs and Limitations

- **No real authentication**: Passwords are stored in plaintext in `localStorage`. This is intentional — the spec prohibits remote databases or external auth services.
- **Single-device only**: Because persistence is in `localStorage`, data does not sync across devices or browsers.
- **No password hashing**: Production apps would hash passwords server-side; this stage is front-end only.
- **Daily frequency only**: The `frequency` field is locked to `'daily'` per spec. The select renders one option as a placeholder for future frequencies.
- **Service worker offline coverage**: The SW caches the Next.js app shell. Since all data is local, there are no API routes to cache.
- **Extra files beyond spec**: `src/components/habits/Dashboard.tsx` is used as the main dashboard logic component rendered by `src/app/dashboard/page.tsx`. The spec permits adding files beyond the required structure.
- **Tailwind v4**: This project uses Tailwind CSS v4 which requires `@tailwindcss/postcss` instead of the traditional `tailwind.config.ts` and `autoprefixer` setup. The `globals.css` uses `@import "tailwindcss"` instead of the three `@tailwind` directives.

---

## Test File Map

| Test file | Behavior verified |
|-----------|------------------|
| `tests/unit/slug.test.ts` | `getHabitSlug` correctly lowercases, trims, collapses spaces into hyphens, and strips non-alphanumeric characters |
| `tests/unit/validators.test.ts` | `validateHabitName` rejects empty and over-60-character inputs, returns trimmed valid value |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` counts consecutive days backward from today, ignores duplicates, returns 0 when today not completed |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` adds/removes dates without mutating the original habit or producing duplicates |
| `tests/integration/auth-flow.test.tsx` | Signup flow creates session, duplicate email is rejected, login stores session, invalid credentials show error |
| `tests/integration/habit-form.test.tsx` | Habit creation, validation, edit preserving immutable fields, delete confirmation, completion toggle updating streak |
| `tests/e2e/app.spec.ts` | Full user journeys: splash screen, auth redirects, protected routes, habit lifecycle, persistence across reload, logout, offline shell |