// ── In-App Purchase service — powered by RevenueCat ───────────────────────────
//
// SETUP (before this works):
//  1. Create a RevenueCat project at https://app.revenuecat.com
//  2. Add products in App Store Connect and Google Play Console:
//       com.bhashaloop.app.heart_refill  — $0.99 consumable
//       com.bhashaloop.app.streak_freeze — $1.99 consumable
//       com.bhashaloop.app.xp_boost_2h   — $0.99 consumable
//  3. Add them to a RevenueCat Offering named "default"
//  4. Set env vars:
//       EXPO_PUBLIC_REVENUECAT_IOS_KEY     = appl_xxxx
//       EXPO_PUBLIC_REVENUECAT_ANDROID_KEY = goog_xxxx
//  5. Run `eas build --profile development` (Expo Go does not support IAP)
//
// PRODUCT IDs — must match exactly what you create in App Store Connect / Play Console
// and what you add to your RevenueCat Offering.

import Purchases, {
  type PurchasesPackage,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";

export type IAPProductId =
  | "com.bhashaloop.app.heart_refill"
  | "com.bhashaloop.app.streak_freeze"
  | "com.bhashaloop.app.xp_boost_2h";

// ── Init ──────────────────────────────────────────────────────────────────────
// Call once in the root _layout.tsx (or AuthProvider) before any purchase.
let _initialised = false;

export function initIAP(): void {
  if (_initialised) return;

  const iosKey     = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
  const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";
  const key        = Platform.OS === "ios" ? iosKey : androidKey;

  if (!key) {
    // Not configured — IAP will gracefully decline all purchases.
    console.log("[iap] RevenueCat key not set — IAP disabled in this build.");
    return;
  }

  Purchases.setLogLevel(LOG_LEVEL.ERROR); // silence debug noise in production
  Purchases.configure({ apiKey: key });
  _initialised = true;
}

// ── Fetch current offerings ───────────────────────────────────────────────────
// Returns the packages in the "default" offering, or [] on error.
export async function fetchOfferings(): Promise<PurchasesPackage[]> {
  if (!_initialised) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch {
    return [];
  }
}

// ── Purchase a product by identifier ─────────────────────────────────────────
// Returns { ok: true } on success, { ok: false, msg } on failure.
// Handles user cancellation gracefully (not shown as an error).
export async function purchaseProduct(
  productId: IAPProductId,
): Promise<{ ok: boolean; msg: string }> {
  if (!_initialised) {
    return {
      ok: false,
      msg: "In-app purchases not available in this build. Use XP or coins instead.",
    };
  }

  try {
    const packages = await fetchOfferings();
    const pkg = packages.find(
      (p) => p.product.identifier === productId,
    );

    if (!pkg) {
      return {
        ok: false,
        msg: "Product not found. Please try again later.",
      };
    }

    await Purchases.purchasePackage(pkg);
    return { ok: true, msg: "Purchase successful!" };
  } catch (e: unknown) {
    // PurchasesError has a userCancelled field — don't show an error message for that
    if (
      e &&
      typeof e === "object" &&
      "userCancelled" in e &&
      (e as { userCancelled: boolean }).userCancelled
    ) {
      return { ok: false, msg: "" }; // empty = suppress toast
    }
    const msg =
      e instanceof Error ? e.message : "Purchase failed. Please try again.";
    return { ok: false, msg };
  }
}

// ── Restore purchases (required by App Store guidelines) ─────────────────────
// Call from a "Restore Purchases" button in Settings / Profile.
export async function restorePurchases(): Promise<{ ok: boolean; msg: string }> {
  if (!_initialised) {
    return { ok: false, msg: "In-app purchases not available in this build." };
  }
  try {
    await Purchases.restorePurchases();
    return { ok: true, msg: "Purchases restored." };
  } catch {
    return { ok: false, msg: "Could not restore purchases. Please try again." };
  }
}
