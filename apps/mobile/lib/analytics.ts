// ── Analytics service ──────────────────────────────────────────────────────────
// Lightweight Firestore-based event tracking.
// All writes are fire-and-forget — never blocks the UI, fails silently offline.
//
// Firestore structure:
//   analyticsEvents/{auto-id}
//     event: string
//     uid:   string | null
//     ...params
//     ts:    serverTimestamp
//
// To query in Firebase Console:
//   collection("analyticsEvents").where("event", "==", "lesson_complete")
//   collection("analyticsEvents").where("uid", "==", "abc123").orderBy("ts")

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";
import type { Dialect } from "@bangla-learn/types";

// ── Core low-level write ──────────────────────────────────────────────────────
function track(event: string, params: Record<string, unknown> = {}): void {
  const uid = auth.currentUser?.uid ?? null;
  addDoc(collection(db, "analyticsEvents"), {
    event,
    uid,
    ts: serverTimestamp(),
    ...params,
  }).catch(() => {
    // Fail silently — offline is fine
  });
}

// ── Auth events ───────────────────────────────────────────────────────────────
export function trackAuthSignup(method: "email" | "google" | "facebook"): void {
  track("auth_signup", { method });
}

export function trackAuthLogin(method: "email" | "google" | "facebook"): void {
  track("auth_login", { method });
}

export function trackAuthLogout(): void {
  track("auth_logout");
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
export function trackAppOpen(): void {
  track("app_open");
}

export function trackScreenView(screenName: string): void {
  track("screen_view", { screenName });
}

// ── Dialect events ────────────────────────────────────────────────────────────
export function trackDialectSelect(dialect: Dialect): void {
  track("dialect_select", { dialect });
}

// ── Lesson events ─────────────────────────────────────────────────────────────
export function trackLessonStart(lessonId: string, dialect: Dialect): void {
  track("lesson_start", { lessonId, dialect });
}

export function trackLessonComplete(
  lessonId: string,
  dialect: Dialect,
  xpEarned: number,
  score: number,        // 0–100 percentage of correct answers
  durationSec: number
): void {
  track("lesson_complete", { lessonId, dialect, xpEarned, score, durationSec });
}

export function trackLessonAbandon(
  lessonId: string,
  dialect: Dialect,
  progressPct: number   // 0–100 how far through the lesson they got
): void {
  track("lesson_abandon", { lessonId, dialect, progressPct });
}

// ── Gamification events ───────────────────────────────────────────────────────
export function trackAchievementUnlocked(achievementId: string): void {
  track("achievement_unlocked", { achievementId });
}

export function trackStreakEvent(type: "extended" | "broken", days: number): void {
  track("streak_event", { type, days });
}

export function trackHeartLost(remaining: number): void {
  track("heart_lost", { remaining });
}

export function trackOnboardingComplete(): void {
  track("onboarding_complete");
}

export function trackBazaarOpen(): void {
  track("bazaar_open");
}

export function trackPrepOpen(unitId: string, dialect: string): void {
  track("prep_open", { unitId, dialect });
}
