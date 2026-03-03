# BanglaLearn 🇧🇩

> Learn Bengali (Bangla) for free — the app Duolingo never built.

A full-stack language learning app with **4 Bengali dialects**, Duolingo-style lessons, XP tracking, streaks, and hearts. Built as a Turborepo monorepo with a Next.js web app and Expo mobile app.

---

## Dialects Supported

| Dialect | Native | Region |
|---|---|---|
| Standard Bengali | শুদ্ধ বাংলা | Bangladesh & West Bengal |
| Sylheti | সিলটি | Sylhet, UK diaspora |
| Barisali | বরিশালি | Barisal Division |
| Chittagonian | চাটগাঁইয়া | Chittagong Division |

---

## Features

- **5 exercise types**: Multiple choice, translate to English/Bengali, match pairs, fill in the blank
- **XP system**: Earn XP per correct answer
- **Daily streaks**: Tracked server-side with timezone awareness
- **Hearts**: Lose a heart per wrong answer, refill over time
- **Lesson map**: Duolingo-style path with locked/unlocked lessons
- **4 dialects**: Switch dialect anytime, separate progress per dialect
- **Web + Mobile**: Next.js web app and Expo React Native app

---

## Monorepo Structure

```
bangla-learn/
├── apps/
│   ├── web/          # Next.js 14 (App Router)
│   └── mobile/       # Expo 51 (React Native)
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── content/      # All lesson data (4 dialects)
└── .github/
    └── workflows/    # CI/CD
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 10+

### Install

```bash
git clone https://github.com/flytrap-beep/bangla-learn.git
cd bangla-learn
npm install
```

### Web App Setup

1. Copy the env example:
```bash
cp apps/web/.env.example apps/web/.env.local
```

2. Fill in your `.env.local`:
   - **DATABASE_URL** — Get a free PostgreSQL from [neon.tech](https://neon.tech)
   - **AUTH_SECRET** — Run `openssl rand -base64 32`
   - **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET** — From [Google Cloud Console](https://console.cloud.google.com)
   - **AUTH_RESEND_KEY** — From [resend.com](https://resend.com) (for email magic link)

3. Run migrations:
```bash
cd apps/web && npx prisma migrate dev
```

4. Start the web app:
```bash
npm run dev -- --filter=@bangla-learn/web
```

Open [http://localhost:3000](http://localhost:3000)

### Mobile App Setup

```bash
npm run dev -- --filter=@bangla-learn/mobile
```

Scan the QR code with **Expo Go** on your phone.

### Run Everything

```bash
npm run dev
```

---

## Adding Content

All lesson content lives in `packages/content/src/dialects/`:

- `standard.ts` — Standard Bengali
- `sylheti.ts` — Sylheti
- `barisali.ts` — Barisali
- `chittagonian.ts` — Chittagonian

Each file exports a `DialectCurriculum` with units → lessons → exercises.

### Exercise Types

```ts
// Multiple choice
{ type: "multiple_choice", prompt: "...", options: [...], correct: 0 }

// Translate Bengali → English
{ type: "translate_to_english", bangla: "আমি", romanization: "Ami", answer: "I" }

// Translate English → Bengali
{ type: "translate_to_bangla", english: "Hello", answer: "নমস্কার", romanization: "Nomoshkar" }

// Match pairs
{ type: "match_pairs", pairs: [{ bangla: "মা", english: "Mother", romanization: "Ma" }] }

// Fill in the blank
{ type: "fill_blank", sentence: "আমি ___ আছি", blank: "ভালো", options: ["ভালো", "খারাপ"] }
```

---

## Deployment

### Web (Vercel)
1. Connect your GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Add all env vars from `.env.example`
4. Deploy!

### Mobile (EAS Build)
```bash
cd apps/mobile
npx eas build --platform all
```

---

## Contributing

PRs welcome! Please open an issue first to discuss what you'd like to change.

Areas to contribute:
- More lessons and vocabulary
- Audio recordings for Bengali words
- More dialects (Noakhali, Rajbangsi)
- Gamification features (leaderboards, achievements)

---

## License

MIT
