import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { LetterTraceExercise } from "@bangla-learn/types";
import { speakBangla, stopSpeech } from "@/lib/tts";

interface Props {
  exercise: LetterTraceExercise;
  onComplete: () => void;
}

export default function LetterStudy({ exercise, onComplete }: Props) {
  const speak = () => speakBangla(exercise.character).catch(() => {});

  // Auto-play pronunciation when card appears
  useEffect(() => {
    const t = setTimeout(() => speak(), 400);
    return () => { clearTimeout(t); stopSpeech(); };
  }, [exercise.character]);

  return (
    <View style={s.card}>
      <Text style={s.label}>LETTER</Text>

      <TouchableOpacity style={s.characterBox} onPress={speak} activeOpacity={0.75}>
        <Text style={s.character}>{exercise.character}</Text>
        <View style={s.soundBadge}>
          <Ionicons name="volume-high" size={18} color="#fff" />
        </View>
      </TouchableOpacity>

      <Text style={s.romanization}>{exercise.romanization}</Text>

      {exercise.exampleWord ? (
        <View style={s.exampleRow}>
          <Text style={s.exampleLabel}>Example: </Text>
          <Text style={s.exampleWord}>{exercise.exampleWord}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={s.continueBtn} onPress={onComplete}>
        <Text style={s.continueTxt}>Got it →</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginTop: 24,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#a3a3a3",
    marginBottom: 20,
  },
  characterBox: {
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: "#f0fdf4",
    borderWidth: 2,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  character: {
    fontSize: 96,
    lineHeight: 120,
    color: "#166534",
    includeFontPadding: false,
  },
  soundBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#22c55e",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  romanization: {
    fontSize: 26,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 32,
  },
  exampleLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  exampleWord: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  continueBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  continueTxt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
