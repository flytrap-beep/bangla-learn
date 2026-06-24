// ── Push / local notification service ────────────────────────────────────────
// Uses expo-notifications for local scheduled reminders only.
// Remote push (FCM/APNs) tokens are stored but not yet used server-side.
//
// Strategy:
//   - After every lesson completion → reschedule the streak reminder
//     so it fires 20–24 hours from now (never interrupts an active session).
//   - On app foreground (AuthContext AppState listener) → cancel + reschedule
//     so the reminder always stays ~24 h out from last activity.
//   - If the user hasn't opened the app at all, the reminder fires at 7 pm local time.

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_ID_KEY   = "streak_reminder_notif_id";
const HEART_NOTIF_KEY = "heart_refill_notif_id";
const PERM_ASKED_KEY  = "notif_permission_asked";

const REMINDER_DELAY_MS    = 23 * 60 * 60 * 1000;
const MAX_HEARTS_CONST     = 5;
const REGEN_PER_HEART_MS   = 30 * 60 * 1000; // must match storage.ts

// ── Streak reminder messages (random selection each time) ─────────────────────
const STREAK_MESSAGES = [
  {
    title: "আপনার streak ভুলবেন না! 🔥",
    body:  "A few minutes of Bangla keeps your streak alive. Come back!",
  },
  {
    title: "আজকে Bangla শিখেছেন? 📚",
    body:  "Your streak is waiting. Even one quick lesson counts!",
  },
  {
    title: "Your streak is at risk! 🔥",
    body:  "Don't let your Bengali journey stop today. Open BhashaLoop!",
  },
  {
    title: "চলুন, আজ একটু বাংলা শিখি! ✨",
    body:  "Just 5 minutes keeps your flame alive. You've got this!",
  },
  {
    title: "Missing you in BhashaLoop 💚",
    body:  "Your streak doesn't wait forever — come learn some Bangla!",
  },
  {
    title: "একটু অপেক্ষা করুন! 🌙",
    body:  "Before the day ends — do one lesson and keep your streak alive.",
  },
  {
    title: "Language learning is a daily habit 🧠",
    body:  "Open BhashaLoop and keep that streak going strong!",
  },
  {
    title: "দিনটা শেষ হওয়ার আগে... 🌅",
    body:  "One lesson. That's all it takes to protect your streak today.",
  },
] as const;

// ── Permission ────────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const asked = await AsyncStorage.getItem(PERM_ASKED_KEY);
  if (asked) {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }

  await AsyncStorage.setItem(PERM_ASKED_KEY, "1");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("streak", {
      name:             "Streak Reminders",
      importance:       Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
    await Notifications.setNotificationChannelAsync("hearts", {
      name:       "Heart Regeneration",
      importance: Notifications.AndroidImportance.LOW,
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ── Streak reminder ───────────────────────────────────────────────────────────

export async function scheduleStreakReminder(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    await cancelStreakReminder();

    const msg    = STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];
    const fireAt = new Date(Date.now() + REMINDER_DELAY_MS);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body:  msg.body,
        sound: true,
        data:  { type: "streak_reminder" },
      },
      trigger: { date: fireAt },
    });

    await AsyncStorage.setItem(NOTIF_ID_KEY, id);
  } catch {
    // non-critical
  }
}

export async function cancelStreakReminder(): Promise<void> {
  try {
    const id = await AsyncStorage.getItem(NOTIF_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(NOTIF_ID_KEY);
    }
  } catch {}
}

// ── Heart refill notification ─────────────────────────────────────────────────
// Schedule a notification to fire when all hearts are fully restored.
// Call after every loseHeart(), passing in the new (post-loss) heart count.
// Call cancelHeartRefillNotification() when hearts are restored early (Bazaar / ad).

export async function scheduleHeartRefillNotification(heartsAfterLoss: number): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    await cancelHeartRefillNotification();

    if (heartsAfterLoss >= MAX_HEARTS_CONST) return;

    const heartsToFill = MAX_HEARTS_CONST - heartsAfterLoss;
    const fireAt       = new Date(Date.now() + heartsToFill * REGEN_PER_HEART_MS);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "হৃদয় পূর্ণ হয়েছে! ❤️",
        body:  "All 5 hearts are back — jump into a lesson!",
        sound: true,
        data:  { type: "heart_refill" },
      },
      trigger: { date: fireAt },
    });

    await AsyncStorage.setItem(HEART_NOTIF_KEY, id);
  } catch {}
}

export async function cancelHeartRefillNotification(): Promise<void> {
  try {
    const id = await AsyncStorage.getItem(HEART_NOTIF_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(HEART_NOTIF_KEY);
    }
  } catch {}
}

// ── Notification handler (call once at startup) ───────────────────────────────

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge:  false,
    }),
  });
}
