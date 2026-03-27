// ── Text-to-Speech service ─────────────────────────────────────────────────────
// Uses expo-speech for immediate playback (device TTS engine).
// On iOS the Bengali voice is good; on Android it varies by device.
//
// UPGRADE PATH: Replace speak() with Google Cloud TTS pre-generated audio
// by bundling MP3 files and using expo-av for playback.
// See scripts/generate-audio.ts for the generation script.

import * as Speech from "expo-speech";

// Bengali language code — iOS uses "bn-BD" (Bangladesh), Android uses "bn-IN"
const BANGLA_LANG = "bn-BD";
const PITCH  = 1.0;
const RATE   = 0.85; // Slightly slower than normal for learning

let _speaking = false;

// ── Speak a Bengali word or sentence ──────────────────────────────────────────
export async function speakBangla(text: string): Promise<void> {
  if (_speaking) {
    Speech.stop();
  }
  _speaking = true;
  return new Promise((resolve) => {
    Speech.speak(text, {
      language: BANGLA_LANG,
      pitch:    PITCH,
      rate:     RATE,
      onDone:  () => { _speaking = false; resolve(); },
      onError: () => { _speaking = false; resolve(); },
      onStopped: () => { _speaking = false; resolve(); },
    });
  });
}

// ── Stop any current speech ────────────────────────────────────────────────────
export function stopSpeech(): void {
  _speaking = false;
  Speech.stop();
}

// ── Check if TTS is available for Bengali ─────────────────────────────────────
export async function isBanglaVoiceAvailable(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) =>
      v.language?.startsWith("bn") || v.identifier?.includes("bn")
    );
  } catch {
    return false;
  }
}

// ── Speak with automatic dialect-specific rate/pitch ──────────────────────────
// Different dialects have different rhythms
export async function speakWithDialect(text: string, dialect: string): Promise<void> {
  const rates: Record<string, number> = {
    standard:     0.85,
    sylheti:      0.80, // slightly slower — Sylheti has distinct sounds
    barisali:     0.85,
    chittagonian: 0.78, // slowest — most distinct from standard
  };
  const rate = rates[dialect] ?? 0.85;
  if (_speaking) Speech.stop();
  _speaking = true;
  return new Promise((resolve) => {
    Speech.speak(text, {
      language: BANGLA_LANG,
      pitch: PITCH,
      rate,
      onDone:    () => { _speaking = false; resolve(); },
      onError:   () => { _speaking = false; resolve(); },
      onStopped: () => { _speaking = false; resolve(); },
    });
  });
}
