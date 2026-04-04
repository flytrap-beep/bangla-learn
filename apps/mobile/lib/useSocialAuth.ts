// ── Social auth hooks ──────────────────────────────────────────────────────────
// Google and Facebook OAuth using expo-auth-session + Firebase credentials.
// Pattern: OAuth flow → get token → Firebase signInWithCredential
//          If anonymous user exists: linkWithCredential (preserves progress)
//          Otherwise: direct sign-in (creates new Firebase account)
//
// Required env vars:
//   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
//   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
//   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
//   EXPO_PUBLIC_FACEBOOK_APP_ID

import { useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  linkWithCredential,
  OAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "./firebase";
import { trackAuthLogin, trackAuthSignup } from "./analytics";
import { pushProgressToFirestore } from "./sync";

// Required: tells expo-web-browser to dismiss the auth window properly on redirect
WebBrowser.maybeCompleteAuthSession();

const AUTH_KEY = "auth_user_id";

// ── Shared: create/update Firestore profile after social sign-in ──────────────
async function upsertSocialProfile(
  uid: string,
  displayName: string | null,
  email: string | null,
  photoURL: string | null,
  provider: "google" | "facebook"
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      uid,
      isAnonymous: false,
      displayName: displayName ?? null,
      email: email ?? null,
      photoURL: photoURL ?? null,
      provider,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await AsyncStorage.setItem(AUTH_KEY, uid);
}

// ── Google Sign-In ─────────────────────────────────────────────────────────────
type SocialAuthResult = {
  loading:  boolean;
  error:    string | null;
  signIn:   () => void;
};

export function useGoogleSignIn(
  onSuccess?: () => void,
  onError?: (msg: string) => void
): SocialAuthResult {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        const msg = "Google sign-in failed: no token received";
        setError(msg);
        onError?.(msg);
        return;
      }

      setLoading(true);
      setError(null);

      (async () => {
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          const current    = auth.currentUser;
          const isNewUser  = current?.isAnonymous ?? false;

          let uid: string;
          let name: string | null;
          let email: string | null;
          let photo: string | null;

          if (current?.isAnonymous) {
            // Upgrade anon → Google (preserves local progress)
            const result = await linkWithCredential(current, credential);
            uid   = result.user.uid;
            name  = result.user.displayName;
            email = result.user.email;
            photo = result.user.photoURL;
          } else {
            const result = await signInWithCredential(auth, credential);
            uid   = result.user.uid;
            name  = result.user.displayName;
            email = result.user.email;
            photo = result.user.photoURL;
          }

          await upsertSocialProfile(uid, name, email, photo, "google");
          await pushProgressToFirestore();

          if (isNewUser) {
            trackAuthSignup("google");
          } else {
            trackAuthLogin("google");
          }

          onSuccess?.();
        } catch (e: any) {
          const msg =
            e.code === "auth/account-exists-with-different-credential"
              ? "An account already exists with this email using a different sign-in method"
              : e.code === "auth/credential-already-in-use"
              ? "This Google account is already linked to another profile"
              : "Google sign-in failed. Please try again.";
          setError(msg);
          onError?.(msg);
        } finally {
          setLoading(false);
        }
      })();
    } else if (response.type === "error") {
      const msg = "Google sign-in was cancelled or failed";
      setError(msg);
      onError?.(msg);
    }
  }, [response]);

  return {
    loading,
    error,
    signIn: () => promptAsync(),
  };
}

// ── Facebook Sign-In ───────────────────────────────────────────────────────────
export function useFacebookSignIn(
  onSuccess?: () => void,
  onError?: (msg: string) => void
): SocialAuthResult {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (!accessToken) {
        const msg = "Facebook sign-in failed: no token received";
        setError(msg);
        onError?.(msg);
        return;
      }

      setLoading(true);
      setError(null);

      (async () => {
        try {
          const credential = FacebookAuthProvider.credential(accessToken);
          const current    = auth.currentUser;
          const isNewUser  = current?.isAnonymous ?? false;

          let uid: string;
          let name: string | null;
          let email: string | null;
          let photo: string | null;

          if (current?.isAnonymous) {
            const result = await linkWithCredential(current, credential);
            uid   = result.user.uid;
            name  = result.user.displayName;
            email = result.user.email;
            photo = result.user.photoURL;
          } else {
            const result = await signInWithCredential(auth, credential);
            uid   = result.user.uid;
            name  = result.user.displayName;
            email = result.user.email;
            photo = result.user.photoURL;
          }

          await upsertSocialProfile(uid, name, email, photo, "facebook");
          await pushProgressToFirestore();

          if (isNewUser) {
            trackAuthSignup("facebook");
          } else {
            trackAuthLogin("facebook");
          }

          onSuccess?.();
        } catch (e: any) {
          const msg =
            e.code === "auth/account-exists-with-different-credential"
              ? "An account already exists with this email using a different sign-in method"
              : e.code === "auth/credential-already-in-use"
              ? "This Facebook account is already linked to another profile"
              : "Facebook sign-in failed. Please try again.";
          setError(msg);
          onError?.(msg);
        } finally {
          setLoading(false);
        }
      })();
    } else if (response.type === "error") {
      const msg = "Facebook sign-in was cancelled or failed";
      setError(msg);
      onError?.(msg);
    }
  }, [response]);

  return {
    loading,
    error,
    signIn: () => promptAsync(),
  };
}
