# Copilot instructions — dota2-counter-pick

Purpose: quick reference for Copilot sessions so suggestions and edits are aligned with this repository's structure and conventions.

หมายเหตุการสื่อสาร: พูดกับผู้ใช้เป็นภาษาไทยเท่านั้น.

---

## Quick commands (build / dev / lint / data)
- Development server: `npm run dev` (runs `next dev`).
- Build for production: `npm run build` (runs `next build`).
- Start production server: `npm run start` (runs `next start`).
- Linting: `npm run lint` (runs `eslint`). To lint a single file: `npx eslint path/to/file.tsx`.
- Update hero cache: `npm run update-data` (runs `npx tsx scripts/update-heroes.ts`).
- Update matchup cache (bulk; slow, respects OpenDota limits): `npm run update-matchups` (runs `npx tsx scripts/update-matchups.ts`).

Note: There are no test scripts or test framework configured in package.json at the time of writing.

---

## High-level architecture
- Framework: Next.js (App Router) in `src/app/`. `src/app/page.tsx` is the main client page (uses `"use client"`) and composes header, draft board, hero grid, analysis, and footer UI.
- State & orchestration: `src/hooks/useDraft.ts` manages app state, loads `heroes.json` and `matchups.json`, prefetches matchups, computes suggestions, and synchronizes draft state with the URL query params (`r`, `d`, `side`). Use this hook as the single source of truth for draft interactions.
- Data layer: `src/lib/dotaApi.ts` exposes: `fetchHeroes` (returns `src/data/heroes.json`), `fetchHeroMatchups` (reads `src/data/matchups.json` or falls back to OpenDota API), `fetchCurrentPatch`, `getHeroImageUrl` (returns Steam CDN), and light meta helpers (`getHeroWinRate`, etc.).
- Business logic: `src/lib/counterLogic.ts` contains core algorithms: `calculateAdvantage`, `analyzeRole`, `classifyCounter`, and `getCategorizedSuggestions`. These functions return structured suggestion objects used by the UI.
- Local caches: `src/data/heroes.json` and `src/data/matchups.json` are authoritative local caches to avoid frequent OpenDota API calls; update them using the `scripts/` tools.
- UI components: `src/components/` contains `DraftBoard`, `HeroGrid`, `TeamAnalyzer`, `AnalysisEngine`, and other UI pieces; components expect typed data from the lib/hook layers.
- Path alias: `@/*` -> `./src/*` as defined in `tsconfig.json` (use `@/lib/...`, `@/components/...`, etc.).

---

## Key repository conventions (follow when editing or adding features)
- Use the data helpers in `src/lib/dotaApi.ts` rather than constructing CDN URLs or calling OpenDota directly—e.g., `getHeroImageUrl(img)` centralizes the Steam CDN path.
- Prefer reading from local caches (`src/data/*.json`) in production code. Use `scripts/update-heroes.ts` and `scripts/update-matchups.ts` to refresh caches; `update-matchups` is intentionally rate-limited and can take a long time.
- Draft persistence: shareable drafts synchronize to URL query params `r` (Radiant IDs comma-separated), `d` (Dire IDs comma-separated), and `side` (user side). Example: `/?r=1,2,3&d=4,5&side=radiant`.
- Heavy calculations belong in `src/lib/counterLogic.ts` and are consumed via `useMemo` in hooks/components; avoid re-running expensive loops inside renders.
- Client vs server: `src/app/page.tsx` is a client entrypoint; components interacting with browser APIs or hooks should be client components (`"use client"`) and imported accordingly.
- Importing: use the `@/` alias (e.g., `import { fetchHeroes } from '@/lib/dotaApi'`) to keep imports consistent.
- Scripts use `npx tsx` (no compilation step required) — maintain the pattern when adding small utility scripts.

---

## Where to look for common tasks
- Modify counter logic / algorithms: `src/lib/counterLogic.ts`.
- Change data fetching or cache behavior: `src/lib/dotaApi.ts` and `scripts/`.
- Update UI: `src/components/` and `src/app/page.tsx` for composition.
- Draft state and URL sync: `src/hooks/useDraft.ts`.

---

## Other automation / AI assistant configs checked
- Searched for common assistant files (CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules, CONVENTIONS.md, AIDER_CONVENTIONS.md, .clinerules, .cline_rules) and none were found in the repository root or subfolders.

---

If you want Copilot to make safe, focused changes, prefer edits that touch one logical area (data, lib, or UI) at a time; the `useDraft` hook and `counterLogic` are the highest-impact places for algorithm or state behavior changes.

