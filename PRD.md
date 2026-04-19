# PRD: Fartlek — Running Calculator

## Overview

A static web app with running tools in three tabs: a Norwegian Singles training zone calculator, a heart rate zone calculator, and a pace/distance converter with Riegel race equivalents.

Repo: `martinstenrose/fartlek`
FQDN: `fartlek.stenrose.se`
License: GPL v3

## Tech Stack

- **React** + **Vite** (TypeScript, strict mode) — see `package.json` for pinned versions
- Inline styles — no component libraries, no CSS frameworks
- **nginx** as production server (multi-stage Docker build) — see `Dockerfile` for pinned versions
- **GitHub Actions** → `ghcr.io/martinstenrose/fartlek`
- **Dependabot** for npm, Docker, and GitHub Actions updates
- No backend, no API, no database — 100% client-side

## Internationalization

- Default language: **English**
- Also include: **Swedish (sv)**
- On load, detect language from the browser (`navigator.language`). Fall back to English.
- Language switcher in the toolbar (EN / SV)
- Persist language choice in `localStorage`
- All UI strings go through a simple i18n object in TypeScript — no external libraries. Same pattern as pe-calc.

## Tab 1: Norwegian Singles

### Input

VDOT calculation using the Jack Daniels formula:

- Distance in meters — always-visible text field with quick-select buttons (5K, 10K, HM, Marathon) that populate the field
- Race time in `hh:mm:ss` or `mm:ss`

### Formulas

**VDOT (Jack Daniels):**

```
t = time in minutes
v = distance (m) / t
VO₂ = −4.6 + 0.182258 × v + 0.000104 × v²
%VO₂max = 0.8 + 0.1894393 × e^(−0.012778 × t) + 0.2989558 × e^(−0.1932605 × t)
VDOT = VO₂ / %VO₂max
```

**MAS (Maximal Aerobic Speed):** Speed at 100% VO₂max, derived by solving the VO₂ equation in reverse.

**Easy pace:** 65% of MAS.

**Race pace equivalents** (Riegel): `t₂ = t₁ × (d₂/d₁)^1.06` for 15K, half marathon, 30K.

### Output

Three key metrics displayed: VDOT, MAS (km/h), Easy pace (min/km).

Three training zones displayed in min/km:

| Zone | %MAS | Description |
|------|------|-------------|
| Easy running | 60–65% | Max 70% max heart rate |
| Threshold intervals (Sub LT2) | 85–90% | ~2.5–3.5 mmol/L lactate |
| VO₂max intervals | 95–100% | Near maximal oxygen uptake |

Interval workout suggestions in two tables:

**Time-based intervals:**

| Workout | Structure | Target pace | Recovery |
|---------|-----------|-------------|----------|
| Short intervals | 8–12 × 3–4 min | 15K pace | 60s rest |
| Medium intervals | 4–6 × 6–8 min | HM pace | 60s rest |
| Long intervals | 3 × 10–12 min | 30K pace | 60s rest |

**Distance-based intervals:**

| Workout | Structure | Target pace | Recovery |
|---------|-----------|-------------|----------|
| 1K reps | 8–12 × 1K | 15K pace | 60s rest |
| 2K reps | 4–6 × 2K | HM pace | 60s rest |
| 3K reps | 3 × 3K | 30K pace | 60s rest |

Info box "About Norwegian Singles" — bullet list, no emojis:

- 2–3 quality sessions per week plus 1 long run
- Quality sessions make up 20–25% of total running time
- Keep threshold sessions below LT2
- Keep easy runs very easy (max 65% of MAS)

### Error Handling

- VDOT > 85: show error — "The time seems unrealistically fast for the given distance. Double-check your distance and time."
- Empty inputs: show hint — "Enter a distance and race time above to calculate VDOT and training zones."

## Tab 2: HR Zones

### Input

Lactate Threshold Heart Rate (LTHR) in bpm — integer, numeric input.

### Output

Five training zones based on Joe Friel's system, displayed as a table with zone label, %LTHR range, and BPM range:

| Zone | %LTHR | Description |
|------|-------|-------------|
| Z1 | < 85% | Recovery |
| Z2 | 85–89% | Aerobic base |
| Z3 | 90–94% | Tempo |
| Z4 | 95–99% | Threshold |
| Z5 | ≥ 100% | VO₂max / Anaerobic |

BPM ranges are calculated as `round(lthr × pct)`.

### Error Handling

- Empty input: show hint — "Enter your lactate threshold heart rate above to calculate training zones."

### Info Box

Explain LTHR estimation methodology (20-minute all-out TT, use average HR as LTHR estimate). Source: Joe Friel, *The Triathlete's Training Bible*.

## Tab 3: Converter

Six mini calculators:

1. **Distance converter (Riegel)** — input distance + time, show table with equivalent times and pace for 400m, 800m, 1000m, 3000m, 5K, 10K, half marathon, 30K, marathon
2. **min/km → km/h**
3. **km/h → min/km**
4. **Calculate pace** — distance (km) + time → min/km
5. **Calculate time** — distance (km) + pace → total time
6. **Calculate distance** — time + pace → km

All time inputs accept both `hh:mm:ss` and `mm:ss`. Placeholder text should indicate this.

## Toolbar

Sticky top bar with:

- Left: app title "Fartlek"
- Right: language switcher (EN / SV) + theme switcher (Light / Dark / System)

## Theme

- Light, Dark, and System (follows OS preference) modes
- Switcher in the toolbar
- Persisted in `localStorage`
- Default dark theme uses background ~#0c1117

## Design

- Monospace font (JetBrains Mono via Google Fonts) for numeric values
- Color-coded zones: green (easy), blue (threshold), purple (VO₂max)
- Colored accents per card (orange, blue, green, purple, rose, amber)
- Mobile-first, responsive (max-width 640px, centered)

## Project Structure

```
fartlek/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── NorwegianSingles.tsx
│   │   ├── Converter.tsx
│   │   └── HRZones.tsx
│   ├── lib/
│   │   ├── formulas.ts          # VDOT, Riegel, pace conversions — pure functions
│   │   ├── formulas.test.ts
│   │   └── i18n.ts              # i18n object with en/sv translations
│   └── index.css
├── index.html
├── Dockerfile
├── docker-compose.yml
├── .github/
│   ├── workflows/
│   │   └── docker.yml
│   └── dependabot.yml
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── LICENSE
└── README.md
```

## Dockerfile

Multi-stage build with pinned versions:

```dockerfile
FROM node:22.16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## docker-compose.yml

Single service with commented-out Caddy reverse proxy example (same pattern as pe-calc).

## GitHub Actions

Build and push Docker image to `ghcr.io/martinstenrose/fartlek` on push to `main`. Same workflow structure as pe-calc.

## Dependabot

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 10

  - package-ecosystem: docker
    directory: "/"
    schedule:
      interval: weekly

  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly
```

## Testing

`formulas.test.ts` should include:

- **VDOT reference values** — verify against known Jack Daniels tables:

| Distance | Time | Expected VDOT (±0.5) |
|----------|------|-----------------------|
| 5000m | 20:00 | ~42.2 |
| 5000m | 17:00 | ~52.8 |
| 10000m | 40:00 | ~43.8 |
| 10000m | 35:00 | ~52.0 |
| 21097.5m | 1:30:00 | ~49.4 |
| 42195m | 3:30:00 | ~42.0 |
| 42195m | 3:00:00 | ~50.5 |

- **VDOT edge cases** — unrealistically fast times should return VDOT > 85 (triggering error state)
- **Riegel equivalents** — verify that known race time produces sensible predictions across distances
- **Pace conversions** — round-trip tests (min/km → km/h → min/km)
- **Time parsing** — both `hh:mm:ss` and `mm:ss` formats, edge cases (empty, invalid)

## Out of Scope

- No backend, no authentication, no database
- No external API calls
- No Critical Speed or Critical Power input modes (VDOT only)