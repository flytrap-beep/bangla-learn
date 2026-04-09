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

const NOTIF_ID_KEY  = "streak_reminder_notif_id";  // persists scheduled notification id
const PERM_ASKED_KEY = "notif_permission_asked";    // only ask once

// How far from now to schedule the reminder (23 h — just under a day)
const REMINDER_DELAY_MS = 23 * 60 * 60 * 1000;

// ── Permission ────────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  // Only ask once per install
  const asked = await AsyncStorage.getItem(PERM_ASKED_KEY);
  if (asked) {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }

  await AsyncStorage.setItem(PERM_ASKED_KEY, "1");

  // Android 13+ requires explicit permission
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("streak", {
      name: "Streak Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ── Schedule the daily streak reminder ───────────────────────────────────────

export async function scheduleStreakReminder(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    // Cancel any existing reminder first
    await cancelStreakReminder();

    const fireAt = new Date(Date.now() + REMINDER_DELAY_MS);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "আপনার streak ভুলবেন না! 🔥",
        body: "A few minutes of Bangla keeps your streak alive. Come back!",
        sound: true,
        data: { type: "streak_reminder" },
      },
      trigger: {
        date: fireAt,
      },
    });

    await AsyncStorage.setItem(NOTIF_ID_KEY, id);
  } catch {
    // Notifications are non-critical — fail silently
  }
}

// Cancel the currently scheduled streak reminder (call after lesson, or on foreground)
export async function cancelStreakReminder(): Promise<void> {
  try {
    const id = await AsyncStorage.getItem(NOTIF_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(NOTIF_ID_KEY);
    }
  } catch {
    // ignore
  }
}

// Call once at app startup to set the default notification handler
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}
