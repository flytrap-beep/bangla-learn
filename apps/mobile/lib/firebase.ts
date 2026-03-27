// ── Firebase configuration ─────────────────────────────────────────────────────
// Replace these placeholder values with your actual Firebase project credentials
// from the Firebase Console → Project Settings → Your apps → Web app config

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { initializeAuth, getAuth, getReactNativePersistence } = require("firebase/auth");
import type { Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            ?? "YOUR_API_KEY",
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? "YOUR_PROJECT.firebaseapp.com",
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         ?? "YOUR_PROJECT_ID",
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "YOUR_SENDER_ID",
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID             ?? "YOUR_APP_ID",
};

// Prevent re-initialization in hot reload
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// initializeAuth with AsyncStorage persistence so auth state survives cold restarts.
// Falls back to getAuth if already initialized (hot reload protection).
function buildAuth(): Auth {
  if (getApps().length > 1) return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence
        ? getReactNativePersistence(ReactNativeAsyncStorage)
        : undefined,
    });
  } catch {
    return getAuth(app);
  }
}

export const auth: Auth    = buildAuth();
export const db: Firestore = getFirestore(app);
export default app;
