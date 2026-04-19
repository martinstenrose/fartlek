# Fartlek

React + TypeScript app (Vite) for running calculations. Three tabs: Norwegian Singles (VDOT/MAS training zones), HR Zones (Joe Friel LTHR-based zones), and Converter (six pace/time/distance calculators).

Live at [fartlek.stenrose.se](https://fartlek.stenrose.se)

## Tech Stack

- React + Vite, TypeScript strict mode
- Inline styles only — no CSS frameworks, no component libraries
- Simple i18n object in `lib/i18n.ts` — no external i18n libraries
- nginx via multi-stage Docker build (see `Dockerfile` for pinned versions)
- GitHub Actions → `ghcr.io/martinstenrose/fartlek`
- 100% client-side — no backend, no API, no database

## Commands

```
npm run dev     # dev server at localhost:5173
npm test        # run formula unit tests (Vitest)
npm run build   # production build
```

## Project Structure

```
src/
  App.tsx                  # root: toolbar, tab switcher, theme/lang context
  components/
    NorwegianSingles.tsx   # Tab 1: VDOT/MAS zones + interval tables
    HRZones.tsx            # Tab 2: Joe Friel HR zone calculator (LTHR input)
    Converter.tsx          # Tab 3: six mini-calculators (Riegel, pace, time, distance)
  lib/
    formulas.ts            # pure formula functions — VDOT, Riegel, pace conversions
    formulas.test.ts       # Vitest unit tests for formulas
    i18n.ts                # i18n provider with en/sv translations
```

## Conventions

- Branch names: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`
- Commit messages: conventional commits format
- All UI strings go through the i18n `t()` helper — no hardcoded user-facing strings
- Styles: inline `React.CSSProperties` objects — never add CSS files or utility classes
- Formulas are pure functions in `lib/formulas.ts` — keep component files thin
