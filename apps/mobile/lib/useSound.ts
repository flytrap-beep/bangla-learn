import { useEffect, useRef } from "react";
import { Audio } from "expo-av";
import { speakBangla, stopSpeech } from "./tts";

/**
 * Plays audio when an exercise loads.
 *
 * Priority:
 *   1. `uri`          — a pre-recorded MP3/OGG URL (expo-av). Used when content
 *                       ships audio files (future upgrade path).
 *   2. `fallbackText` — a Bengali string to speak via device TTS (expo-speech).
 *                       Used today for translate_to_english, multiple_choice, and
 *                       letter_trace exercises so learners always hear pronunciation.
 *
 * Safe to call with all-null args — does nothing.
 */
export function useSound(
  uri: string | null | undefined,
  fallbackText?: string | null | undefined,
) {
  const soundRef = useRef<Audio.Sound | null>(null);

  // ── Pre-recorded audio (URL) ──────────────────────────────────────────────
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

  // ── TTS fallback (device speech engine) ──────────────────────────────────
  // Only fires when there is no pre-recorded URI so the two never overlap.
  useEffect(() => {
    if (uri || !fallbackText) return;

    // Small delay so the slide-in animation plays before audio starts
    const timer = setTimeout(() => {
      speakBangla(fallbackText).catch(() => {});
    }, 300);

    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [uri, fallbackText]);
}
