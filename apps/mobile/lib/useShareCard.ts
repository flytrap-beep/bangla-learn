// ── useShareCard — capture a ShareCard view as a PNG and open the share sheet ──
// Falls back to plain-text Share.share on ANY failure so coin earning is never
// blocked by a capture problem (blank view, unsupported platform, etc.).
//
// Returns true when the user completed a share action (or, for the image path,
// when the share sheet resolved without error — the OS gives no completion
// signal for expo-sharing, so award coins after a clean resolve).

import { useRef, useCallback } from "react";
import { View, Share } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export function useShareCard() {
  const cardRef = useRef<View>(null);

  const shareCardAsImage = useCallback(async (fallbackText: string): Promise<boolean> => {
    try {
      if (!cardRef.current) throw new Error("card ref not mounted");
      const available = await Sharing.isAvailableAsync();
      if (!available) throw new Error("sharing unavailable");

      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        UTI: "public.png",
        dialogTitle: "Share your BhashaLoop progress",
      });
      return true;
    } catch {
      // Text fallback — preserves the original behavior and coin flow.
      try {
        const result = await Share.share({ message: fallbackText });
        return result.action === Share.sharedAction;
      } catch {
        return false;
      }
    }
  }, []);

  return { cardRef, shareCardAsImage };
}
