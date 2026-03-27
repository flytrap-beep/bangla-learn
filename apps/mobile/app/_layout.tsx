import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/lib/AuthContext";
import { isOnboardingDone } from "@/lib/storage";
import {
  useFonts,
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

function RootNavigator() {
  const router = useRouter();

  useEffect(() => {
    isOnboardingDone().then((done) => {
      if (!done) router.replace("/onboarding" as any);
    });
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)"            options={{ headerShown: false }} />
      <Stack.Screen name="onboarding"        options={{ headerShown: false }} />
      <Stack.Screen name="study-guide"       options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="lesson/[id]"       options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="prep/[unitId]"     options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="dialect/[dialect]" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="auth/login"        options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="auth/register"     options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  // Load Space Grotesk — app renders immediately even if fonts are still loading
  useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
