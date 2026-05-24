# Get One Plot — Mobile

React Native (Expo) mobile app mirroring the [Get One Plot](https://github.com/get-plot/get-plot) web platform.

## Features

- **Home** — hero, featured properties, quick links to developments
- **Our Sites** — all 9 land developments with interactive maps
- **Plot maps** — polygon overlays, status colors, buy / reserve / cart / express interest
- **Marketplace** — browse approved properties, favorites, inquiries
- **Cart & checkout** — multi-plot cart with Paystack
- **Auth** — Clerk sign-in / sign-up with approval gate
- **Admin** — role-based plot stats (admin, sysadmin, chief)
- **Contact** — contact form via web API

## Setup

1. Copy environment variables from the web app:

```bash
cp .env.example .env
```

Fill in:

| Variable | Source |
|----------|--------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as web `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `EXPO_PUBLIC_API_URL` | Production URL of Next.js app (for contact email, property interest) |
| `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud (for native maps on iOS/Android) |

2. Install and run:

```bash
npm install
npx expo start
```

3. For **Google Maps** on device/simulator, add your API key to `app.json` under `ios.config.googleMapsApiKey` and `android.config.googleMaps.apiKey`.

## Project structure

```
app/                 # Expo Router screens
src/
  components/        # UI, maps, Paystack WebView
  constants/         # Theme, developments list
  lib/               # Supabase, API, plot helpers
  stores/            # Cart & property Zustand stores
  types/
```

## Related

Web app lives at the repository root. Mobile shares Supabase tables and Clerk auth; payment confirmation emails still flow through the web API where configured.
