import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Dialect } from "@bangla-learn/types";

const KEYS = {
  activeDialect: "active_dialect",
  completedLessons: (dialect: Dialect) => `completed_${dialect}`,
  xp: "total_xp",
  streak: "streak",
  hearts: "hearts",
  lastActive: "last_active",
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

  // Update XP
  const currentXp = parseInt((await AsyncStorage.getItem(KEYS.xp)) ?? "0");
  await AsyncStorage.setItem(KEYS.xp, String(currentXp + xp));

  // Update streak
  const today = new Date().toDateString();
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
