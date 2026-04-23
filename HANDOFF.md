# BanglaLearn — Live Handoff Brief

> Auto-updated every 5 min. Do not edit manually.

**Last updated:** 2026-04-23 11:42

---

## Git Status

| | |
|---|---|
| Branch | `main` |
| Last commit | `ed8276f` — Add confetti animation on lesson completion and wire up audio playback infrastructure |
| Modified files | 27 |
| Untracked files | 5 |

### Recent commits
- `ed8276f` Add confetti animation on lesson completion and wire up audio playback infrastructure
- `e55bd62` Fix match_pairs stale state, expand icons, add letter study guide, fix unit IDs
- `db69d73` Add Weekly Wrapped modal and fix TypeScript errors from new dialect content
- `b3d79f2` Add Firebase Cloud Functions, analytics dashboard, and fix Google OAuth config
- `4dc91b4` Expand all dialects to 6 units, rebrand to Academy of Bengali Letters, new app icons

### Modified files
- `.gitignore`
- `HANDOFF.md`
- `README.md`
- `apps/mobile/app.config.ts`
- `apps/mobile/app.json`
- `apps/mobile/app/(tabs)/bazaar.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/leaderboard.tsx`
- `apps/mobile/app/(tabs)/profile.tsx`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/lesson/[id].tsx`
- `apps/mobile/app/onboarding.tsx`
- `apps/mobile/components/WeeklyWrappedModal.tsx`
- `apps/mobile/lib/useSound.ts`
- `apps/mobile/package.json`
- `apps/web/src/app/intro/page.tsx`
- `apps/web/src/app/learn/page.tsx`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/practice/page.tsx`
- `apps/web/src/components/icons/index.tsx`
- `package-lock.json`
- `packages/content/src/dialects/barisali.ts`
- `packages/content/src/dialects/chittagonian.ts`
- `packages/content/src/dialects/khulna.ts`
- `packages/content/src/dialects/rajshahi.ts`
- `packages/content/src/dialects/sylheti.ts`

### Untracked files
- `apps/mobile/PRIVACY_POLICY.md`
- `apps/mobile/eas.json`
- `apps/mobile/lib/iap.ts`
- `apps/mobile/store-listing.md`
- `functions/package-lock.json`

---

## What is DONE (this session + prior)

- [x] Monorepo (Expo SDK 51 + Next.js 14 + shared packages)
- [x] Firebase init — anon + email auth
- [x] Social auth — Google + Facebook (expo-auth-session)
- [x] AsyncStorage layer (storage.ts) — XP, streak, hearts, daily XP, completed lessons, resume, history
- [x] Firestore sync — push on lesson finish, pull on sign-in, realtime listener for non-anon
- [x] Custom analytics — 11 event types
- [x] Home screen — SVG Bangladesh map, dialect switcher, lesson list, daily goal, hearts + XP header
- [x] Lesson engine — study phase + all 6 exercise types + quiz loop + results + resume
- [x] Auth screens — login + register with social buttons
- [x] AppState foreground sync in AuthContext.tsx
- [x] StreakBrokenModal component + wired into HomeScreen
- [x] Heart regen countdown in home header (nextHeartRegenMs, 1s interval)
- [x] Bazaar — full 3-payment-method system (IAP / XP spend / Coins)
- [x] Coins economy — streak coins, lesson coins, sharing coins, spendCoins/addCoins
- [x] Streak freeze — activateStreakFreeze / consumeStreakFreezeIfNeeded
- [x] checkAndResetBrokenStreak — detects missed days on app open
- [x] theme.ts — rajshahi + khulna colors added
- [x] profile.tsx — dialectColors map fixed for all 6 dialects
- [x] Standard curriculum — 5 units (Unit 5: Heart & Time — Respect, Questions, Numbers 1-20, Time Words, Days)
- [x] Sylheti curriculum — 2 units
- [x] Barisali curriculum — 2 units (Unit 2: Heart & Time with Barisali forms)
- [x] Chittagonian curriculum — 2 units (Unit 2: Heart & Time with আঁই/তুঁই pronouns)
- [x] Rajshahi curriculum — 2 units (Unit 2: Heart & Time, standard-close forms)
- [x] Khulna curriculum — 2 units (Unit 2: Heart & Time with -তেছি progressive)
- [x] Confetti animation on lesson completion
- [x] Audio playback infrastructure (useSound.ts expanded)
- [x] Weekly Wrapped modal (WeeklyWrappedModal.tsx)
- [x] Firebase Cloud Functions + analytics dashboard
- [x] IAP scaffolding (apps/mobile/lib/iap.ts — untracked, not yet wired)
- [x] EAS build config (apps/mobile/eas.json — untracked)
- [x] Privacy policy + store listing drafts (untracked)

---

## What is NOT DONE (build this next)

### Immediate
- [ ] "Coming soon" trailing card in lesson list for dialects with < 3 units
  - File: `apps/mobile/app/(tabs)/index.tsx`
  - Render a locked/greyed card after the last real unit
- [ ] Commit all session changes to git
  - Run: `cd /Users/marwaanswar/bangla-learn && git add -A && git commit -m "..."`
- [ ] Wire up `apps/mobile/lib/iap.ts` to Bazaar IAP payment method

### Short term
- [ ] Bazaar IAP: wire up real RevenueCat or Expo IAP SDK
- [ ] Social sharing coins — share streak/invite/report_card/wrapped screens
- [ ] BenglaLearn Wrapped — year-end stats screen
- [ ] Leaderboard screen — rank by totalXp

### Content
- [ ] Standard Unit 6+ (Lessons 13+: Food, Travel, etc.)
- [ ] Sylheti Unit 3+
- [ ] All dialect curricula to 3+ units each

---

## Key files quick reference

```
apps/mobile/
├── app/(tabs)/index.tsx        ← Home: map, lessons, stats, heart regen countdown
├── app/(tabs)/bazaar.tsx       ← Bazaar: IAP + XP + Coins payment methods
├── app/(tabs)/profile.tsx      ← Profile: dialect progress, history
├── app/lesson/[id].tsx         ← Lesson engine (~1,300 lines)
├── components/StreakBrokenModal.tsx ← Streak broken overlay
├── components/WeeklyWrappedModal.tsx ← Weekly Wrapped stats overlay
├── lib/storage.ts              ← AsyncStorage source of truth (XP, streak, hearts, coins, freeze)
├── lib/sync.ts                 ← Firestore push/pull/realtime
├── lib/AuthContext.tsx         ← Auth provider + AppState foreground sync
├── lib/analytics.ts            ← Custom event tracking
├── lib/theme.ts                ← Colors + fonts (all 6 dialect colors)
├── lib/useSocialAuth.ts        ← Google + Facebook OAuth hooks
├── lib/useSound.ts             ← Audio playback hooks
└── lib/iap.ts                  ← IAP scaffolding (untracked — not yet committed)

packages/content/src/dialects/
├── standard.ts     ← 5 units — full curriculum + Heart & Time
├── sylheti.ts      ← 2 units — Greetings + Heart & Time
├── barisali.ts     ← 2 units — Greetings + Heart & Time (Barisali forms)
├── chittagonian.ts ← 2 units — Greetings + Heart & Time (আঁই/তুঁই)
├── rajshahi.ts     ← 2 units — Greetings + Heart & Time
└── khulna.ts       ← 2 units — Greetings + Heart & Time (-তেছি)
```

---

## Architecture rules

1. **Never read Firestore directly in UI.** Always read AsyncStorage via `storage.ts`.
2. **Offline-first.** All writes go to AsyncStorage first, then Firestore async.
3. **Don't eject.** Expo managed workflow only.
4. **Anon auth from launch.** Every session has a UID. Social sign-in upgrades via `linkWithCredential`.
5. **Web and mobile are separate systems.** Do not cross-wire.
6. **Coins ≠ XP.** Coins are soft currency (spendable in Bazaar). XP is score (affects leaderboard rank when spent).

---

## Open decisions

1. IAP SDK: RevenueCat vs Expo IAP vs bare StoreKit?
2. Wrapped screen: when to show (Dec 31 or after 365 days)?
3. More dialect content: manual authoring vs AI generation?

---

## Env vars needed

```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_FACEBOOK_APP_ID
```

## Run commands

```bash
# Start dev server (npx broken in shell — use full path)
/usr/local/bin/node /Users/marwaanswar/bangla-learn/node_modules/.bin/expo start --ios

# Boot simulator (if not running)
xcrun simctl boot 8B20FA4E-E926-4AE7-B603-71BF3DD47716
open -a Simulator

# TypeScript check
/usr/local/bin/node node_modules/.bin/tsc --noEmit -p packages/content/tsconfig.json
```
