# Mess Count

A small web app so residents mark Yes/No for breakfast, lunch and dinner, and
the cook can see the live head count instead of collecting it over phone
calls. When the cook updates the menu, every resident gets a live
notification.

- **Residents:** register, sign in, mark Yes/No per meal, add an optional
  reason when skipping.
- **Cook:** post/update today's menu per meal, see live Yes/No counts and the
  list (with reasons) of everyone skipping — updates in real time as people
  respond.

Built with React + Vite + Tailwind on the frontend, and
[Supabase](https://supabase.com) (Postgres + Auth + Realtime) as the free
backend — no server code to write or host.

## 1. Create your free Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free tier is
   enough).
2. Once it's created, open **SQL Editor → New query**, paste the entire
   contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   This creates the `profiles`, `menu`, and `responses` tables with the right
   permissions, and turns on realtime updates.
3. Go to **Project Settings → API**. Copy the **Project URL** and the
   **anon public** key — you'll need them next.
4. Optional but recommended for a college/mess setting: go to
   **Authentication → Providers → Email** and turn **off** "Confirm email" so
   people can register and log in immediately without checking their inbox.

## 2. Run it locally

```bash
npm install
cp .env.example .env
# paste your Project URL and anon key into .env
npm run dev
```

Open the printed local URL. Register one account with role **Cook** (that's
your mess manager) and a few with role **Resident** to try it out.

## 3. Deploy for free

### Option A — Netlify

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command `npm run build`, publish directory `dist` (already set in
   `netlify.toml`).
4. Under **Site settings → Environment variables**, add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the values from step 1.
5. Deploy. Netlify's free tier covers this easily.

### Option B — Render (Static Site)

1. Push this folder to a GitHub repo.
2. In Render: **New → Static Site**, pick the repo.
3. Build command: `npm run build`, publish directory: `dist`.
4. Add the same two environment variables as above under **Environment**.
5. Deploy.

Either way, the app itself is just static files talking directly to
Supabase, so there's nothing else to host or pay for.

## How the pieces fit together

| Table       | Purpose                                                            |
|-------------|---------------------------------------------------------------------|
| `profiles`  | Name, phone, and role (`user` or `cook`) for each account          |
| `menu`      | One row per date + meal, holds today's menu text                    |
| `responses` | One row per resident + date + meal, holds Yes/No and optional reason |

Row Level Security is on for every table: residents can only write their own
responses, only cooks can edit the menu, and everyone can read the menu and
their own data (cooks can read all responses to get the count).

The "menu updated" toast and the cook's live head count both use Supabase
Realtime — no polling, no extra backend.

## Notes / things you may want to tweak

- The cook role is chosen at registration for simplicity. For a stricter
  setup, remove the role picker from `Register.jsx` and instead promote a
  user to `cook` manually by editing their row in the `profiles` table from
  the Supabase dashboard.
- The app tracks one mess-day at a time (today, by device local date). If you
  want history/reporting, the `menu` and `responses` tables already store a
  `date` column, so a simple "past days" view can be added later.
- Colors, type, and copy live mostly in `tailwind.config.js` and the
  component files if you want to reskin it for your own mess/hostel.
