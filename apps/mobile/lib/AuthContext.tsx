// ── Auth context — wraps the whole app ────────────────────────────────────────
// Provides: currentUser, isLoading, isAnonymous
// On mount: signs in anonymously if not already authenticated,
//           then tries to pull progress from Firestore (new device support).

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AppState, AppStateStatus } from "react-native";
import type { User } from "firebase/auth";
import { signInAnon, onAuthChange } from "./auth";
import { startRealtimeSync, pullProgressFromFirestore, pushProgressToFirestore } from "./sync";
import { trackAppOpen } from "./analytics";

type AuthContextValue = {
  user:        User | null;
  isLoading:   boolean;
  isAnonymous: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null, isLoading: true, isAnonymous: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trackAppOpen();

    // Listen for auth state changes
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Try pulling cloud progress on any sign-in (handles new device installs)
        pullProgressFromFirestore().catch(() => {});
        // Start real-time sync if signed in (non-anonymous)
        if (!firebaseUser.isAnonymous) startRealtimeSync();
      } else {
        // No user → sign in anonymously so progress is always tied to an ID
        try {
          const anonUser = await signInAnon();
          setUser(anonUser);
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  // Push progress to Firestore whenever app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        pushProgressToFirestore().catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAnonymous: user?.isAnonymous ?? true,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
