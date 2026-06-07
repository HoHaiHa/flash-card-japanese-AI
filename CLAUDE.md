# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Japanese flashcard SPA (React + Vite) for Vietnamese learners. Cards are stored in Supabase and cover three content types: vocabulary (`vocab`), grammar sentences (`sentence`), and kanji (`kanji`). Study settings persist to `localStorage`.

## Commands

```bash
npm run dev        # Start dev server (Vite, localhost:5173)
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Run Vitest unit tests (Node, no browser)
npm run preview    # Preview production build
```

### Database scripts (Node ESM, require `.env` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`)

```bash
node scripts/setup-db.js          # Create tables via direct Postgres connection (needs DATABASE_PASSWORD or DIRECT_URL in .env)
node scripts/import-to-db.js      # Import scripts/temp-lesson-data.json → Supabase
node scripts/check-db.js          # Verify Supabase connection and inspect table counts
node scripts/clear-db.js          # Wipe all lesson data from DB
```

### Environment setup

Copy `.env.example` → `.env` and fill in:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
`setup-db.js` additionally needs `DATABASE_PASSWORD` or `DIRECT_URL` for a direct Postgres connection (not the anon key).

## Architecture

### Screen flow

`App.jsx` manages a single `currentScreen` state (`'config' | 'list' | 'flashcard'`). No router — screen switches are handled via `setCurrentScreen`.

```
LearningConfig  →  FlashcardStudy   (onStart with config object)
              ↘   StudyList          (onViewList with lessonId)
```

### Data layer (`src/services/db.js`)

All Supabase access is centralized here. Key functions:

- `getLessons()` — fetches `lessons` table for the config screen dropdown
- `getCardsForLesson(lessonId)` — fetches all cards for a single lesson (used by StudyList)
- `getCardsForLessons(lessonIds, contentTypes)` — fetches cards across multiple lessons filtered by type (used by FlashcardStudy)
- `updateCardFavorite(cardId, type, favorite)` — routes to `vocabularies` or `sentences` table based on `type`
- `updateCardStatus(cardId, type, status)` — `status` is `'learned' | 'forgot'`; `mastered` in app state = `status === 'learned'` in DB
- `saveSessionResult(sessionData)` — writes to `study_sessions` table at end of session
- `getStudySettings()` / `saveStudySettings()` — read/write `localStorage` key `seishun_study_settings`

DB record fields are snake_case; `mapRecordToCard()` converts them to camelCase for the app.

### Supabase tables

| Table | Key columns |
|---|---|
| `lessons` | `id`, `name`, `level`, `created_at` |
| `vocabularies` | `id`, `lesson_id`, `type` (`vocab`\|`kanji`), `kana`, `kanji`, `definition`, `details`, `components` (jsonb), `favorite`, `status`, `onyomi`, `kunyomi`, `radical_analysis`, `character_logic`, `sino_vietnamese` |
| `sentences` | `id`, `lesson_id`, `type` (`sentence`), `kana`, `kanji`, `definition`, `details`, `components` (jsonb), `favorite`, `status` |
| `study_sessions` | `id`, `total_cards`, `learned_count`, `forgot_count`, `created_at` |

### FlashcardStudy state model

- `originalCards` — raw list from DB, never filtered
- `activeCards` — derived via `useMemo` from `originalCards` + filter flags (`unlearnedOnly`, `favoritesOnly`, `isShuffled`)
- `studyResponses` — `{ [cardId]: 'learned' | 'forgot' }`, initialized from `card.mastered` on load
- `favorites` — `{ [cardId]: bool }`, initialized from `card.favorite` on load
- `cardRanks` — stable random ranks (ref, not state) assigned once per shuffle toggle; keeps shuffle order stable across re-renders
- Favorite and status mutations use **optimistic updates** with rollback on DB error

Card flip uses a nested Swiper (`effect='cube'`, `allowTouchMove=false`) inside the main horizontal Swiper. Tap triggers `innerSwiper.slideNext()`. The outer Swiper advances cards left/right.

### Card rendering

`renderCardFaces(card)` in `FlashcardStudy` returns `SwiperSlide` elements per card type:
- `vocab`: 2 faces (front = JP, back = VN meaning); flipped in vi-ja mode
- `sentence`: 2 faces (grammar pattern → example + particle breakdown)
- `kanji`: 3 faces (character → Sino-Vietnamese meaning → radical analysis)

### Testing

Tests live in `src/services/db.test.js` (Vitest). The `supabaseClient` module is fully mocked with `vi.mock`. `localStorage` is polyfilled with an in-memory store. Run a single test file: `npx vitest run src/services/db.test.js`.

## Agentic Development Lifecycle

This repo has the [Agentic Development Lifecycle](https://www.npmjs.com/package/agentic-development-lifecycle) framework installed. Skills are in `.claude/commands/`. Use `/dev:analyze`, `/dev:implement`, `/dev:review`, `/qa:testplan`, etc. for structured AI-assisted development.
