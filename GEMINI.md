# Dota 2 Counter Pick - Project Overview

A high-performance, real-time drafting and counter-pick analysis tool for Dota 2, built with Next.js and TypeScript. The application provides strategic insights by analyzing hero matchups and team compositions using data from OpenDota and official Valve feeds.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS 4 (using `@tailwindcss/postcss`).
- **Icons:** Lucide React.
- **Data Fetching:** Axios.
- **Data Sources:** 
  - OpenDota API (Matchups and stats).
  - Valve Official Datafeed (Patch versions).
  - Steam CDN (Hero images).

## Project Structure

```text
src/
├── app/                # Next.js App Router
│   ├── api/patch/      # Proxy route to fetch latest patch from Valve
│   ├── globals.css     # Custom Dark Theme & global styles
│   └── page.tsx        # Main application entry and state management
├── components/         # Modular UI components
│   ├── DraftBoard.tsx  # Team slots (5v5) visualization
│   ├── HeroGrid.tsx    # Hero selector with role filtering and split-hover logic
│   └── TeamAnalyzer.tsx # Team balance metrics (Stuns, Tanks, Dmg types)
├── data/               # Static data and caches
│   └── heroes.json     # Hero metadata cache (ID, Name, Roles, Attributes)
└── lib/                # Core business logic
    ├── counterLogic.ts # Advantage scoring algorithms
    └── dotaApi.ts      # API integration and image URL helpers
```

## Key Features

1.  **Smart Counter Logic:** Calculates "Advantage Scores" based on enemy selections using real-time win-rate matchups.
2.  **Team Analysis:** Visualizes team composition balance including crowd control, durability, and damage type split (Magic vs Physical).
3.  **Split-Hover Drafting:** A high-efficiency UI allowing users to hover a hero and immediately pick for either "Us" (Radiant) or "Enemy" (Dire).
4.  **Shareable Drafts:** Draft states are synchronized with the URL query parameters (`r` for Radiant, `d` for Dire), allowing users to share draft links.
5.  **Official Patch Tracking:** Automatically displays the current Dota 2 patch version by fetching data directly from Valve.
6.  **CDN Integration:** Optimized image loading via Steam's Cloudflare CDN to bypass OpenDota rate limits.

## Building and Running

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Start Production:** `npm run start`
- **Linting:** `npm run lint`

## Development Conventions

- **Clean Code:** Keep the codebase free of unnecessary comments.
- **Architecture:** Maintain a clear separation between calculation logic (`lib/`) and UI presentation (`components/`).
- **Performance:** Use `useMemo` for heavy advantage calculations and team analysis.
- **CDN Usage:** Always use `getHeroImageUrl` from `dotaApi.ts` for hero assets to ensure scalability.
- **Local Cache:** Update `src/data/heroes.json` when new heroes are added to the game or primary attributes change.
