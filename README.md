# Fartlek

Running calculator with three tools: a Norwegian Singles training zone calculator (VDOT/MAS), a heart rate zones calculator, and a pace/distance converter.

Live at [fartlek.stenrose.se](https://fartlek.stenrose.se)

## Features

- **Norwegian Singles** — enter a race result to get VDOT, MAS, easy pace, training zones, and interval workout suggestions
- **HR Zones** — enter your LTHR to get five Joe Friel training zones with BPM ranges
- **Converter** — six calculators: Riegel race equivalents, min/km ↔ km/h, pace, time, and distance
- English and Swedish UI, auto-detected from browser language
- Light, Dark, and System themes

## Tech

React + Vite + TypeScript. No CSS framework — inline styles only. Served via nginx in a multi-stage Docker build.

## Development

```bash
npm install
npm run dev       # dev server at localhost:5173
npm test          # run formula unit tests
npm run build     # production build
```

## Docker

The pre-built image is available at `ghcr.io/martinstenrose/fartlek`:

```bash
docker run --rm -p 8080:80 ghcr.io/martinstenrose/fartlek:latest
```

Or with Docker Compose (see [`docker-compose.yml`](docker-compose.yml)):

```bash
docker compose up -d
```

To build locally instead:

```bash
docker build -t fartlek .
docker run --rm -p 8080:80 fartlek
```

## License

[GPL v3](LICENSE)
