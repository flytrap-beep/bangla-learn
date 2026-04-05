# BanglaLearn — Codex Handoff (April 4 2026)

Pick up from a Claude Code session that ended mid-task. Work the tasks below in order. Do not skip or reorder — later tasks depend on earlier ones being done correctly.

---

## Repo & run

```bash
# From repo root
/usr/local/bin/node /usr/local/bin/npx --version   # verify node works
cd /Users/marwaanswar/bangla-learn/apps/mobile
/usr/local/bin/node /Users/marwaanswar/bangla-learn/node_modules/.bin/expo start --ios
```

> `npx` is broken in the shell PATH. Always use `/usr/local/bin/node` explicitly. The Expo binary lives at `node_modules/.bin/expo` in the **repo root**, not `apps/mobile`.

Branch: `main`. Last pushed commit: `94eb90e`.

---

## What was changed this session (NOT yet committed)

### Fully done ✅

| File | What changed |
|---|---|
| `apps/mobile/lib/storage.ts` | Added `spendXp()`, `activateStreakFreeze()`, `isStreakFreezeActive()`, `consumeStreakFreezeIfNeeded()`. Updated `completeLesson()` to consume freeze before resetting streak to 1. |
| `apps/mobile/lib/theme.ts` | Added `rajshahi: "#16a34a"` and `khulna: "#0891b2"` to the `T` colour palette. |
| `apps/mobile/app/(tabs)/profile.tsx` | Added `rajshahi: T.rajshahi, khulna: T.khulna` to `dialectColors` record (was missing, causing fallback colour for those two dialects in history tab). |
| `apps/mobile/app/(tabs)/bazaar.tsx` | **Full rebuild.** 3-payment-method Bazaar (IAP / XP spend / Coins spend) with three real products: Heart Refill, Streak Freeze, XP Boost. Currency display in hero (hearts + XP + coins), active Streak Freeze badge, payment legend at bottom. Uses `spendXp`, `spendCoins`, `activateStreakFreeze`, `isStreakFreezeActive` from storage. |
| `apps/mobile/app/(tabs)/index.tsx` | Fixed crash: added missing `useEffect` to import list. Added `nextHeartRegenMs` import, `regenMs` state, 1-second `setInterval` inside `useFocusEffect`, and UI rendering `+❤️ Xm XXs` below the hearts pill when `hearts < 5`. |

### Half done ⚠️

| File | Problem |
|---|---|
| `apps/mobile/app/(tabs)/index.tsx` | The `regenLabel` style is **referenced in JSX at line 507 but not defined** in the `StyleSheet.create({})` block. This will crash. See Task 1. |

---

## Task 1 — Add missing `regenLabel` style (2 min)

**File:** `apps/mobile/app/(tabs)/index.tsx`

Find the `StyleSheet.create({})` block (starts around line 670). Find `headerPillText` and add `regenLabel` immediately after it:

```ts
headerPillText: { fontFamily: FONT.bold, fontSize: 14 },
// ADD THIS:
regenLabel: {
  fontFamily: FONT.bold,
  fontSize: 9,
  color: T.red,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginLeft: 2,
},
```

Verify: run the app, lose a heart in a lesson, come back to home — the countdown should appear below the hearts pill.

---

## Task 2 — AppState foreground sync (10 min)

**File:** `apps/mobile/lib/AuthContext.tsx`

When the app resumes from background, push local progress to Firestore. The `pushProgressToFirestore` function already exists at `lib/sync.ts:22`.

Add a second `useEffect` inside `AuthProvider`, after the existing one:

```ts
import { AppState, AppStateStatus } from "react-native";
import { pushProgressToFirestore } from "./sync";

// Second useEffect inside AuthProvider:
useEffect(() => {
  const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
    if (state === "active") {
      pushProgressToFirestore().catch(() => {});
    }
  });
  return () => sub.remove();
}, []);
```

---

## Task 3 — `checkAndResetBrokenStreak` helper (5 min)

**File:** `apps/mobile/lib/storage.ts`

Add this function at the bottom, before the final blank line:

```ts
// Returns the streak count that was just broken, or null if streak is intact.
// Resets the streak to 0 when a break is detected.
// Call this once on app open (inside useFocusEffect on HomeScreen).
export async function checkAndResetBrokenStreak(): Promise<number | null> {
  const lastActive = await AsyncStorage.getItem(KEYS.lastActive);
  if (!lastActive) return null;
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastActive === today || lastActive === yesterday) return null;
  const currentStreak = parseInt((await AsyncStorage.getItem(KEYS.streak)) ?? "0");
  if (currentStreak <= 0) return null;
  await AsyncStorage.setItem(KEYS.streak, "0");
  return currentStreak;
}
```

---

## Task 4 — StreakBrokenModal component (20 min)

**New file:** `apps/mobile/components/StreakBrokenModal.tsx`

```tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { T, SHADOW, FONT } from "@/lib/theme";

type Props = { visible: boolean; lostStreak: number; onDismiss: () => void };

export default function StreakBrokenModal({ visible, lostStreak, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.flame}>💔</Text>
          <Text style={s.title}>Streak Broken</Text>
          <Text style={s.sub}>
            Your {lostStreak}-day streak is gone.{"\n"}But every master started at zero.
          </Text>
          <TouchableOpacity style={s.btn} onPress={onDismiss} activeOpacity={0.8}>
            <Ionicons name="flame" size={18} color={T.white} />
            <Text style={s.btnText}>Start a new streak</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
  },
  card: {
    backgroundColor: T.card, borderWidth: 3, borderColor: T.red,
    borderRadius: 20, padding: 32, alignItems: "center", gap: 12,
    marginHorizontal: 32, ...SHADOW.red,
  },
  flame:   { fontSize: 56 },
  title:   { fontFamily: FONT.bold, fontSize: 24, color: T.red },
  sub:     { fontFamily: FONT.regular, fontSize: 14, color: T.text as string, textAlign: "center", lineHeight: 20 },
  btn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: T.red, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 24, marginTop: 8,
    ...SHADOW.red,
  },
  btnText: { fontFamily: FONT.bold, fontSize: 15, color: T.white },
});
```

**Wire into `apps/mobile/app/(tabs)/index.tsx`:**

1. Add import at top: `import StreakBrokenModal from "@/components/StreakBrokenModal";`
2. Add import in storage line: add `checkAndResetBrokenStreak` to the existing storage import
3. Add state: `const [brokenStreak, setBrokenStreak] = useState<number | null>(null);`
4. Inside `useFocusEffect`, after `getStats()` call, add:
   ```ts
   const broken = await checkAndResetBrokenStreak();
   if (broken) setBrokenStreak(broken);
   ```
5. Render the modal just before the closing `</SafeAreaView>`:
   ```tsx
   <StreakBrokenModal
     visible={brokenStreak !== null}
     lostStreak={brokenStreak ?? 0}
     onDismiss={() => setBrokenStreak(null)}
   />
   ```

---

## Task 5 — Volume 2 PDF content — Unit 2 for 5 dialects (2–3 hrs)

Sylheti already has Unit 2. Add it to the other 5 files. Use `sylheti.ts` Unit 2 as the exact structural template.

### Extract from PDF

```bash
/opt/homebrew/bin/pdftotext -layout "/path/to/volume2.pdf" - | sed -n 'START,ENDp' > /tmp/v2_DIALECT.txt
```

Line ranges:

| Dialect | Lines |
|---|---|
| Standard | 1–649 |
| Sylheti | 650–1280 (already done) |
| Chittagonian | 1281–1907 |
| Barisali | 1908–2537 |
| Rajshahi | 2538–3163 |
| Khulna | 3164–3788 |

### Files + unit IDs + key dialect features

| File | Next unit ID | Key features to encode |
|---|---|---|
| `packages/content/src/dialects/standard.ts` | `std-unit-5` (has units 1–4) | Fully standard: তোমাকে, গতকাল/আগামীকাল, রাত, করব/আসব |
| `packages/content/src/dialects/barisali.ts` | `bar-unit-2` | আমাগো=our, লাই=for, -রে object, আইজ/গইকাল/আগাইলকাল, রাইত, এহন, future আইমু/দিমু/হইব |
| `packages/content/src/dialects/chittagonian.ts` | `cgt-unit-2` | আঁই=I, তুঁই=you, আঁর=my, তুঁয়ার=your, লাই=for, গইকাল/আগাইলকাল, এহন=now, তুঁয়ারে (-রে object) |
| `packages/content/src/dialects/rajshahi.ts` | `raj-unit-2` | Close to standard; আপনি (not আপনে), গতকাল/আগামীকাল, রাত/বিকেল/সন্ধ্যা, future আসব/করবে |
| `packages/content/src/dialects/khulna.ts` | `khu-unit-2` | আপনে=polite, -রে object, আমাগো=our, লাই=for, -তেছি progressive, আইজ/গইকাল/আগাইলকাল, রাইত |

### Unit structure (from sylheti.ts Unit 2 as template)

Each unit must have:
- `prep`: 6–10 `characters`, 12–16 `flashcards` (vocab pairs), 3 `grammarPoints`
- `lessons` array (6–7 lessons):
  - Index 0: `letter_trace` exercises for the new characters
  - Index 1: Respect & Affection vocabulary
  - Index 2: Sweet Questions (question words)
  - Index 3: Numbers 1–10
  - Index 4: Numbers 11–20
  - Index 5: Time Words (today/yesterday/tomorrow/now/night)
  - Index 6: Plans & Dates — `isQuiz: true`

---

## Task 6 — "Coming soon" card for single-unit dialects (15 min)

**File:** `apps/mobile/app/(tabs)/index.tsx`

After the lesson list map loop (find where units are rendered with `.map((unit) => ...)`), after the closing tag of the last unit, add a "coming soon" card only when the curriculum has fewer than 2 units:

```tsx
{curriculum.units.length < 2 && (
  <View style={s.comingSoonCard}>
    <Ionicons name="time-outline" size={20} color={T.textMid as string} />
    <Text style={s.comingSoonText}>More lessons coming soon</Text>
  </View>
)}
```

Add to `StyleSheet.create({})`:

```ts
comingSoonCard: {
  flexDirection: "row", alignItems: "center", gap: 10,
  margin: 16, padding: 16,
  backgroundColor: T.card, borderWidth: 2, borderColor: T.border,
  borderRadius: 14,
},
comingSoonText: { fontFamily: FONT.bold, fontSize: 13, color: T.textMid as string },
```

---

## Commit when all tasks are done

```bash
cd /Users/marwaanswar/bangla-learn
git add \
  apps/mobile/lib/storage.ts \
  apps/mobile/lib/AuthContext.tsx \
  apps/mobile/lib/theme.ts \
  "apps/mobile/app/(tabs)/index.tsx" \
  "apps/mobile/app/(tabs)/bazaar.tsx" \
  "apps/mobile/app/(tabs)/profile.tsx" \
  apps/mobile/components/StreakBrokenModal.tsx \
  packages/content/src/dialects/standard.ts \
  packages/content/src/dialects/barisali.ts \
  packages/content/src/dialects/chittagonian.ts \
  packages/content/src/dialects/rajshahi.ts \
  packages/content/src/dialects/khulna.ts
git commit -m "Bazaar 3-payment system, heart regen countdown, streak modal, Unit 2 content"
git push origin main
```

---

## Architecture rules (never break these)

1. Never read Firestore directly in UI — always read AsyncStorage via `storage.ts`.
2. Offline-first: writes go to AsyncStorage first, Firestore is async background sync.
3. Expo managed workflow only — no bare/native.
4. Every session gets anon auth. Social sign-in upgrades via `linkWithCredential`.
5. `npx` is broken in this machine's shell PATH — always invoke via `/usr/local/bin/node`.
