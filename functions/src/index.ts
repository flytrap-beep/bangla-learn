import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest }   from "firebase-functions/v2/https";
import { logger }      from "firebase-functions";
import * as admin      from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Daily analytics aggregation — runs at midnight UTC every day.
 * Reads yesterday's `analyticsEvents`, computes rollups, writes to
 * `analytics_daily/{YYYY-MM-DD}`.
 */
export const dailyAnalyticsRollup = onSchedule(
  { schedule: "0 0 * * *", timeZone: "UTC" },
  async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const dateStr    = yesterday.toISOString().slice(0, 10);
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay   = new Date(`${dateStr}T23:59:59.999Z`);

    const snap = await db
      .collection("analyticsEvents")
      .where("ts", ">=", admin.firestore.Timestamp.fromDate(startOfDay))
      .where("ts", "<=", admin.firestore.Timestamp.fromDate(endOfDay))
      .get();

    const dauSet: Set<string>             = new Set();
    const dialectCount: Record<string, number> = {};
    const screenCount:  Record<string, number> = {};
    let lessonsStarted = 0, lessonsCompleted = 0, lessonsAbandoned = 0;
    let totalXp = 0, totalScore = 0, scoreCount = 0;
    let totalDuration = 0, durationCount = 0;
    let newSignups = 0, logins = 0;

    snap.forEach((doc) => {
      const d     = doc.data();
      const event = d.event  as string ?? "";
      const uid   = d.uid    as string ?? "";
      if (uid) dauSet.add(uid);
      switch (event) {
        case "screen_view":    { const s = d.screen   as string ?? "unknown"; screenCount[s]  = (screenCount[s]  ?? 0) + 1; break; }
        case "dialect_select": { const dl = d.dialect as string ?? "unknown"; dialectCount[dl] = (dialectCount[dl] ?? 0) + 1; break; }
        case "lesson_start":    lessonsStarted++;   break;
        case "lesson_complete":
          lessonsCompleted++;
          if (typeof d.xpEarned    === "number") totalXp += d.xpEarned;
          if (typeof d.score       === "number") { totalScore += d.score; scoreCount++; }
          if (typeof d.durationSec === "number") { totalDuration += d.durationSec; durationCount++; }
          break;
        case "lesson_abandon":  lessonsAbandoned++; break;
        case "auth_signup":     newSignups++;       break;
        case "auth_login":      logins++;           break;
      }
    });

    const completionRate = lessonsStarted > 0 ? Math.round((lessonsCompleted / lessonsStarted) * 100) : 0;
    const avgScore       = scoreCount    > 0 ? Math.round(totalScore    / scoreCount)    : 0;
    const avgDuration    = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    await db.collection("analytics_daily").doc(dateStr).set({
      date: dateStr,
      dau:  dauSet.size,
      totalEvents: snap.size,
      newSignups, logins,
      lessonsStarted, lessonsCompleted, lessonsAbandoned, completionRate,
      totalXp, avgScore, avgDurationSec: avgDuration,
      topDialects: Object.entries(dialectCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([dialect,count])=>({dialect,count})),
      topScreens:  Object.entries(screenCount) .sort((a,b)=>b[1]-a[1]).slice(0,10).map(([screen,count])=>({screen,count})),
      computedAt:  admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`[dailyRollup] ${dateStr}: dau=${dauSet.size} lessons=${lessonsCompleted} xp=${totalXp}`);
  }
);

/**
 * HTTP trigger — manually backfill a specific date.
 * POST /backfillDate  { "date": "2025-01-15" }
 */
export const backfillDate = onRequest(async (req, res) => {
  if (req.method !== "POST") { res.status(405).send("POST only"); return; }

  const dateStr: string = req.body?.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    res.status(400).json({ error: "Provide { date: 'YYYY-MM-DD' }" });
    return;
  }

  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay   = new Date(`${dateStr}T23:59:59.999Z`);

  const snap = await db
    .collection("analyticsEvents")
    .where("ts", ">=", admin.firestore.Timestamp.fromDate(startOfDay))
    .where("ts", "<=", admin.firestore.Timestamp.fromDate(endOfDay))
    .get();

  const dauSet: Set<string>             = new Set();
  const dialectCount: Record<string, number> = {};
  const screenCount:  Record<string, number> = {};
  let lessonsStarted = 0, lessonsCompleted = 0, lessonsAbandoned = 0;
  let totalXp = 0, totalScore = 0, scoreCount = 0;
  let totalDuration = 0, durationCount = 0;
  let newSignups = 0, logins = 0;

  snap.forEach((doc) => {
    const d     = doc.data();
    const event = d.event  as string ?? "";
    const uid   = d.uid    as string ?? "";
    if (uid) dauSet.add(uid);
    switch (event) {
      case "screen_view":    { const s = d.screen   as string ?? "unknown"; screenCount[s]  = (screenCount[s]  ?? 0) + 1; break; }
      case "dialect_select": { const dl = d.dialect as string ?? "unknown"; dialectCount[dl] = (dialectCount[dl] ?? 0) + 1; break; }
      case "lesson_start":    lessonsStarted++;   break;
      case "lesson_complete":
        lessonsCompleted++;
        if (typeof d.xpEarned    === "number") totalXp += d.xpEarned;
        if (typeof d.score       === "number") { totalScore += d.score; scoreCount++; }
        if (typeof d.durationSec === "number") { totalDuration += d.durationSec; durationCount++; }
        break;
      case "lesson_abandon":  lessonsAbandoned++; break;
      case "auth_signup":     newSignups++;       break;
      case "auth_login":      logins++;           break;
    }
  });

  const completionRate = lessonsStarted > 0 ? Math.round((lessonsCompleted / lessonsStarted) * 100) : 0;
  const avgScore       = scoreCount    > 0 ? Math.round(totalScore    / scoreCount)    : 0;
  const avgDuration    = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

  const rollup = {
    date: dateStr, dau: dauSet.size, totalEvents: snap.size,
    newSignups, logins,
    lessonsStarted, lessonsCompleted, lessonsAbandoned, completionRate,
    totalXp, avgScore, avgDurationSec: avgDuration,
    topDialects: Object.entries(dialectCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([dialect,count])=>({dialect,count})),
    topScreens:  Object.entries(screenCount) .sort((a,b)=>b[1]-a[1]).slice(0,10).map(([screen,count])=>({screen,count})),
    computedAt:  admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("analytics_daily").doc(dateStr).set(rollup);
  res.json({ ok: true, date: dateStr, dau: dauSet.size, totalEvents: snap.size });
});
