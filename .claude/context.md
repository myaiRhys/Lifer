# Lifer Project Context

## Quick Reference

**Full Documentation**: See `PROJECT_KNOWLEDGE.md` for comprehensive architecture details.

## Project Overview
- **Type**: Progressive Web App (PWA) for life management & productivity
- **Philosophy**: Focus on high-leverage activities (impact/effort ratio)
- **Deployment**: GitHub Pages at `/Lifer/`
- **Storage**: 100% offline-first with IndexedDB (no backend)

## Tech Stack
- **Framework**: Svelte 4.2 + TypeScript 5.3
- **Build**: Vite 5.0
- **Styling**: TailwindCSS 3.4 with 11 custom themes
- **Data**: idb-keyval (IndexedDB wrapper)
- **Charts**: Chart.js 4.4
- **PWA**: vite-plugin-pwa 0.19

## Project Structure
```
src/
├── components/        # 23 Svelte components
├── lib/
│   ├── db/           # 19 data persistence modules
│   ├── types/        # TypeScript interfaces
│   └── [utilities]   # themes, sounds, animations, etc.
└── App.svelte        # Root component with routing
```

## Key Conventions

### Component Pattern
```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { getData } from '../lib/db'

  let data = []

  onMount(async () => {
    data = await getData()
  })

  async function handleAction() {
    await updateData()
    data = await getData() // Always refresh after mutations
  }
</script>
```

### Database Pattern
- All DB functions in `src/lib/db/`
- Use typed returns: `Promise<Task[]>`, `Promise<UserState>`, etc.
- Generate IDs with `crypto.randomUUID()`
- Always add timestamps (`createdAt`, etc.)

### Naming
- Components: PascalCase (`TaskList.svelte`)
- DB modules: camelCase (`userState.ts`)
- Types: PascalCase (`UserState`, `Task`)
- Functions: camelCase (`getTasks`, `addXP`)

## Core Concepts

### 1. Leverage Scoring
- Tasks rated 1-10 (impact/effort ratio)
- XP earned: `leverageScore × 10 × multipliers`
- Drives user focus to high-impact work

### 2. Multipliers
- **Morning Multiplier**: 2x XP for tasks completed 6-9 AM
- **BPT Multiplier**: 2x XP during Best Performance Time window

### 3. Data Models (Key Types)
- `UserState` - Player progression (XP, level, streaks, stats)
- `Task` - Work items with leverage scoring
- `Practice` - Daily/scheduled habits (9 core practices)
- `Outcome` - Goals (flat structure)
- `OutcomeNode` - Goals (hierarchical tree)
- `Achievement` - Unlockable badges
- `HistoryRecord` - Activity audit log

### 4. Storage Keys (21 Collections)
See `src/lib/db/keys.ts` for all IndexedDB keys:
- USER_STATE, TASKS, PRACTICES, OUTCOMES, HISTORY
- ACHIEVEMENTS, CHALLENGES, POWER_UPS, CHORES
- FOCUS_SESSIONS, ENERGY_LOGS, BPT_ANALYSIS
- COUPLES_PROFILE, MORNING_SYNCS, OUTCOME_NODES
- BODY_DOUBLING_SESSIONS, SETTINGS, etc.

## Common Development Tasks

### Adding a New Feature
1. Create component in `src/components/`
2. Add DB module in `src/lib/db/` if needed
3. Add types to `src/lib/types/index.ts`
4. Update `App.svelte` routing if new view
5. Add storage key to `src/lib/db/keys.ts`
6. Initialize in `src/lib/db/init.ts` if needed

### Adding a Practice
1. Add definition to `CORE_PRACTICES` in `src/lib/db/init.ts`
2. Will auto-seed for new users
3. Existing users get it on next app load

### Adding an Achievement
1. Add definition to `src/lib/achievements.ts`
2. Define condition function
3. Achievement system auto-checks after actions

## Important Files
- `PROJECT_KNOWLEDGE.md` - Complete architecture documentation
- `src/App.svelte` - Main routing and settings
- `src/lib/types/index.ts` - All TypeScript interfaces
- `src/lib/db/init.ts` - Database initialization
- `src/lib/achievements.ts` - Achievement definitions
- `vite.config.ts` - Build and PWA configuration

## Design Principles
1. **Offline-first**: All features work without network
2. **Privacy**: No data leaves the device
3. **Leverage over volume**: Quality > quantity of tasks
4. **Type safety**: Strict TypeScript throughout
5. **Component autonomy**: Each component manages its own data loading

## When in Doubt
- Check `PROJECT_KNOWLEDGE.md` for detailed explanations
- Look at similar existing components for patterns
- All DB operations follow same CRUD pattern
- TypeScript types guide correct usage
