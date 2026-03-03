import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getLesson } from "@bangla-learn/content";
import type { Dialect, Exercise } from "@bangla-learn/types";
import { completeLesson, loseHeart } from "@/lib/storage";

type ExerciseState = "answering" | "correct" | "incorrect";

export default function LessonScreen() {
  const { id, dialect } = useLocalSearchParams<{ id: string; dialect: string }>();
  const router = useRouter();

  const lesson = getLesson((dialect ?? "standard") as Dialect, id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<ExerciseState>("answering");
  const [totalXp, setTotalXp] = useState(0);
  const [heartsLost, setHeartsLost] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [textInput, setTextInput] = useState("");

  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Lesson not found</Text>
      </SafeAreaView>
    );
  }

  const exercise = lesson.exercises[currentIndex];
  const progress = (currentIndex / lesson.exercises.length) * 100;

  async function handleAnswer(correct: boolean) {
    setState(correct ? "correct" : "incorrect");
    if (correct) {
      setTotalXp((prev) => prev + exercise.xp);
    } else {
      setHeartsLost((prev) => prev + 1);
      await loseHeart();
    }
  }

  async function handleNext() {
    setState("answering");
    setSelected(null);
    setTextInput("");
    if (currentIndex + 1 >= lesson!.exercises.length) {
      await completeLesson((dialect ?? "standard") as Dialect, lesson!.id, totalXp);
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleMultipleChoice(idx: number) {
    if (state !== "answering") return;
    setSelected(idx);
    const ex = exercise as { type: "multiple_choice"; correct: number };
    handleAnswer(idx === ex.correct);
  }

  function handleTextSubmit() {
    if (!textInput.trim() || state !== "answering") return;
    const ex = exercise as { answer: string };
    const correct =
      textInput.trim().toLowerCase() === ex.answer.toLowerCase();
    handleAnswer(correct);
  }

  if (finished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedEmoji}>🎉</Text>
          <Text style={styles.finishedTitle}>Lesson Complete!</Text>
          <Text style={styles.finishedSub}>+{totalXp} XP earned</Text>
          {heartsLost > 0 && (
            <Text style={styles.finishedHearts}>Lost {heartsLost} ❤️</Text>
          )}
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.back()}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.xpText}>⭐ {totalXp}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.exerciseContainer}>
        <ExerciseView
          exercise={exercise}
          state={state}
          selected={selected}
          textInput={textInput}
          onTextChange={setTextInput}
          onMultipleChoice={handleMultipleChoice}
          onTextSubmit={handleTextSubmit}
        />
      </ScrollView>

      {/* Feedback footer */}
      {state !== "answering" && (
        <View
          style={[
            styles.feedbackBar,
            state === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect,
          ]}
        >
          <View>
            <Text style={[styles.feedbackText, { color: state === "correct" ? "#166534" : "#991b1b" }]}>
              {state === "correct" ? "✓ Correct!" : "✗ Incorrect"}
            </Text>
            {state === "incorrect" && "answer" in exercise && (
              <Text style={styles.feedbackAnswer}>
                Answer: {(exercise as { answer: string }).answer}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={state === "correct" ? styles.btnPrimary : styles.btnDanger}
            onPress={handleNext}
          >
            <Text style={styles.btnText}>
              {currentIndex + 1 >= lesson.exercises.length ? "Finish" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function ExerciseView({
  exercise,
  state,
  selected,
  textInput,
  onTextChange,
  onMultipleChoice,
  onTextSubmit,
}: {
  exercise: Exercise;
  state: ExerciseState;
  selected: string | number | null;
  textInput: string;
  onTextChange: (v: string) => void;
  onMultipleChoice: (idx: number) => void;
  onTextSubmit: () => void;
}) {
  if (exercise.type === "multiple_choice") {
    return (
      <View>
        <Text style={styles.exerciseHint}>Choose the correct answer</Text>
        <Text style={styles.exercisePrompt}>{exercise.prompt}</Text>
        <View style={styles.optionsGrid}>
          {exercise.options.map((opt, idx) => {
            let s = styles.optionBtn;
            if (selected !== null) {
              if (idx === exercise.correct) s = { ...s, ...styles.optionCorrect };
              else if (idx === selected) s = { ...s, ...styles.optionIncorrect };
            }
            return (
              <TouchableOpacity
                key={idx}
                style={s}
                onPress={() => onMultipleChoice(idx)}
                disabled={state !== "answering"}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  if (exercise.type === "translate_to_english" || exercise.type === "translate_to_bangla") {
    const isToEng = exercise.type === "translate_to_english";
    return (
      <View>
        <Text style={styles.exerciseHint}>
          {isToEng ? "Translate to English" : "Translate to Bengali"}
        </Text>
        <Text style={styles.exercisePrompt}>
          {isToEng
            ? (exercise as { bangla: string }).bangla
            : (exercise as { english: string }).english}
        </Text>
        <Text style={styles.romanization}>
          {(exercise as { romanization: string }).romanization}
        </Text>
        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={onTextChange}
          placeholder="Type your answer..."
          editable={state === "answering"}
          onSubmitEditing={onTextSubmit}
          returnKeyType="done"
        />
        {state === "answering" && (
          <TouchableOpacity
            style={[styles.btnPrimary, !textInput.trim() && { opacity: 0.5 }]}
            onPress={onTextSubmit}
            disabled={!textInput.trim()}
          >
            <Text style={styles.btnText}>Check</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (exercise.type === "fill_blank") {
    const parts = exercise.sentence.split("___");
    return (
      <View>
        <Text style={styles.exerciseHint}>Fill in the blank</Text>
        <View style={styles.sentenceRow}>
          <Text style={styles.exercisePrompt}>{parts[0]}</Text>
          <Text style={[styles.blankBox, state === "correct" ? styles.blankCorrect : state === "incorrect" ? styles.blankIncorrect : {}]}>
            {selected ?? "___"}
          </Text>
          {parts[1] ? <Text style={styles.exercisePrompt}>{parts[1]}</Text> : null}
        </View>
        <View style={styles.optionsGrid}>
          {exercise.options.map((opt) => {
            let s = styles.optionBtn;
            if (selected !== null) {
              if (opt === exercise.blank) s = { ...s, ...styles.optionCorrect };
              else if (opt === selected) s = { ...s, ...styles.optionIncorrect };
            }
            return (
              <TouchableOpacity
                key={opt}
                style={s}
                disabled={state !== "answering"}
                onPress={() => {
                  // handled via parent
                }}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  if (exercise.type === "match_pairs") {
    return (
      <View>
        <Text style={styles.exerciseHint}>Match the pairs</Text>
        <Text style={styles.exercisePrompt}>Tap pairs to match Bengali with English</Text>
        <View style={styles.pairsGrid}>
          {exercise.pairs.map((pair, idx) => (
            <View key={idx} style={styles.pairRow}>
              <View style={styles.pairCard}>
                <Text style={styles.pairBangla}>{pair.bangla}</Text>
              </View>
              <Text style={styles.pairArrow}>→</Text>
              <View style={styles.pairCard}>
                <Text style={styles.pairEnglish}>{pair.english}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => {}}>
          <Text style={styles.btnText}>I've reviewed these</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  closeBtn: { fontSize: 18, color: "#9ca3af", padding: 4 },
  progressBar: { flex: 1, height: 10, backgroundColor: "#f3f4f6", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#58CC02", borderRadius: 5 },
  xpText: { fontSize: 14, fontWeight: "700", color: "#F59E0B" },
  exerciseContainer: { padding: 24, paddingBottom: 100 },
  exerciseHint: { fontSize: 12, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  exercisePrompt: { fontSize: 22, fontWeight: "800", color: "#1f2937", marginBottom: 8, lineHeight: 32 },
  romanization: { fontSize: 14, color: "#9ca3af", fontStyle: "italic", marginBottom: 20 },
  optionsGrid: { gap: 10, marginTop: 16 },
  optionBtn: {
    padding: 16, borderRadius: 16, borderWidth: 2, borderColor: "#e5e7eb",
    backgroundColor: "#fff", borderBottomWidth: 4, borderBottomColor: "#d1d5db",
  },
  optionCorrect: { backgroundColor: "#dcfce7", borderColor: "#4ade80", borderBottomColor: "#16a34a" },
  optionIncorrect: { backgroundColor: "#fee2e2", borderColor: "#f87171", borderBottomColor: "#dc2626" },
  optionText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  textInput: {
    borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 16, padding: 16,
    fontSize: 16, marginBottom: 16, marginTop: 8,
  },
  feedbackBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 20, borderTopWidth: 3,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  feedbackCorrect: { backgroundColor: "#f0fdf4", borderTopColor: "#4ade80" },
  feedbackIncorrect: { backgroundColor: "#fef2f2", borderTopColor: "#f87171" },
  feedbackText: { fontSize: 16, fontWeight: "800" },
  feedbackAnswer: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  btnPrimary: {
    backgroundColor: "#58CC02", paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 16, shadowColor: "#3d9900", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1,
  },
  btnDanger: {
    backgroundColor: "#FF4B4B", paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 16,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  finishedContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  finishedEmoji: { fontSize: 72, marginBottom: 16 },
  finishedTitle: { fontSize: 28, fontWeight: "800", color: "#1f2937", marginBottom: 8 },
  finishedSub: { fontSize: 18, color: "#F59E0B", fontWeight: "700", marginBottom: 4 },
  finishedHearts: { fontSize: 14, color: "#ef4444", marginBottom: 24 },
  sentenceRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 20 },
  blankBox: {
    paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 3, borderBottomColor: "#9ca3af",
    minWidth: 80, textAlign: "center", fontSize: 20, fontWeight: "700",
  },
  blankCorrect: { borderBottomColor: "#16a34a", color: "#166534", backgroundColor: "#dcfce7", borderRadius: 8 },
  blankIncorrect: { borderBottomColor: "#dc2626", color: "#991b1b", backgroundColor: "#fee2e2", borderRadius: 8 },
  pairsGrid: { gap: 12, marginVertical: 16 },
  pairRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pairCard: {
    flex: 1, backgroundColor: "#f9fafb", borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: "#e5e7eb",
  },
  pairBangla: { fontSize: 16, fontWeight: "700", color: "#1f2937", textAlign: "center" },
  pairArrow: { fontSize: 18, color: "#9ca3af" },
  pairEnglish: { fontSize: 14, fontWeight: "600", color: "#374151", textAlign: "center" },
});
