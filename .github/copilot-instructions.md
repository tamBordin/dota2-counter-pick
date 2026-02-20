# Copilot / AI Agent Instructions for dota2-counter-pick

This project is a small Next.js app that provides Dota 2 counter-pick suggestions using local cached data and lightweight analysis logic. The goal of this file is to give an AI coding agent the minimal, actionable context to be productive immediately.

- Project root: Next.js app (app router) with client components in `src/components` and hooks in `src/hooks`.
- Key data caches: `src/data/heroes.json` and `src/data/matchups.json` are authoritative local datasets used by `src/lib/dotaApi.ts`.
- Main analysis logic: `src/lib/counterLogic.ts` — change here for matchmaking, scoring, item heuristics, or counter classification.
- UI state & wiring: `src/hooks/useDraft.ts` controls fetching, URL sync, team state, and exposes handlers used by UI components (`DraftBoard`, `HeroGrid`, `TeamAnalyzer`).

Quick run / developer commands

- Start dev server: `npm run dev` (Next.js 16 / React 19).
- Build: `npm run build`, Start prod: `npm run start`.
- Update cached hero data: `npm run update-data` (runs `scripts/update-heroes.ts` via `npx tsx`).
- Update matchups cache: `npm run update-matchups` (polite-rate-limited bulk fetch; relies on `src/data/heroes.json`).

Important architecture notes (big picture)

- Data flow: UI components call hooks (`useDraft`) → hooks use `src/lib/dotaApi.ts` to read local JSON caches (or fallback to OpenDota API) → `src/lib/counterLogic.ts` computes suggestions using `matchups.json` + hero metadata.
- Offline-first: The app prefers local JSON caches in `src/data`. Scripts under `scripts/` are used to refresh these caches; avoid changing runtime code to fetch live data without considering file size & rate limits.
- Server route: `src/app/api/patch/route.ts` fetches the latest patch meta from Valve and is used by `fetchCurrentPatch()` in `dotaApi.ts`.

Project-specific patterns & conventions

- Local cache + fallback: `fetchHeroMatchups` reads `src/data/matchups.json` first, then falls back to OpenDota via axios when missing. Keep this pattern when adding new data sources.
- Scoring conventions: `calculateAdvantage` in `counterLogic.ts` aggregates per-enemy advantages, normalizes by enemy team size, and classifies counters via `classifyCounter`. If you need to change weighting, modify this function (example: change advantage normalization or add role-based multipliers).
- Role detection: `analyzeRole(hero)` uses `hero.roles` and `primary_attr` to return 'Core' | 'Support' | 'Flex' — UI filters suggestions by these roles.
- URL state: `useDraft` syncs picks to URL params `r` and `d` and `side`; keep this behavior when modifying selection handlers to preserve shareable URLs.

Integration & extension points (where to change things)

- To change suggestion output shape: edit `getCategorizedSuggestions` in `src/lib/counterLogic.ts`.
- To alter when matchups are fetched: edit `fetchHeroMatchups` in `src/lib/dotaApi.ts` or change prefetch logic in `useDraft` initialization.
- To add new item counters or categories: edit `src/data/items.ts` (data-driven), plus UI in `components/` that render item suggestions.
- To update patch-fetching behavior, modify `src/app/api/patch/route.ts` and the client call in `dotaApi.ts`.

Examples (explicit pointers)

- If you want to make counters favor recent patch trends, add a modifier in `counterLogic.getCategorizedSuggestions` that uses `getHeroWinRate()` or `isTrending()` from `src/lib/dotaApi.ts`.
- To persist additional UI state to the URL, follow the pattern in `useDraft` (build a search string with `URLSearchParams` and call `window.history.replaceState`).

Testing & debugging tips

- There are no automated tests in the repo. For fast feedback, run the dev server and use the browser UI at `http://localhost:3000`.
- Inspect network fallbacks when a hero id is missing from `matchups.json` — `fetchHeroMatchups` will log a cache-miss warning and attempt an axios request.
- Scripts use `npx tsx` so ensure Node >= 18 and `npm install` are run before `npm run update-data`.

Files to reference when making changes

- `src/lib/counterLogic.ts` — core scoring & item-selection heuristics
- `src/lib/dotaApi.ts` — data access, caching fallback, helper utilities (win rate, images)
- `src/hooks/useDraft.ts` — app state, URL sync, prefetching logic
- `src/data/heroes.json`, `src/data/matchups.json`, `src/data/items.ts` — primary datasets
- `scripts/update-heroes.ts`, `scripts/update-matchups.ts` — data refresh scripts

If anything in this file is unclear or you'd like more examples (small patches to scoring, tests, or a new API endpoint), tell me which area and I'll expand with concrete code edits and tests.
