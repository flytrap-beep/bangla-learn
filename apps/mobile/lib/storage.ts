import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Dialect } from "@bangla-learn/types";

const KEYS = {
  activeDialect: "active_dialect",
  completedLessons: (dialect: Dialect) => `completed_${dialect}`,
  xp: "total_xp",
  streak: "streak",
  hearts: "hearts",
  lastActive: "last_active",
  dailyXp: "daily_xp",
  dailyDate: "daily_date",
  dailyGoalTarget: "daily_goal_target",
  onboardingDone: "onboarding_done",
  lessonResume: (lessonId: string) => `resume_${lessonId}`,
  lessonHistory: "lesson_history",
};

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

export async function completeLesson(dialect: Dialect, lessonId: string, xp: number) {
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

  // Update streak
  const lastActive = await AsyncStorage.getItem(KEYS.lastActive);
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const currentStreak = parseInt((await AsyncStorage.getItem(KEYS.streak)) ?? "0");
  if (lastActive === today) {
    // Same day, no change
  } else if (lastActive === yesterday) {
    await AsyncStorage.setItem(KEYS.streak, String(currentStreak + 1));
  } else {
    await AsyncStorage.setItem(KEYS.streak, "1");
  }
  await AsyncStorage.setItem(KEYS.lastActive, today);

  // Caller is responsible for triggering Firestore sync (see lesson/[id].tsx)
}

export async function getStats() {
  const [xp, streak, hearts] = await Promise.all([
    AsyncStorage.getItem(KEYS.xp),
    AsyncStorage.getItem(KEYS.streak),
    AsyncStorage.getItem(KEYS.hearts),
  ]);
  return {
    totalXp: parseInt(xp ?? "0"),
    currentStreak: parseInt(streak ?? "0"),
    hearts: parseInt(hearts ?? "5"),
  };
}

export async function loseHeart() {
  const current = parseInt((await AsyncStorage.getItem(KEYS.hearts)) ?? "5");
  await AsyncStorage.setItem(KEYS.hearts, String(Math.max(0, current - 1)));
}

export async function addHearts(n: number) {
  const current = parseInt((await AsyncStorage.getItem(KEYS.hearts)) ?? "5");
  await AsyncStorage.setItem(KEYS.hearts, String(Math.min(5, current + n)));
}

export async function getAllDialectProgress(): Promise<Record<Dialect, string[]>> {
  const dialects: Dialect[] = ["standard", "sylheti", "barisali", "chittagonian"];
  const results = await Promise.all(dialects.map((d) => getCompletedLessons(d)));
  return {
    standard:     results[0],
    sylheti:      results[1],
    barisali:     results[2],
    chittagonian: results[3],
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
  const dialects: Dialect[] = ["standard", "sylheti", "barisali", "chittagonian"];
  for (const d of dialects) {
    const lessons = data.completedLessons[d];
    if (lessons) {
      ops.push(AsyncStorage.setItem(KEYS.completedLessons(d), JSON.stringify(lessons)));
    }
  }
  await Promise.all(ops);
}

