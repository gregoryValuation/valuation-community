# Valuation Community

A crowdsourced DCF model exchange, organized by ticker. Sign up, upload a
DCF Excel model with a target price, and browse everyone else's models —
filed under the ticker they cover (validated against Yahoo Finance).

**Current scope (MVP):** registration, upload, ticker-based browsing.
**Not built yet:** accuracy scoring (predicted vs. actual price), paid tier.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack)
- [Supabase](https://supabase.com) — auth, Postgres database, file storage
- Tailwind CSS

## One-time setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is enough to start).
2. In the Supabase dashboard, go to **SQL Editor → New query**, paste the
   contents of `supabase/schema.sql`, and run it. This creates the
   `tickers` and `models` tables, their security policies, and the private
   `models` storage bucket for uploaded Excel files.
3. In **Project Settings → API**, copy the **Project URL** and the
   **anon public** key.
4. Copy `.env.example` to `.env.local` and paste those two values in.
5. (Optional, for faster testing) In **Authentication → Providers → Email**,
   you can turn off "Confirm email" so new sign-ups get logged in
   immediately instead of needing to click an email link first.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it's organized

- `app/signup`, `app/login`, `app/logout` — auth, via Supabase Auth (email + password).
- `app/upload` — the upload form. On submit, the server action:
  1. Validates the ticker against Yahoo Finance's public quote endpoint
     (server-side, so no CORS issues).
  2. Finds the matching `tickers` row, or creates one if it's new.
  3. Uploads the file to Supabase Storage under `{user_id}/{uuid}-{filename}`.
  4. Inserts a `models` row linking the ticker, uploader, target price,
     horizon, and file.
- `app/tickers` — every ticker that has at least one model, with a count.
- `app/tickers/[ticker]` — every model filed under that ticker, with a
  time-limited signed download link per file (the storage bucket is
  private — files are viewable/downloadable, not editable online, and only
  by signed-in users).
- `proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`. Refreshes
  the Supabase session cookie on every request.

## Deploying

This is a standard Next.js app — [Vercel](https://vercel.com/new) is the
path of least resistance (connect the GitHub repo, add the two
`NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings, deploy).
Supabase itself is already hosted, so nothing else to stand up.

## Next steps (not built yet)

- **Accuracy scoring**: compare `target_price` against the actual price at
  `created_at + horizon_months`, e.g. fetched via a scheduled job. A simple
  starting formula: `score = max(0, 100 - abs(actual - target) / actual * 100)`.
- **Leaderboard**: rank uploaders by average score, per ticker or overall.
- **Paid tier**: gate `createSignedUrl` (view/download) behind a
  subscription check (Stripe), while keeping ticker + target-price
  browsing free.
