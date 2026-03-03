import { db } from "./db";
import type { Dialect } from "@bangla-learn/types";

export async function getUserStats(userId: string) {
  const [progress, streak, hearts] = await Promise.all([
    db.userProgress.findMany({ where: { userId } }),
    db.userStreak.findUnique({ where: { userId } }),
    db.userHeart.findUnique({ where: { userId } }),
  ]);

  const totalXp = progress.reduce((sum, p) => sum + p.xpEarned, 0);
  const completedLessons = progress.filter((p) => p.completed).length;

  return {
    totalXp,
    completedLessons,
    currentStreak: streak?.current ?? 0,
    longestStreak: streak?.longest ?? 0,
    hearts: hearts?.hearts ?? 5,
  };
}

export async function getLessonProgress(userId: string, dialect: Dialect) {
  return db.userProgress.findMany({
    where: { userId, dialect },
  });
}

export async function completeLesson({
  userId,
  lessonId,
  dialect,
  xpEarned,
  heartsLost,
}: {
  userId: string;
  lessonId: string;
  dialect: Dialect;
  xpEarned: number;
  heartsLost: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.$transaction(async (tx) => {
    // Upsert lesson progress
    await tx.userProgress.upsert({
      where: { userId_dialect_lessonId: { userId, dialect, lessonId } },
      create: {
        userId,
        dialect,
        lessonId,
        xpEarned,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        xpEarned: { increment: xpEarned },
        completed: true,
        completedAt: new Date(),
      },
    });

    // Update streak
    const streak = await tx.userStreak.findUnique({ where: { userId } });
    const lastActive = streak?.lastActiveDate;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrent = 1;
    if (lastActive) {
      const lastDay = new Date(lastActive);
      lastDay.setHours(0, 0, 0, 0);
      if (lastDay.getTime() === today.getTime()) {
        newCurrent = streak!.current; // same day, don't increment
      } else if (lastDay.getTime() === yesterday.getTime()) {
        newCurrent = streak!.current + 1; // consecutive day
      }
    }

    await tx.userStreak.upsert({
      where: { userId },
      create: { userId, current: 1, longest: 1, lastActiveDate: new Date() },
      update: {
        current: newCurrent,
        longest: Math.max(newCurrent, streak?.longest ?? 0),
        lastActiveDate: new Date(),
      },
    });

    // Deduct hearts if lost
    if (heartsLost > 0) {
      await tx.userHeart.upsert({
        where: { userId },
        create: { userId, hearts: Math.max(0, 5 - heartsLost) },
        update: { hearts: { decrement: heartsLost } },
      });
    }
  });
}

export async function refillHearts(userId: string) {
  const hearts = await db.userHeart.findUnique({ where: { userId } });
  if (!hearts) return;

  const hoursSinceRefill =
    (Date.now() - hearts.lastRefill.getTime()) / (1000 * 60 * 60);
  const heartsToAdd = Math.floor(hoursSinceRefill / 0.5); // 1 heart every 30 min

  if (heartsToAdd > 0) {
    await db.userHeart.update({
      where: { userId },
      data: {
        hearts: Math.min(5, hearts.hearts + heartsToAdd),
        lastRefill: new Date(),
      },
    });
  }
}
