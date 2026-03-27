// ── Firebase Auth helpers ──────────────────────────────────────────────────────
// Supports: anonymous auth on first launch → upgrade to email/Google on signup
// Local AsyncStorage is the primary store; Firestore is synced when online

import {
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "auth_user_id";

// ── Sign in anonymously on first launch ────────────────────────────────────────
export async function signInAnon(): Promise<User> {
  const cred = await signInAnonymously(auth);
  await AsyncStorage.setItem(AUTH_KEY, cred.user.uid);
  // Create a Firestore profile if it doesn't exist yet
  const ref = doc(db, "users", cred.user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: cred.user.uid,
      isAnonymous: true,
      createdAt: serverTimestamp(),
      displayName: null,
      email: null,
    });
  }
  return cred.user;
}

// ── Register with email — upgrades anonymous account, preserving progress ──────
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const current = auth.currentUser;
  let user: User;

  if (current?.isAnonymous) {
    // Upgrade anonymous account instead of creating a new one (preserves progress)
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(current, credential);
    user = result.user;
  } else {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    user = result.user;
  }

  await updateProfile(user, { displayName });

  // Update Firestore profile
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    isAnonymous: false,
    email,
    displayName,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await AsyncStorage.setItem(AUTH_KEY, user.uid);
  return user;
}

// ── Sign in existing user ──────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await AsyncStorage.setItem(AUTH_KEY, result.user.uid);
  return result.user;
}

// ── Sign out ───────────────────────────────────────────────────────────────────
export async function logOut(): Promise<void> {
  await signOut(auth);
  await AsyncStorage.removeItem(AUTH_KEY);
}

// ── Get current user (sync) ────────────────────────────────────────────────────
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ── Subscribe to auth state changes ───────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
