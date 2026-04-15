import { useEffect, useRef } from "react";
import { Audio } from "expo-av";

/**
 * Plays an audio URL whenever `uri` changes (and is non-null).
 * Cleans up the previous sound before loading the next one.
 * Safe to call with null — does nothing.
 */
export function useSound(uri: string | null | undefined) {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!uri) return;

    let cancelled = false;

    Audio.Sound.createAsync({ uri })
      .then(({ sound }) => {
        if (cancelled) {
          sound.unloadAsync().catch(() => {});
          return;
        }
        soundRef.current = sound;
        sound.playAsync().catch(() => {});
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, [uri]);
}
