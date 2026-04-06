import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Dialect } from "@bangla-learn/types";

const KEYS = {
  activeDialect: "active_dialect",
  completedLessons: (dialect: Dialect) => `completed_${dialect}`,
  xp: "total_xp",
  streak: "streak",
  hearts: "hearts",
  lastActive: "last_active",
  lastHeartLostAt: "last_heart_lost_at", // epoch ms — drives passive regen
  dailyXp: "daily_xp",
  dailyDate: "daily_date",
  dailyGoalTarget: "daily_goal_target",
  onboardingDone: "onboarding_done",
  lessonResume: (lessonId: string) => `resume_${lessonId}`,
  lessonHistory: "lesson_history",
  coins: "coins",
  lastStreakCoinDate: "last_streak_coin_date", // prevents double-awarding streak coins
};

const MAX_HEARTS = 5;
const HEART_REGEN_MS = 30 * 60 * 1000; // 30 minutes per heart
const AD_HEART_PER_SECONDS = 15;        // 1 heart per 15s of ad watched
const STREAK_COINS_PER_DAY = 3;

export async function getActiveDialect(): Promise<Dialect> {
  const val = await AsyncStorage.getItem(KEYS.activeDialect);
  return (val as Dialect) ?? "standard";
}

export async function setActiveDialect(dialect: Dialect) {
  await AsyncStorage.setItem(KEYS.activeDialect, dialect);
}

export async function getCompletedLessons(dialect: Dialect): Promise<string[]> {
  const val = await AsyncStorage.getItem(KEYS.completedLessons(dialect));
  return val ? JSON.parse(val) : [];
}

export async function completeLesson(
  dialect: Dialect,
  lessonId: string,
  xp: number,
  correct: number = 0,
  total: number = 0,
) {
  const completed = await getCompletedLessons(dialect);
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    await AsyncStorage.setItem(KEYS.completedLessons(dialect), JSON.stringify(completed));
  }

  // Update total XP
  const currentXp = parseInt((await AsyncStorage.getItem(KEYS.xp)) ?? "0");
  await AsyncStorage.setItem(KEYS.xp, String(currentXp + xp));

  // Update daily XP (resets each calendar day)
  const today = new Date().toDateString();
  const dailyDate = await AsyncStorage.getItem(KEYS.dailyDate);
  const currentDailyXp = dailyDate === today
    ? parseInt((await AsyncStorage.getItem(KEYS.dailyXp)) ?? "0")
    : 0;
  await AsyncStorage.multiSet([
    [KEYS.dailyXp,   String(currentDailyXp + xp)],
    [KEYS.dailyDate, today],
  ]);

  // Update streak (streak freeze protects against missed days)
  const lastActive = await AsyncStorage.getItem(KEYS.lastActive);
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const currentStreak = parseInt((await AsyncStorage.getItem(KEYS.streak)) ?? "0");
  if (lastActive === today) {
    // Same day — no streak change
  } else if (lastActive === yesterday) {
    await AsyncStorage.setItem(KEYS.streak, String(currentStreak + 1));
  } else {
    // Missed at least one day — check for freeze
    const frozeIt = await consumeStreakFreezeIfNeeded();
    if (!frozeIt) {
      await AsyncStorage.setItem(KEYS.streak, "1");
    }
    // If freeze was active, streak is preserved as-is
  }
  await AsyncStorage.setItem(KEYS.lastActive, today);

  // Award coins: streak coins (once per day) + lesson completion coins
  await Promise.all([
    maybeAwardStreakCoins(),
    addCoinsForLesson(xp, correct, total),
  ]);

  // Caller is responsible for triggering Firestore sync (see lesson/[id].tsx)
}

// ── Heart regeneration ────────────────────────────────────────────────────────
// Passive regen: 1 heart per 30 min since last heart was lost.
// Call this before any getStats() read to keep hearts current.
async function applyHeartRegen(): Promise<void> {
  const [heartsRaw, lastLostRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.hearts),
    AsyncStorage.getItem(KEYS.lastHeartLostAt),
  ]);
  const current = parseInt(heartsRaw ?? String(MAX_HEARTS));
  if (current >= MAX_HEARTS || !lastLostRaw) return; // full or never lost

  const elapsed = Date.now() - parseInt(lastLostRaw);
  const regened = Math.floor(elapsed / HEART_REGEN_MS);
  if (regened <= 0) return;

  const newHearts = Math.min(MAX_HEARTS, current + regened);
  const ops: [string, string][] = [[KEYS.hearts, String(newHearts)]];
  if (newHearts >= MAX_HEARTS) {
    ops.push([KEYS.lastHeartLostAt, ""]); // clear timer when full
  } else {
    // Advance the timestamp so next regen counts from the right point
    const consumed = regened * HEART_REGEN_MS;
    ops.push([KEYS.lastHeartLostAt, String(parseInt(lastLostRaw) + consumed)]);
  }
  await AsyncStorage.multiSet(ops);
}

export async function getStats() {
  await applyHeartRegen();
  const [xp, streak, hearts] = await Promise.all([
    AsyncStorage.getItem(KEYS.xp),
    AsyncStorage.getItem(KEYS.streak),
    AsyncStorage.getItem(KEYS.hearts),
  ]);
  return {
    totalXp: parseInt(xp ?? "0"),
    currentStreak: parseInt(streak ?? "0"),
    hearts: parseInt(hearts ?? String(MAX_HEARTS)),
  };
}

export async function loseHeart(): Promise<void> {
  await applyHeartRegen();
  const current = parseInt((await AsyncStorage.getItem(KEYS.hearts)) ?? String(MAX_HEARTS));
  const next = Math.max(0, current - 1);
  const ops: [string, string][] = [[KEYS.hearts, String(next)]];
  if (next < MAX_HEARTS) {
    ops.push([KEYS.lastHeartLostAt, String(Date.now())]);
  }
  await AsyncStorage.multiSet(ops);
}

export async function addHearts(n: number): Promise<void> {
  await applyHeartRegen();
  const current = parseInt((await AsyncStorage.getItem(KEYS.hearts)) ?? String(MAX_HEARTS));
  const next = Math.min(MAX_HEARTS, current + n);
  const ops: [string, string][] = [[KEYS.hearts, String(next)]];
  if (next >= MAX_HEARTS) ops.push([KEYS.lastHeartLostAt, ""]);
  await AsyncStorage.multiSet(ops);
}

// Hearts earned from watching a rewarded ad
// Rate: 1 heart per AD_HEART_PER_SECONDS seconds of ad watched
export async function addHeartsFromAd(adDurationSeconds: number): Promise<number> {
  const granted = Math.floor(adDurationSeconds / AD_HEART_PER_SECONDS);
  if (granted > 0) await addHearts(granted);
  return granted;
}

// How many seconds until the next heart regens (for countdown display)
export async function nextHeartRegenMs(): Promise<number | null> {
  await applyHeartRegen();
  const [heartsRaw, lastLostRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.hearts),
    AsyncStorage.getItem(KEYS.lastHeartLostAt),
  ]);
  const current = parseInt(heartsRaw ?? String(MAX_HEARTS));
  if (current >= MAX_HEARTS || !lastLostRaw) return null;
  const elapsed = Date.now() - parseInt(lastLostRaw);
  return Math.max(0, HEART_REGEN_MS - (elapsed % HEART_REGEN_MS));
}

// Spend XP (lowers leaderboard rank — intentional Bazaar tradeoff)
export async function spendXp(n: number): Promise<boolean> {
  const current = parseInt((await AsyncStorage.getItem(KEYS.xp)) ?? "0");
  if (current < n) return false;
  await AsyncStorage.setItem(KEYS.xp, String(current - n));
  return true;
}

// ── Streak freeze ─────────────────────────────────────────────────────────────
const STREAK_FREEZE_KEY = "streak_freeze_active";

export async function activateStreakFreeze(): Promise<void> {
  await AsyncStorage.setItem(STREAK_FREEZE_KEY, "true");
}

export async function isStreakFreezeActive(): Promise<boolean> {
  return (await AsyncStorage.getItem(STREAK_FREEZE_KEY)) === "true";
}

export async function consumeStreakFreezeIfNeeded(): Promise<boolean> {
  const frozen = await isStreakFreezeActive();
  if (!frozen) return false;
  await AsyncStorage.removeItem(STREAK_FREEZE_KEY);
  return true;
}

// ── Coins ─────────────────────────────────────────────────────────────────────
export async function getCoins(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.coins);
  return parseInt(raw ?? "0");
}

export async function addCoins(n: number): Promise<number> {
  const current = await getCoins();
  const next = current + n;
  await AsyncStorage.setItem(KEYS.coins, String(next));
  return next;
}

export async function spendCoins(n: number): Promise<boolean> {
  const current = await getCoins();
  if (current < n) return false;
  await AsyncStorage.setItem(KEYS.coins, String(current - n));
  return true;
}

// Coins from social sharing actions
export async function addCoinsForShare(action: "streak" | "invite" | "report_card" | "wrapped"): Promise<number> {
  const AMOUNTS: Record<string, number> = {
    streak: 5, invite: 15, report_card: 3, wrapped: 10,
  };
  return addCoins(AMOUNTS[action] ?? 0);
}

// Coins from lesson/quiz completion
// Formula: floor(lessonXpReward × correctFraction)
// This scales coins to difficulty × performance
export async function addCoinsForLesson(lessonXpReward: number, correct: number, total: number): Promise<number> {
  if (total === 0) return 0;
  const earned = Math.max(1, Math.floor(lessonXpReward * (correct / total)));
  return addCoins(earned);
}

// Streak coins: 3 per new streak day (idempotent — won't double-award same day)
export async function maybeAwardStreakCoins(): Promise<number> {
  const today = new Date().toDateString();
  const lastDate = await AsyncStorage.getItem(KEYS.lastStreakCoinDate);
  if (lastDate === today) return 0;
  await AsyncStorage.setItem(KEYS.lastStreakCoinDate, today);
  return addCoins(STREAK_COINS_PER_DAY);
}

// ── Dialect progress ──────────────────────────────────────────────────────────
export async function getAllDialectProgress(): Promise<Record<Dialect, string[]>> {
  const dialects: Dialect[] = ["standard", "sylheti", "barisali", "chittagonian", "rajshahi", "khulna"];
  const results = await Promise.all(dialects.map((d) => getCompletedLessons(d)));
  return {
    standard:     results[0],
    sylheti:      results[1],
    barisali:     results[2],
    chittagonian: results[3],
    rajshahi:     results[4],
    khulna:       results[5],
  };
}

// ── Daily goal helpers ────────────────────────────────────────────────────────
export async function getDailyProgress(): Promise<{ xpToday: number; goal: number; done: boolean }> {
  const today = new Date().toDateString();
  const [dailyDate, dailyXpRaw, goalRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.dailyDate),
    AsyncStorage.getItem(KEYS.dailyXp),
    AsyncStorage.getItem(KEYS.dailyGoalTarget),
  ]);
  const xpToday = dailyDate === today ? parseInt(dailyXpRaw ?? "0") : 0;
  const goal = parseInt(goalRaw ?? "50");
  return { xpToday, goal, done: xpToday >= goal };
}

export async function setDailyGoalTarget(xp: number) {
  await AsyncStorage.setItem(KEYS.dailyGoalTarget, String(xp));
}

// ── Onboarding helpers ────────────────────────────────────────────────────────
export async function isOnboardingDone(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.onboardingDone)) === "true";
}

export async function markOnboardingDone() {
  await AsyncStorage.setItem(KEYS.onboardingDone, "true");
}

// ── Lesson resume (save mid-lesson progress) ─────────────────────────────────
export type LessonResume = {
  lessonId:     string;
  dialect:      Dialect;
  exerciseIndex: number;
  xpSoFar:      number;
  savedAt:      number; // epoch ms
};

export async function saveLessonResume(data: LessonResume): Promise<void> {
  await AsyncStorage.setItem(KEYS.lessonResume(data.lessonId), JSON.stringify(data));
}

export async function getLessonResume(lessonId: string): Promise<LessonResume | null> {
  const raw = await AsyncStorage.getItem(KEYS.lessonResume(lessonId));
  if (!raw) return null;
  try { return JSON.parse(raw) as LessonResume; } catch { return null; }
}

export async function clearLessonResume(lessonId: string): Promise<void> {
  await AsyncStorage.removeItem(KEYS.lessonResume(lessonId));
}

// Returns the streak count that was just broken, or null if intact.
// Resets streak to 0 when a break is detected (no freeze active).
// Call once on app open inside useFocusEffect on HomeScreen.
export async function checkAndResetBrokenStreak(): Promise<number | null> {
  const lastActive = await AsyncStorage.getItem(KEYS.lastActive);
  if (!lastActive) return null;
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastActive === today || lastActive === yesterday) return null;
  const currentStreak = parseInt((await AsyncStorage.getItem(KEYS.streak)) ?? "0");
  if (currentStreak <= 0) return null;
  // Streak is broken — check for freeze
  const frozeIt = await consumeStreakFreezeIfNeeded();
  if (frozeIt) return null; // freeze saved us, no modal needed
  await AsyncStorage.setItem(KEYS.streak, "0");
  return currentStreak;
}

// ── Streak milestone detection ───────────────────────────────────────────────
// Returns the milestone (7, 14, or 30) if this streak value just crossed one,
// awards coins, and marks it so it won't fire again for the same value.
const MILESTONE_COIN_KEY = (n: number) => `streak_milestone_${n}_awarded`;
const STREAK_MILESTONES = [7, 14, 30] as const;

export async function checkStreakMilestone(streak: number): Promise<7 | 14 | 30 | null> {
  for (const m of STREAK_MILESTONES) {
    if (streak >= m) {
      const done = await AsyncStorage.getItem(MILESTONE_COIN_KEY(m));
      if (!done) {
        await AsyncStorage.setItem(MILESTONE_COIN_KEY(m), "true");
        const coins = m === 7 ? 15 : m === 14 ? 30 : 75;
        await addCoins(coins);
        return m;
      }
    }
  }
  return null;
}

// ── Lesson attempt history ────────────────────────────────────────────────────
export type LessonAttempt = {
  lessonId:   string;
  lessonTitle: string;
  dialect:    Dialect;
  date:       number; // epoch ms
  xpEarned:   number;
  correct:    number;
  total:      number;
  isQuiz:     boolean;
};

const MAX_HISTORY = 50;

export async function recordLessonAttempt(attempt: LessonAttempt): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.lessonHistory);
  const history: LessonAttempt[] = raw ? JSON.parse(raw) : [];
  history.unshift(attempt); // newest first
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  await AsyncStorage.setItem(KEYS.lessonHistory, JSON.stringify(history));
}

export async function getLessonHistory(): Promise<LessonAttempt[]> {
  const raw = await AsyncStorage.getItem(KEYS.lessonHistory);
  return raw ? JSON.parse(raw) : [];
}

// ── Restore progress from cloud (used by Firestore sync) ─────────────────────
export async function restoreFromCloud(data: {
  totalXp:       number;
  currentStreak: number;
  hearts:        number;
  activeDialect: Dialect;
  completedLessons: Partial<Record<Dialect, string[]>>;
}) {
  const ops: Promise<void>[] = [
    AsyncStorage.setItem(KEYS.xp,            String(data.totalXp)),
    AsyncStorage.setItem(KEYS.streak,        String(data.currentStreak)),
    AsyncStorage.setItem(KEYS.hearts,        String(data.hearts)),
    AsyncStorage.setItem(KEYS.activeDialect, data.activeDialect),
  ];
  const dialects: Dialect[] = ["standard", "sylheti", "barisali", "chittagonian", "rajshahi", "khulna"];
  for (const d of dialects) {
    const lessons = data.completedLessons[d];
    if (lessons) {
      ops.push(AsyncStorage.setItem(KEYS.completedLessons(d), JSON.stringify(lessons)));
    }
  }
  await Promise.all(ops);
}

