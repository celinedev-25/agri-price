# AgriPrice Rwanda

Direct frontend-to-Supabase agricultural market price platform for Rwanda. Built with React 19, Vite, Tailwind CSS v4, and `@supabase/supabase-js` — no external backend server required.

## Features
- **Live Crop Prices (`/crops`)**: Search, filter by district, sort by price/date/name, automatic price-trend tracking (`up`, `down`, `steady`), and chronological price history modal.
- **Harvest Calculator & Market Comparison (`/prices`)**: Estimate harvest revenue in RWF, compare prices across districts side-by-side, and spot higher-paying markets.
- **Admin Portal (`/admin`)**: Full CRUD (Add, Edit, Delete) for `market_price` entries directly in Supabase with crop suggestions and instant table filtering.

## Supabase Setup (Frontend Direct Connection)

1. Copy `.env.example` to `.env.local` (already created locally):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   ```
   > **Important:** Always use your **Publishable / Anon key** from *Supabase Dashboard → Project Settings → API*. Never put a `service_role` / `sb_secret_` key in frontend code.

2. Ensure your Supabase project has the `districts` and `market_price` tables and appropriate Row Level Security (RLS) policies enabled for `anon` (or authenticated admin users) to `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
