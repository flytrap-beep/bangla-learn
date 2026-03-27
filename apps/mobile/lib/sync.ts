// ── Firestore sync service ─────────────────────────────────────────────────────
// Offline-first: AsyncStorage is the source of truth for reads.
// This module syncs to/from Firestore when the user is authenticated and online.
// All writes go to AsyncStorage first, then queue a Firestore sync.

import {
  doc, setDoc, getDoc, updateDoc,
  serverTimestamp, onSnapshot, Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { getCurrentUser } from "./auth";
import {
  getActiveDialect, setActiveDialect,
  getCompletedLessons, getStats,
  getAllDialectProgress, restoreFromCloud,
} from "./storage";
import type { Dialect } from "@bangla-learn/types";

const DIALECTS: Dialect[] = ["standard", "sylheti", "barisali", "chittagonian"];

// ── Push local progress to Firestore ──────────────────────────────────────────
export async function pushProgressToFirestore(): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const [stats, dialectProgress, activeDialect] = await Promise.all([
      getStats(),
      getAllDialectProgress(),
      getActiveDialect(),
    ]);

    await setDoc(doc(db, "users", user.uid, "progress", "main"), {
      totalXp:       stats.totalXp,
      currentStreak: stats.currentStreak,
      hearts:        stats.hearts,
      activeDialect,
      completedLessons: dialectProgress,
      syncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    // Fail silently — offline is fine, will sync next time
    console.log("[sync] Firestore push failed (likely offline):", e);
  }
}

// ── Pull Firestore progress to local (for new device / fresh install) ──────────
export async function pullProgressFromFirestore(): Promise<boolean> {
  const user = getCurrentUser();
  if (!user) return false;

  try {
    const snap = await getDoc(doc(db, "users", user.uid, "progress", "main"));
    if (!snap.exists()) return false;

    const data = snap.data();
    // Only restore if Firestore has MORE XP than local (i.e. it's the more up-to-date source)
    const localStats = await getStats();
    if ((data.totalXp ?? 0) > localStats.totalXp) {
      await restoreFromCloud({
        totalXp:          data.totalXp,
        currentStreak:    data.currentStreak,
        hearts:           data.hearts ?? 5,
        activeDialect:    data.activeDialect ?? "standard",
        completedLessons: data.completedLessons ?? {},
      });
      return true;
    }
  } catch (e) {
    console.log("[sync] Firestore pull failed (likely offline):", e);
  }
  return false;
}

// ── Real-time listener: keep local in sync if another device updates ───────────
let _unsubscribe: Unsubscribe | null = null;

export function startRealtimeSync(): void {
  const user = getCurrentUser();
  if (!user) return;
  // Stop any existing listener
  _unsubscribe?.();

  _unsubscribe = onSnapshot(
    doc(db, "users", user.uid, "progress", "main"),
    async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const localStats = await getStats();
      // Only apply remote changes if they represent newer/higher progress
      if ((data.totalXp ?? 0) > localStats.totalXp) {
        await restoreFromCloud({
          totalXp:          data.totalXp,
          currentStreak:    data.currentStreak,
          hearts:           data.hearts ?? 5,
          activeDialect:    data.activeDialect ?? "standard",
          completedLessons: data.completedLessons ?? {},
        });
      }
    },
    (error) => console.log("[sync] Realtime listener error:", error)
  );
}

export function stopRealtimeSync(): void {
  _unsubscribe?.();
  _unsubscribe = null;
}
