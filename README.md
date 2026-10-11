# Insidee

This is an optimized rewrite of [insideee](https://github.com/Moyowaaaa/insideee), the React app. Same idea, rebuilt in Vue: pick a category and see places worth visiting around you.

Insidee asks for your location, then looks up nearby spots in three categories — Outdoorzyy, Food & Drinks, and Others. Results stay inside a short radius and are ordered by rating, with closer places kept ahead of distant ones. Opening a category shows a place card with photos, hours, distance, and reviews. On a phone the cards stack, and the place view becomes a single scrolling sheet.

## Stack

- Vue 3, TypeScript, and Vite
- Pinia for location, places, and the modal
- Vue Router
- SCSS
- Google Maps Places (Nearby Search)
- Lenis for page scroll
- vue-sonner for toasts

## Setup

You need a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) with the Places API (New) and Geocoding enabled.

```sh
pnpm install
cp .env.example .env
```

Set `VITE_GOOGLE_MAPS_API_KEY` in `.env`. `VITE_GOOGLE_MAP_ID` is optional.

```sh
pnpm dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build |
| `pnpm type-check` | Run `vue-tsc` |
| `pnpm test:unit` | Run unit tests with Vitest |
