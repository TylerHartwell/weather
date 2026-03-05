# Weather Dashboard

A Next.js weather dashboard that combines current conditions, a weekday summary, and interactive charting into one responsive interface.

It allows users to explore both historical and forecasted data for temperature, precipitation, and wind in a unified visual format for a holistic overview.

Live site: https://weather.tylerhartwell.com/

## Features

- Search weather by city/location name.
- Current conditions card with weather details.
- Scrollable hourly weather chart section.
- 8-day forecast cards with day selection.
- Jump-to-now control for quick timeline navigation.
- Unit toggles:
  - Temperature: Fahrenheit/Celsius
  - Wind speed: mph/kmh
  - Precipitation: inch/mm
- Persists the last searched location in `localStorage`.

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Open-Meteo API (`openmeteo` SDK + geocoding endpoint)
- Luxon (date/time handling)
- Radix UI primitives + custom UI components

## Project Structure

```text
src/
	app/                  # App Router entry, layout, global styles
	components/
		ui/                 # Reusable UI primitives
		weather/            # Weather-specific presentation components
	hooks/                # Data-fetching hooks
	services/             # API interaction layer
	types/                # Shared TypeScript types
	lib/                  # Utilities and weather helpers
```

## Getting Started

### Prerequisites

- Node.js 18.18+ (or newer LTS recommended)
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Start the Next.js dev server (Turbopack).
- `npm run build`: Build for production.
- `npm run start`: Run the production build.
- `npm run lint`: Run ESLint.

## Data Sources

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

No API key is required for the current integration.

## Core Flow

1. User enters a location.
2. The app geocodes the location to latitude/longitude.
3. Forecast data (current, hourly, daily) is fetched for that location.
4. Data is normalized into typed weather models and rendered across dashboard sections.
