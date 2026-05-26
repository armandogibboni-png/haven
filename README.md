# 🏡 Haven

> A safe, configurable support app for families navigating selective mutism.

Built with React + Vite + PWA. No backend required — works out of the box with just an Anthropic API key.

---

## ✨ Features

- **Enrollment** — set up your family (any size, any structure) with roles, emojis, PINs, and an SM flag
- **AI chat** — each member gets a personalised AI companion adapted to their role
- **SM flag** — marks the child with selective mutism, unlocking specialised tools (AAC board, emotion check-in, victories diary)
- **Friends & Relatives** — AI-generated, printable guidance cards for anyone who interacts with your child
- **Family Board** — shared notes between family members
- **Toolboxes** — parent toolbox (CBT, exposure, tracking) and child toolbox (emotion check-in, AAC voice board, victories)
- **Multilingual** — English (default) and Italian
- **PWA** — installable on iOS, Android, and desktop

---

## 🚀 Deploy on Vercel (free, 5 minutes)

1. Fork or clone this repo to your GitHub account
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY = sk-ant-...
   ```
4. Click **Deploy** — done!

Your URL will be something like `haven-yourname.vercel.app`.

---

## 📱 Install as PWA

### iPhone / iPad
Safari → open your Haven URL → Share button → **Add to Home Screen**

### Android
Chrome → open URL → ⋮ menu → **Install app**

### Desktop (Chrome / Edge)
Open URL → install icon in address bar → **Install**

---

## 🛠 Local development

```bash
npm install
npm run dev
```

Create `.env.local` with:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🗄 Optional: Supabase (for shared Family Board across devices)

By default, the Family Board uses `localStorage` (device-only). For cross-device sync:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run this SQL:
   ```sql
   create table family_board (
     id text primary key,
     text text not null,
     author text,
     author_color text,
     author_emoji text,
     created_at timestamptz default now()
   );
   alter table family_board enable row level security;
   create policy "public read" on family_board for select using (true);
   create policy "public insert" on family_board for insert with check (true);
   create policy "public delete" on family_board for delete using (true);
   ```
3. Add to Vercel environment variables:
   ```
   VITE_SUPABASE_URL = https://yourproject.supabase.co
   VITE_SUPABASE_KEY = your-anon-key
   ```

---

## 🔷 Selective Mutism

Haven is built with care for families navigating selective mutism. The SM flag unlocks:
- **Gentle, non-pressuring AI** that meets the child where they are
- **AAC Voice Board** — tap-to-speak with Web Speech API (works offline)
- **Emotion Check-in** — visual thermometer + body map
- **My Victories** — celebrate every small step
- **Friends & Relatives cards** — AI-generated guides for grandparents, friends, and anyone who interacts with your child

---

## 📄 License

MIT — free to use, adapt, and share.
