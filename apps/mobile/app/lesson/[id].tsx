import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Keyboard,
  SafeAreaView, ScrollView, Animated, Platform, Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getLesson } from "@bangla-learn/content";
import type {
  Dialect, Exercise, MatchPairsExercise,
  TranslateToEnglishExercise, TranslateToBanglaExercise, FillBlankExercise,
} from "@bangla-learn/types";
import {
  completeLesson, loseHeart, getStats, getDailyProgress,
  saveLessonResume, getLessonResume, clearLessonResume,
  recordLessonAttempt, addCoinsForShare,
} from "@/lib/storage";
import { pushProgressToFirestore } from "@/lib/sync";
import {
  trackLessonStart, trackLessonComplete, trackLessonAbandon,
} from "@/lib/analytics";
import * as Haptics from "expo-haptics";
import LetterTrace from "@/components/LetterTrace";
import GreetingScene from "@/components/GreetingScene";
import SpeakButton from "@/components/SpeakButton";
import { T } from "@/lib/theme";

const BD_GREEN = T.green;
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ── Icon map ──────────────────────────────────────────────────────────────────
const WORD_ICONS: Record<string, { icon: IoniconsName; bg: string; color: string }> = {
  greeting:  { icon: "hand-right-outline",   bg: "#e6f7ee", color: BD_GREEN   },
  goodbye:   { icon: "log-out-outline",       bg: "#e8eaf6", color: "#5c6bc0" },
  thankyou:  { icon: "heart-outline",         bg: "#fff3e0", color: "#DC2626" },
  morning:   { icon: "sunny-outline",         bg: "#fffde7", color: "#D97706" },
  howareyou: { icon: "help-circle-outline",   bg: "#e3f2fd", color: "#1976D2" },
  imfine:    { icon: "happy-outline",         bg: "#f1f8e9", color: "#388E3C" },
  self:      { icon: "person-outline",        bg: "#f3e5f5", color: "#7B1FA2" },
  you:       { icon: "person-circle-outline", bg: "#e8eaf6", color: "#5c6bc0" },
  good:      { icon: "thumbs-up-outline",     bg: "#e8f5e9", color: "#388E3C" },
  mother:    { icon: "woman-outline",         bg: "#fce4ec", color: "#C2185B" },
  father:    { icon: "man-outline",           bg: "#e3f2fd", color: "#1976D2" },
  brother:   { icon: "people-outline",        bg: "#fff3e0", color: "#E65100" },
  sister:    { icon: "people-outline",        bg: "#fce4ec", color: "#C2185B" },
  rickshaw:  { icon: "bicycle-outline",       bg: "#e6f7ee", color: BD_GREEN  },
  fish:      { icon: "fish-outline",          bg: "#e3f2fd", color: "#1976D2" },
  tiger:     { icon: "flash-outline",         bg: "#fff3e0", color: "#E65100" },
  rice:      { icon: "restaurant-outline",    bg: "#e8f5e9", color: "#388E3C" },
  boat:      { icon: "boat-outline",          bg: "#e3f2fd", color: "#1976D2" },
  lotus:     { icon: "leaf-outline",          bg: "#fce4ec", color: "#C2185B" },
  cow:       { icon: "leaf-outline",          bg: "#fffde7", color: "#D97706" },
  banana:    { icon: "nutrition-outline",     bg: "#fffde7", color: "#D97706" },
};

const GREETING_KEYS = new Set(["greeting","goodbye","morning","howareyou","imfine","thankyou"]);
const SCENE_MEANINGS: Record<string, string> = {
  greeting:"Hello!", goodbye:"Goodbye!", thankyou:"Thank you!",
  morning:"Good morning!", howareyou:"How are you?", imfine:"I'm fine!",
};
const SCENE_TYPES: Record<string, "greeting"|"farewell"|"question"|"response"> = {
  greeting:"greeting", goodbye:"farewell", thankyou:"response",
  morning:"greeting",  howareyou:"question", imfine:"response",
};

// ── Flash-card type ───────────────────────────────────────────────────────────
type FlashCard = { bangla: string; romanization: string; english: string; imageKey?: string };

function extractFlashCards(exercises: Exercise[]): FlashCard[] {
  const seen  = new Set<string>();
  const cards: FlashCard[] = [];
  for (const ex of exercises) {
    if (ex.type === "letter_trace") continue;
    if (ex.type === "multiple_choice" && ex.promptBangla) {
      if (!seen.has(ex.promptBangla)) {
        seen.add(ex.promptBangla);
        cards.push({ bangla: ex.promptBangla, romanization: ex.romanization ?? "", english: ex.options[ex.correct], imageKey: ex.imageKey });
      }
    } else if (ex.type === "match_pairs") {
      for (const p of ex.pairs) {
        if (!seen.has(p.bangla)) {
          seen.add(p.bangla);
          cards.push({ bangla: p.bangla, romanization: p.romanization, english: p.english });
        }
      }
    } else if (ex.type === "translate_to_english") {
      if (!seen.has(ex.bangla)) {
        seen.add(ex.bangla);
        cards.push({ bangla: ex.bangla, romanization: ex.romanization, english: ex.answer });
      }
    } else if (ex.type === "translate_to_bangla") {
      if (!seen.has(ex.answer)) {
        seen.add(ex.answer);
        cards.push({ bangla: ex.answer, romanization: ex.romanization, english: ex.english });
      }
    } else if (ex.type === "fill_blank") {
      if (!seen.has(ex.blank)) {
        seen.add(ex.blank);
        cards.push({ bangla: ex.blank, romanization: ex.romanization, english: ex.sentence.replace("___", `[${ex.blank}]`) });
      }
    }
  }
  return cards;
}

// ── Helper: get correct answer text for feedback ──────────────────────────────
function correctAnswerText(exercise: Exercise): string | null {
  if (exercise.type === "multiple_choice")     return exercise.options[exercise.correct];
  if (exercise.type === "translate_to_english") return exercise.answer;
  if (exercise.type === "translate_to_bangla")  return exercise.answer;
  if (exercise.type === "fill_blank")           return exercise.blank;
  return null;
}

// ── Flip card ─────────────────────────────────────────────────────────────────
function FlipCard({ card, onFlipped, unitColor }: {
  card: FlashCard; onFlipped: () => void; unitColor: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const scaleX = useRef(new Animated.Value(1)).current;

  function flip() {
    const wasFlipped = flipped;
    Animated.sequence([
      Animated.timing(scaleX, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(scaleX, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      setFlipped((f) => !f);
      if (!wasFlipped) onFlipped();
    }, 140);
  }

  const pic = card.imageKey ? WORD_ICONS[card.imageKey] : null;

  return (
    <TouchableOpacity onPress={flip} activeOpacity={0.92}>
      <Animated.View style={[styles.flipCard, { borderColor: unitColor, transform: [{ scaleX }] }]}>
        {!flipped ? (
          <View style={styles.flipFace}>
            {pic && (
              <View style={[styles.flipIcon, { backgroundColor: pic.bg }]}>
                <Ionicons name={pic.icon} size={42} color={pic.color} />
              </View>
            )}
            <Text style={[styles.flipEnglish, { color: "#1f2937" }]}>{card.english}</Text>
            <View style={styles.flipHint}>
              <Ionicons name="sync-outline" size={14} color="#9ca3af" />
              <Text style={styles.flipHintText}>Tap to see in Bengali</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.flipFace, { backgroundColor: unitColor + "0d" }]}>
            <Text style={[styles.flipBangla, { color: unitColor }]}>{card.bangla}</Text>
            <Text style={[styles.flipRoman, { color: unitColor + "cc" }]}>/{card.romanization}/</Text>
            <Text style={styles.flipBanglaSmall}>{card.english}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 10 }}>
              <SpeakButton text={card.bangla} size={24} color={unitColor} />
              <View style={styles.flipHint}>
                <Ionicons name="sync-outline" size={14} color="#9ca3af" />
                <Text style={styles.flipHintText}>Tap to flip back</Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Study phase ───────────────────────────────────────────────────────────────
function StudyPhase({ cards, unitColor, lessonTitle, onStart }: {
  cards: FlashCard[]; unitColor: string; lessonTitle: string; onStart: () => void;
}) {
  const router = useRouter();
  const [idx, setIdx]   = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const slideAnim = useRef(new Animated.Value(0)).current;
  const allSeen = seen.size >= cards.length;

  function navigate(dir: 1 | -1) {
    const next = idx + dir;
    if (next < 0 || next >= cards.length) return;
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: dir * -30, duration: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    setIdx(next);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.studyHeader, { backgroundColor: unitColor }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top:8,bottom:8,left:8,right:8 }}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <View style={styles.studyHeaderLeft}>
          <Ionicons name="albums-outline" size={18} color="#fff" />
          <Text style={styles.studyHeaderLabel}>STUDY</Text>
        </View>
        <Text style={styles.studyHeaderTitle} numberOfLines={1}>{lessonTitle}</Text>
        <Text style={styles.studyHeaderCount}>{idx + 1}/{cards.length}</Text>
      </View>

      <View style={styles.studyDots}>
        {cards.map((_, i) => (
          <View key={i} style={[
            styles.studyDot,
            i === idx && { backgroundColor: unitColor, width: 18 },
            seen.has(i) && i !== idx && { backgroundColor: unitColor + "60" },
          ]} />
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.studyScroll}>
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <FlipCard key={idx} card={cards[idx]} unitColor={unitColor}
            onFlipped={() => setSeen((s) => new Set([...s, idx]))} />
        </Animated.View>

        {!seen.has(idx) && (
          <Text style={styles.studyTip}>Tap the card to see it in Bengali</Text>
        )}

        <View style={styles.studyNav}>
          <TouchableOpacity onPress={() => navigate(-1)} disabled={idx === 0}
            style={[styles.navBtn, idx === 0 && styles.navBtnDisabled]}>
            <Ionicons name="arrow-back" size={20} color={idx === 0 ? "#d1d5db" : "#374151"} />
          </TouchableOpacity>
          <Text style={styles.navLabel}>{idx + 1} of {cards.length}</Text>
          <TouchableOpacity onPress={() => navigate(1)} disabled={idx === cards.length - 1}
            style={[styles.navBtn, idx === cards.length - 1 && styles.navBtnDisabled]}>
            <Ionicons name="arrow-forward" size={20} color={idx === cards.length - 1 ? "#d1d5db" : "#374151"} />
          </TouchableOpacity>
        </View>

        {allSeen ? (
          <TouchableOpacity style={[styles.startQuizBtn, { backgroundColor: unitColor }]} onPress={onStart} activeOpacity={0.85}>
            <Ionicons name="ribbon-outline" size={18} color="#fff" />
            <Text style={styles.startQuizText}>Start Quiz!</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.startQuizDisabled}>
            <Ionicons name="lock-closed-outline" size={15} color="#9ca3af" />
            <Text style={styles.startQuizDisabledText}>
              Review all {cards.length} cards to unlock the quiz
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Match pairs ───────────────────────────────────────────────────────────────
function MatchPairsGame({ exercise, onComplete, hideRomanization }: {
  exercise: MatchPairsExercise; onComplete: () => void; hideRomanization: boolean;
}) {
  const [selBangla,  setSelBangla]  = useState<string | null>(null);
  const [selEnglish, setSelEnglish] = useState<string | null>(null);
  const [matched,    setMatched]    = useState<Set<string>>(new Set());
  const [shake,      setShake]      = useState(false);
  const [shuffledEnglish] = useState(() => [...exercise.pairs].sort(() => Math.random() - 0.5));

  const isMatchedBangla  = (b: string) => matched.has(b);
  const isMatchedEnglish = (e: string) => exercise.pairs.some((p) => matched.has(p.bangla) && p.english === e);

  function tapBangla(b: string) {
    if (isMatchedBangla(b)) return;
    const sel = selBangla === b ? null : b;
    setSelBangla(sel);
    if (sel && selEnglish) attempt(sel, selEnglish);
  }
  function tapEnglish(e: string) {
    if (isMatchedEnglish(e)) return;
    const sel = selEnglish === e ? null : e;
    setSelEnglish(sel);
    if (selBangla && sel) attempt(selBangla, sel);
  }
  function attempt(b: string, e: string) {
    const pair = exercise.pairs.find((p) => p.bangla === b);
    if (pair?.english === e) {
      const next = new Set(matched); next.add(b);
      setMatched(next); setSelBangla(null); setSelEnglish(null);
      if (next.size === exercise.pairs.length) setTimeout(onComplete, 400);
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setSelBangla(null); setSelEnglish(null); }, 500);
    }
  }

  return (
    <View>
      <Text style={styles.exerciseHint}>Match the pairs</Text>
      <Text style={styles.matchSubtitle}>Tap a Bengali word, then its English meaning</Text>
      <View style={styles.matchProgressRow}>
        <Ionicons name="checkmark-circle" size={16} color={BD_GREEN} />
        <Text style={styles.matchProgress}>{matched.size} / {exercise.pairs.length} matched</Text>
      </View>
      <View style={styles.matchGrid}>
        <View style={styles.matchCol}>
          {exercise.pairs.map((p) => {
            const done  = isMatchedBangla(p.bangla);
            const sel   = selBangla === p.bangla;
            const wrong = shake && sel;
            return (
              <TouchableOpacity key={p.bangla} onPress={() => tapBangla(p.bangla)} disabled={done}
                style={[styles.matchTile, done&&styles.matchTileDone, sel&&styles.matchTileSel, wrong&&styles.matchTileWrong]}>
                <Text style={[styles.matchBangla, done&&{color:"#16a34a"}, sel&&{color:"#fff"}]}>{p.bangla}</Text>
                {!hideRomanization && (
                  <Text style={[styles.matchRoman, done&&{color:"#16a34a"}, sel&&{color:"rgba(255,255,255,0.8)"}]}>{p.romanization}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.matchCol}>
          {shuffledEnglish.map((p) => {
            const done  = isMatchedEnglish(p.english);
            const sel   = selEnglish === p.english;
            const wrong = shake && sel;
            return (
              <TouchableOpacity key={p.english} onPress={() => tapEnglish(p.english)} disabled={done}
                style={[styles.matchTile, done&&styles.matchTileDone, sel&&styles.matchTileSel, wrong&&styles.matchTileWrong]}>
                <Text style={[styles.matchEnglish, done&&{color:"#16a34a"}, sel&&{color:"#fff"}]}>{p.english}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ── Illustration card ─────────────────────────────────────────────────────────
function IllustrationCard({ imageKey, promptBangla, romanization, question, hideRomanization }: {
  imageKey: string; promptBangla?: string; romanization?: string;
  question: string; hideRomanization: boolean;
}) {
  const scale   = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [imageKey]);

  const pic = WORD_ICONS[imageKey] ?? { icon: "help-circle-outline" as IoniconsName, bg: "#f3f4f6", color: "#9ca3af" };

  if (GREETING_KEYS.has(imageKey)) {
    return (
      <View>
        <GreetingScene
          word={promptBangla ?? imageKey}
          romanization={hideRomanization ? "" : (romanization ?? "")}
          meaning={SCENE_MEANINGS[imageKey] ?? ""}
          sceneType={SCENE_TYPES[imageKey] ?? "greeting"}
        />
        <Text style={styles.questionText}>{question}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.illustrationCard, { opacity, transform: [{ scale }] }]}>
      <View style={[styles.illustrationRing, { backgroundColor: pic.bg }]}>
        <Ionicons name={pic.icon} size={76} color={pic.color} />
      </View>
      {promptBangla && <Text style={styles.banglaWord}>{promptBangla}</Text>}
      {!hideRomanization && romanization && <Text style={styles.romanization}>({romanization})</Text>}
      <Text style={styles.questionText}>{question}</Text>
    </Animated.View>
  );
}

// ── Translate-to-English exercise ─────────────────────────────────────────────
function TranslateToEnglishView({ exercise, state, onAnswer, hideRomanization }: {
  exercise: TranslateToEnglishExercise; state: ExerciseState;
  onAnswer: (correct: boolean) => void; hideRomanization: boolean;
}) {
  const [input, setInput] = useState("");

  function check() {
    if (!input.trim()) return;
    const user = input.trim().toLowerCase();
    const ans  = exercise.answer.trim().toLowerCase();
    // Accept exact match or if user answer matches any "/" separated variant
    const variants = ans.split("/").map((v) => v.trim());
    const correct  = variants.some((v) => v === user || v.includes(user) || user.includes(v));
    onAnswer(correct);
    Keyboard.dismiss();
  }

  return (
    <View>
      <Text style={styles.exerciseHint}>What does this mean in English?</Text>
      <View style={styles.promptCard}>
        <Text style={styles.banglaWord}>{exercise.bangla}</Text>
        {!hideRomanization && (
          <Text style={styles.romanization}>/{exercise.romanization}/</Text>
        )}
      </View>
      <TextInput
        value={input}
        onChangeText={setInput}
        onSubmitEditing={check}
        placeholder="Type the English meaning…"
        placeholderTextColor="#9ca3af"
        style={[styles.translateInput, state !== "answering" && styles.translateInputDone]}
        editable={state === "answering"}
        returnKeyType="done"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {state === "answering" ? (
        <TouchableOpacity
          style={[styles.checkBtn, !input.trim() && { opacity: 0.4 }]}
          onPress={check} disabled={!input.trim()} activeOpacity={0.8}
        >
          <Text style={styles.checkBtnText}>Check Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.answerReveal, {
          backgroundColor: state === "correct" ? "#dcfce7" : "#fff7ed",
          borderColor:     state === "correct" ? "#4ade80" : "#fb923c",
        }]}>
          <Text style={styles.answerRevealLabel}>Correct answer</Text>
          <Text style={[styles.answerRevealText, { color: state === "correct" ? "#15803d" : "#c2410c" }]}>
            {exercise.answer}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Translate-to-Bangla exercise ──────────────────────────────────────────────
function TranslateToBanglaView({ exercise, state, onAnswer }: {
  exercise: TranslateToBanglaExercise; state: ExerciseState;
  onAnswer: (correct: boolean) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View>
      <Text style={styles.exerciseHint}>How do you say this in Bengali?</Text>
      <View style={styles.promptCard}>
        <Text style={[styles.banglaWord, { fontSize: 32, color: "#1f2937" }]}>{exercise.english}</Text>
        <Text style={styles.questionText}>Translate to Bengali script</Text>
      </View>

      {!revealed ? (
        <View style={{ gap: 10, marginTop: 16 }}>
          <TouchableOpacity
            style={[styles.selfAssessYes, state !== "answering" && { opacity: 0.4 }]}
            onPress={() => { setRevealed(true); onAnswer(true); }}
            disabled={state !== "answering"} activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.selfAssessYesText}>I know it!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.revealBtn, state !== "answering" && { opacity: 0.4 }]}
            onPress={() => { setRevealed(true); onAnswer(false); }}
            disabled={state !== "answering"} activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={18} color="#7c3aed" />
            <Text style={styles.revealBtnText}>Show me the answer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.banglaReveal}>
          <Text style={styles.banglaRevealText}>{exercise.answer}</Text>
          <Text style={styles.banglaRevealRoman}>/{exercise.romanization}/</Text>
        </View>
      )}
    </View>
  );
}

// ── Fill-blank exercise ───────────────────────────────────────────────────────
function FillBlankView({ exercise, state, onAnswer }: {
  exercise: FillBlankExercise; state: ExerciseState;
  onAnswer: (correct: boolean) => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const parts = exercise.sentence.split("___");
  const selectedText = selectedIdx !== null ? exercise.options[selectedIdx] : null;

  function handleSelect(i: number) {
    if (state !== "answering") return;
    setSelectedIdx(i);
    onAnswer(exercise.options[i] === exercise.blank);
  }

  const fillColor = selectedText
    ? (state === "correct" ? "#16a34a" : state === "incorrect" ? "#dc2626" : "#1d4ed8")
    : "#9ca3af";

  return (
    <View>
      <Text style={styles.exerciseHint}>Fill in the blank</Text>
      <View style={styles.sentenceCard}>
        <Text style={styles.sentenceText}>
          {parts[0]}
          <Text style={[styles.blankFill, { color: fillColor, borderBottomColor: fillColor }]}>
            {selectedText ?? "______"}
          </Text>
          {parts[1] ?? ""}
        </Text>
        <Text style={styles.fillRoman}>/{exercise.romanization}/</Text>
      </View>
      <View style={styles.optionsGrid}>
        {exercise.options.map((opt, i) => {
          const isCorrect  = opt === exercise.blank;
          const isSel      = selectedIdx === i;
          const showResult = selectedIdx !== null;
          return (
            <TouchableOpacity key={i}
              style={[styles.optionBtn,
                showResult && isCorrect && styles.optionCorrect,
                showResult && isSel && !isCorrect && styles.optionIncorrect]}
              onPress={() => handleSelect(i)} disabled={state !== "answering"} activeOpacity={0.75}
            >
              <Text style={[styles.optionText,
                showResult && isCorrect && { color: "#166534", fontWeight: "800" },
                showResult && isSel && !isCorrect && { color: "#991b1b" }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Exercise renderer ─────────────────────────────────────────────────────────
type ExerciseState = "answering" | "correct" | "incorrect";

function ExerciseView({ exercise, state, selected, hideRomanization, onMC, onMatchDone, onTraceDone, onTranslateAnswer }: {
  exercise: Exercise; state: ExerciseState; selected: number | null;
  hideRomanization: boolean;
  onMC: (idx: number) => void;
  onMatchDone: () => void;
  onTraceDone: () => void;
  onTranslateAnswer: (correct: boolean) => void;
}) {
  if (exercise.type === "letter_trace") {
    return <LetterTrace key={exercise.character} exercise={exercise} onComplete={onTraceDone} />;
  }

  if (exercise.type === "multiple_choice") {
    return (
      <View>
        <Text style={styles.exerciseHint}>Choose the correct answer</Text>
        {exercise.imageKey ? (
          <IllustrationCard
            imageKey={exercise.imageKey}
            promptBangla={exercise.promptBangla}
            romanization={exercise.romanization}
            question={exercise.prompt}
            hideRomanization={hideRomanization}
          />
        ) : (
          <View style={styles.promptCard}>
            {exercise.promptBangla && <Text style={styles.banglaWord}>{exercise.promptBangla}</Text>}
            {!hideRomanization && exercise.romanization && (
              <Text style={styles.romanization}>({exercise.romanization})</Text>
            )}
            <Text style={styles.exercisePrompt}>{exercise.prompt}</Text>
          </View>
        )}
        <View style={styles.optionsGrid}>
          {exercise.options.map((opt, i) => {
            const showResult = selected !== null;
            const isCorrect  = i === exercise.correct;
            const isSel      = i === selected;
            return (
              <TouchableOpacity key={i}
                style={[styles.optionBtn,
                  showResult && isCorrect && styles.optionCorrect,
                  showResult && isSel && !isCorrect && styles.optionIncorrect]}
                onPress={() => onMC(i)} disabled={state !== "answering"} activeOpacity={0.75}
              >
                <Text style={[styles.optionText,
                  showResult && isCorrect && { color: "#166534", fontWeight: "800" },
                  showResult && isSel && !isCorrect && { color: "#991b1b" }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  if (exercise.type === "match_pairs") {
    return <MatchPairsGame exercise={exercise} onComplete={onMatchDone} hideRomanization={hideRomanization} />;
  }

  if (exercise.type === "translate_to_english") {
    return <TranslateToEnglishView exercise={exercise} state={state} onAnswer={onTranslateAnswer} hideRomanization={hideRomanization} />;
  }

  if (exercise.type === "translate_to_bangla") {
    return <TranslateToBanglaView exercise={exercise} state={state} onAnswer={onTranslateAnswer} />;
  }

  if (exercise.type === "fill_blank") {
    return <FillBlankView exercise={exercise} state={state} onAnswer={onTranslateAnswer} />;
  }

  return null;
}

// ── Main lesson screen ────────────────────────────────────────────────────────
export default function LessonScreen() {
  const { id, dialect } = useLocalSearchParams<{ id: string; dialect: string }>();
  const router = useRouter();

  const lesson = getLesson((dialect ?? "standard") as Dialect, id);
  const flashCards = useMemo(() => (lesson ? extractFlashCards(lesson.exercises) : []), [lesson]);

  const [phase, setPhase] = useState<"study" | "quiz">(() => {
    if (!lesson || lesson.isTrace || flashCards.length === 0) return "quiz";
    return "study";
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [exState, setExState]           = useState<ExerciseState>("answering");
  const [totalXp, setTotalXp]           = useState(0);
  const [heartsLost, setHeartsLost]     = useState(0);
  const [startingHearts, setStartingHearts] = useState(5);
  const [gameOver, setGameOver]         = useState(false);
  const [correct, setCorrect]           = useState(0);
  const [finished, setFinished]         = useState(false);
  const [dailyInfo, setDailyInfo]       = useState<{ xpToday: number; goal: number; done: boolean } | null>(null);
  const [resumeBanner, setResumeBanner] = useState(false);
  const trophyScale = useRef(new Animated.Value(0)).current;
  const [selected, setSelected]         = useState<number | null>(null);

  const slideAnim      = useRef(new Animated.Value(30)).current;
  const fadeAnim       = useRef(new Animated.Value(0)).current;
  const lessonStartRef = useRef<number | null>(null);

  // Load starting hearts + check for saved resume state on mount
  useEffect(() => {
    getStats().then((s) => setStartingHearts(s.hearts));
    if (!lesson || phase !== "quiz") return;
    getLessonResume(lesson.id).then((saved) => {
      if (saved && saved.exerciseIndex > 0 && saved.exerciseIndex < lesson.exercises.length) {
        setResumeBanner(true);
      }
    });
  }, []);

  // Save progress on every exercise change
  useEffect(() => {
    if (!lesson || phase !== "quiz" || finished) return;
    saveLessonResume({
      lessonId: lesson.id,
      dialect: (dialect ?? "standard") as Dialect,
      exerciseIndex: currentIndex,
      xpSoFar: totalXp,
      savedAt: Date.now(),
    }).catch(() => {});
  }, [currentIndex, phase]);

  useEffect(() => {
    if (phase !== "quiz") return;
    // Track lesson start once (when quiz phase first activates)
    if (lessonStartRef.current === null && lesson) {
      lessonStartRef.current = Date.now();
      trackLessonStart(lesson.id, (dialect ?? "standard") as Dialect);
    }
    slideAnim.setValue(30); fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
    ]).start();
  }, [currentIndex, phase]);

  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Lesson not found</Text>
      </SafeAreaView>
    );
  }

  if (phase === "study") {
    return (
      <StudyPhase
        cards={flashCards}
        unitColor={BD_GREEN}
        lessonTitle={lesson.title}
        onStart={() => setPhase("quiz")}
      />
    );
  }

  const hideRomanization = !!lesson.isQuiz;
  const exercise = lesson.exercises[currentIndex];
  const progress = ((currentIndex + (exState !== "answering" ? 1 : 0)) / lesson.exercises.length) * 100;

  async function handleAnswer(isCorrect: boolean) {
    setExState(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setTotalXp((p) => p + exercise.xp);
      setCorrect((p) => p + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      const newLost = heartsLost + 1;
      setHeartsLost(newLost);
      await loseHeart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      if (newLost >= startingHearts) {
        trackLessonAbandon(lesson!.id, (dialect ?? "standard") as Dialect, progress);
        setGameOver(true);
      }
    }
  }

  async function finishLesson(finalXp: number, finalCorrect: number) {
    await completeLesson((dialect ?? "standard") as Dialect, lesson!.id, finalXp, finalCorrect, lesson!.exercises.length);
    await clearLessonResume(lesson!.id);
    await recordLessonAttempt({
      lessonId:    lesson!.id,
      lessonTitle: lesson!.title,
      dialect:     (dialect ?? "standard") as Dialect,
      date:        Date.now(),
      xpEarned:    finalXp,
      correct:     finalCorrect,
      total:       lesson!.exercises.length,
      isQuiz:      !!lesson!.isQuiz,
    });
    pushProgressToFirestore().catch(() => {});
    getDailyProgress().then(setDailyInfo).catch(() => {});
    const durationSec = lessonStartRef.current
      ? Math.round((Date.now() - lessonStartRef.current) / 1000)
      : 0;
    const score = lesson!.exercises.length > 0
      ? Math.round((finalCorrect / lesson!.exercises.length) * 100)
      : 100;
    trackLessonComplete(
      lesson!.id,
      (dialect ?? "standard") as Dialect,
      finalXp,
      score,
      durationSec
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setFinished(true);
    Animated.spring(trophyScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }

  async function handleNext() {
    setExState("answering"); setSelected(null);
    if (currentIndex + 1 >= lesson!.exercises.length) {
      const finalXp = totalXp + (exState === "correct" ? exercise.xp : 0);
      const finalCorrect = correct + (exState === "correct" ? 1 : 0);
      await finishLesson(finalXp, finalCorrect);
    } else {
      setCurrentIndex((p) => p + 1);
    }
  }

  async function handleTraceDone() {
    const newXp = totalXp + exercise.xp;
    const newCorrect = correct + 1;
    setTotalXp(newXp);
    setCorrect(newCorrect);
    if (currentIndex + 1 >= lesson!.exercises.length) {
      await finishLesson(newXp, newCorrect);
    } else {
      setCurrentIndex((p) => p + 1);
    }
  }

  // Finished screen
  if (finished) {
    const dailyPct = dailyInfo ? Math.min(100, (dailyInfo.xpToday / dailyInfo.goal) * 100) : 0;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishedContainer}>
          <Animated.View style={{ transform: [{ scale: trophyScale }] }}>
            <Ionicons name="trophy" size={88} color="#D97706" />
          </Animated.View>
          <Text style={styles.finishedTitle}>
            {lesson.isTrace ? "Letters Mastered!" : lesson.isQuiz ? "Quiz Complete!" : "Lesson Complete!"}
          </Text>
          <View style={styles.finishedXpBadge}>
            <Text style={styles.finishedXpText}>+{totalXp} XP</Text>
          </View>

          {/* Score */}
          <View style={styles.finishedScoreRow}>
            <View style={styles.finishedScorePill}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.finishedScoreText}>{correct} correct</Text>
            </View>
            {heartsLost > 0 && (
              <View style={[styles.finishedScorePill, { backgroundColor: "#fef2f2" }]}>
                <Ionicons name="heart" size={16} color="#ef4444" />
                <Text style={[styles.finishedScoreText, { color: "#ef4444" }]}>{heartsLost} missed</Text>
              </View>
            )}
            <View style={[styles.finishedScorePill, { backgroundColor: "#f0f9ff" }]}>
              <Ionicons name="stats-chart" size={14} color="#0284c7" />
              <Text style={[styles.finishedScoreText, { color: "#0284c7" }]}>
                {lesson.exercises.length > 0 ? Math.round((correct / lesson.exercises.length) * 100) : 100}%
              </Text>
            </View>
          </View>

          {/* Daily goal progress */}
          {dailyInfo && (
            <View style={styles.finishedDailyCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons
                    name={dailyInfo.done ? "trophy" : "flag-outline"}
                    size={16}
                    color={dailyInfo.done ? "#16a34a" : "#f59e0b"}
                  />
                  <Text style={styles.finishedDailyLabel}>
                    {dailyInfo.done ? "Daily goal complete!" : "Daily goal progress"}
                  </Text>
                </View>
                <Text style={styles.finishedDailyPct}>{dailyInfo.xpToday}/{dailyInfo.goal} XP</Text>
              </View>
              <View style={styles.finishedDailyBg}>
                <View style={[styles.finishedDailyFill, {
                  width: `${dailyPct}%` as any,
                  backgroundColor: dailyInfo.done ? "#16a34a" : "#f59e0b",
                }]} />
              </View>
            </View>
          )}

          {lesson.isQuiz && (
            <View style={styles.quizBadge}>
              <Ionicons name="ribbon-outline" size={18} color="#7c3aed" />
              <Text style={styles.quizBadgeText}>Unit Quiz Passed!</Text>
            </View>
          )}
          {heartsLost > 0 && (
            <View style={styles.heartsRow}>
              <Ionicons name="heart" size={16} color="#ef4444" />
              <Text style={styles.heartsText}>{heartsLost} heart{heartsLost > 1 ? "s" : ""} lost</Text>
            </View>
          )}

          {/* Share & Earn coins */}
          <TouchableOpacity
            style={styles.shareBtn}
            activeOpacity={0.8}
            onPress={async () => {
              const accuracy = lesson.exercises.length > 0
                ? Math.round((correct / lesson.exercises.length) * 100)
                : 100;
              const msg = lesson.isQuiz
                ? `🏆 Quiz passed! I scored ${accuracy}% on "${lesson.title}" in BanglaLearn. Shekho Bengali with me!`
                : `📚 Just completed "${lesson.title}" in BanglaLearn — earned +${totalXp} XP with ${accuracy}% accuracy! #BanglaLearn`;
              try {
                await Share.share({ message: msg });
                await addCoinsForShare("report_card");
              } catch {}
            }}
          >
            <Ionicons name="share-social-outline" size={16} color="#b45309" />
            <Text style={styles.shareBtnText}>Share result · earn 3 coins</Text>
          </TouchableOpacity>

          <View style={styles.finishedBtns}>
            <TouchableOpacity
              style={[styles.btnOutline, { flex: 1 }]}
              onPress={() => router.replace("/(tabs)" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="map-outline" size={16} color={BD_GREEN} />
              <Text style={styles.btnOutlineText}>Back to Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { flex: 1 }]}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Game-over: no hearts left
  if (gameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={{ fontSize: 64, marginBottom: 8 }}>💔</Text>
          <Text style={[styles.finishedTitle, { color: "#dc2626" }]}>Out of Hearts!</Text>
          <Text style={{ color: "#6b7280", textAlign: "center", marginTop: 8, marginBottom: 28, lineHeight: 22 }}>
            You ran out of hearts before finishing the lesson.{"\n"}
            Hearts refill over time — try again soon!
          </Text>

          {/* Remaining hearts indicator */}
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 28 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons key={i} name="heart" size={26} color="#e5e7eb" />
            ))}
          </View>

          <View style={styles.finishedBtns}>
            <TouchableOpacity
              style={[styles.btnOutline, { flex: 1 }]}
              onPress={() => router.replace("/(tabs)" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="map-outline" size={16} color={BD_GREEN} />
              <Text style={styles.btnOutlineText}>Back to Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { flex: 1 }]}
              onPress={() => {
                setGameOver(false);
                setHeartsLost(0);
                setCurrentIndex(0);
                setExState("answering");
                setSelected(null);
                setTotalXp(0);
                setCorrect(0);
                getStats().then((s) => setStartingHearts(s.hearts));
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.btnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isMatchPairs = exercise.type === "match_pairs";
  const isTranslate  = exercise.type === "translate_to_bangla";
  const answerText   = exState === "incorrect" ? correctAnswerText(exercise) : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            trackLessonAbandon(lesson.id, (dialect ?? "standard") as Dialect, progress);
            router.back();
          }}
          hitSlop={{ top:8,bottom:8,left:8,right:8 }}
        >
          <Ionicons name="close" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>
        {/* Hearts bar */}
        <View style={styles.heartsBar}>
          {Array.from({ length: startingHearts }).map((_, i) => (
            <Ionicons
              key={i}
              name="heart"
              size={16}
              color={i < startingHearts - heartsLost ? "#ef4444" : "#e5e7eb"}
            />
          ))}
        </View>
        {lesson.isQuiz && (
          <View style={styles.ribbonBadge}>
            <Ionicons name="ribbon-outline" size={14} color="#7c3aed" />
          </View>
        )}
      </View>

      {/* Resume banner */}
      {resumeBanner && (
        <View style={styles.resumeBanner}>
          <Ionicons name="bookmark" size={16} color="#0284c7" />
          <Text style={styles.resumeBannerText}>Resuming where you left off</Text>
          <TouchableOpacity
            onPress={async () => {
              const saved = await getLessonResume(lesson.id);
              if (saved) {
                setCurrentIndex(saved.exerciseIndex);
                setTotalXp(saved.xpSoFar);
              }
              setResumeBanner(false);
            }}
            style={styles.resumeBtn}
          >
            <Text style={styles.resumeBtnText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setResumeBanner(false)} style={{ paddingHorizontal: 4 }}>
            <Ionicons name="close" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      )}

      {hideRomanization && (
        <View style={styles.quizBanner}>
          <Ionicons name="eye-off-outline" size={15} color="#7c3aed" />
          <Text style={styles.quizBannerText}>Quiz mode — no transliteration!</Text>
        </View>
      )}

      {exercise.type === "letter_trace" ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.counterRow}>
            {lesson.exercises.map((_, i) => (
              <View key={i} style={[styles.counterDot,
                i === currentIndex && styles.counterDotActive,
                i < currentIndex  && styles.counterDotDone]} />
            ))}
          </View>
          <ExerciseView
            exercise={exercise} state={exState} selected={selected}
            hideRomanization={hideRomanization}
            onMC={(idx) => { if (exState !== "answering") return; setSelected(idx); handleAnswer(idx === (exercise as any).correct); }}
            onMatchDone={() => handleAnswer(true)}
            onTraceDone={handleTraceDone}
            onTranslateAnswer={handleAnswer}
          />
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.exerciseContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.counterRow}>
              {lesson.exercises.map((_, i) => (
                <View key={i} style={[styles.counterDot,
                  i === currentIndex && styles.counterDotActive,
                  i < currentIndex  && styles.counterDotDone]} />
              ))}
            </View>
            <ExerciseView
              exercise={exercise} state={exState} selected={selected}
              hideRomanization={hideRomanization}
              onMC={(idx) => { if (exState !== "answering") return; setSelected(idx); handleAnswer(idx === (exercise as any).correct); }}
              onMatchDone={() => handleAnswer(true)}
              onTraceDone={handleTraceDone}
              onTranslateAnswer={handleAnswer}
            />
          </Animated.View>
        </ScrollView>
      )}

      {/* Feedback footer */}
      {exState !== "answering" && exercise.type !== "letter_trace" && !isTranslate && (
        <View style={[styles.feedbackBar,
          exState === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <View style={styles.feedbackLeft}>
            <Ionicons
              name={exState === "correct" ? "checkmark-circle" : "close-circle"}
              size={24} color={exState === "correct" ? "#16a34a" : "#dc2626"} />
            <View>
              <Text style={[styles.feedbackTitle, { color: exState === "correct" ? "#166534" : "#991b1b" }]}>
                {exState === "correct" ? (isMatchPairs ? "All matched!" : "Correct!") : "Not quite"}
              </Text>
              {exState === "correct" && <Text style={styles.feedbackXp}>+{exercise.xp} XP</Text>}
              {answerText && <Text style={styles.feedbackAnswer}>Answer: {answerText}</Text>}
            </View>
          </View>
          <TouchableOpacity
            style={exState === "correct" ? styles.btnPrimary : styles.btnDanger}
            onPress={handleNext} activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {currentIndex + 1 >= lesson.exercises.length ? "Finish!" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feedback footer for translate_to_bangla (shown after reveal) */}
      {exState !== "answering" && isTranslate && (
        <View style={[styles.feedbackBar,
          exState === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <View style={styles.feedbackLeft}>
            <Ionicons
              name={exState === "correct" ? "checkmark-circle" : "close-circle"}
              size={24} color={exState === "correct" ? "#16a34a" : "#dc2626"} />
            <View>
              <Text style={[styles.feedbackTitle, { color: exState === "correct" ? "#166534" : "#991b1b" }]}>
                {exState === "correct" ? "Great job!" : "Keep practicing!"}
              </Text>
              {exState === "correct" && <Text style={styles.feedbackXp}>+{exercise.xp} XP</Text>}
            </View>
          </View>
          <TouchableOpacity
            style={exState === "correct" ? styles.btnPrimary : styles.btnDanger}
            onPress={handleNext} activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {currentIndex + 1 >= lesson.exercises.length ? "Finish!" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feedback footer for translate_to_english — shown after text submission */}
      {exState !== "answering" && exercise.type === "translate_to_english" && (
        <View style={[styles.feedbackBar,
          exState === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <View style={styles.feedbackLeft}>
            <Ionicons
              name={exState === "correct" ? "checkmark-circle" : "close-circle"}
              size={24} color={exState === "correct" ? "#16a34a" : "#dc2626"} />
            <View>
              <Text style={[styles.feedbackTitle, { color: exState === "correct" ? "#166534" : "#991b1b" }]}>
                {exState === "correct" ? "Correct!" : "Not quite"}
              </Text>
              {exState === "correct" && <Text style={styles.feedbackXp}>+{exercise.xp} XP</Text>}
            </View>
          </View>
          <TouchableOpacity
            style={exState === "correct" ? styles.btnPrimary : styles.btnDanger}
            onPress={handleNext} activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {currentIndex + 1 >= lesson.exercises.length ? "Finish!" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Study phase
  studyHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  studyHeaderLeft:  { flexDirection: "row", alignItems: "center", gap: 6 },
  studyHeaderLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  studyHeaderTitle: { color: "#fff", fontSize: 15, fontWeight: "800", flex: 1, textAlign: "center", marginHorizontal: 12 },
  studyHeaderCount: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "700" },
  studyDots: { flexDirection: "row", gap: 5, justifyContent: "center", paddingVertical: 10, backgroundColor: "#fff" },
  studyDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: "#e5e7eb" },
  studyScroll: { padding: 20, paddingBottom: 40 },

  flipCard: {
    borderRadius: 24, borderWidth: 2.5, backgroundColor: "#fff", minHeight: 240,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  flipFace:      { padding: 28, alignItems: "center", justifyContent: "center", minHeight: 240, gap: 8 },
  flipIcon:      { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  flipBangla:    { fontSize: 44, fontWeight: "900", textAlign: "center" },
  flipRoman:     { fontSize: 16, fontStyle: "italic", marginTop: 4, textAlign: "center" },
  flipEnglish:   { fontSize: 30, fontWeight: "900", textAlign: "center" },
  flipBanglaSmall:{ fontSize: 16, color: "#9ca3af", marginTop: 6, textAlign: "center" },
  flipHint:      { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12 },
  flipHintText:  { fontSize: 12, color: "#9ca3af" },

  studyTip: { textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 14, fontStyle: "italic" },
  studyNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, marginHorizontal: 8 },
  navBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#e5e7eb" },
  navBtnDisabled: { opacity: 0.35 },
  navLabel:       { fontSize: 14, fontWeight: "700", color: "#6b7280" },

  startQuizBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 18, paddingVertical: 16, marginTop: 28,
    shadowColor: "#003d2d", shadowOffset: { width:0, height:4 }, shadowOpacity:0.3, elevation:5,
  },
  startQuizText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  startQuizDisabled: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#f9fafb", borderRadius: 16, paddingVertical: 14, marginTop: 28,
    borderWidth: 1.5, borderColor: "#e5e7eb",
  },
  startQuizDisabledText: { fontSize: 13, color: "#9ca3af", fontWeight: "600" },

  // Quiz header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  progressBar:  { flex: 1, height: 12, backgroundColor: "#f3f4f6", borderRadius: 6, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: BD_GREEN, borderRadius: 6 },
  xpBadge: {
    backgroundColor: "#FFF9E6", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  xpText: { fontSize: 13, fontWeight: "800", color: "#D97706" },
  heartsBar: { flexDirection: "row", alignItems: "center", gap: 2 },
  ribbonBadge: {
    backgroundColor: "#f5f3ff", borderRadius: 10,
    padding: 6, alignItems: "center", justifyContent: "center",
  },
  resumeBanner: {
    backgroundColor: "#eff6ff", flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: "#bfdbfe",
  },
  resumeBannerText: { flex: 1, fontSize: 12, fontWeight: "600", color: "#1d4ed8" },
  resumeBtn: { backgroundColor: "#2563eb", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  resumeBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  quizBanner: {
    backgroundColor: "#f5f3ff", flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ede9fe",
  },
  quizBannerText: { fontSize: 12, fontWeight: "600", color: "#7c3aed" },

  exerciseContainer: { padding: 20, paddingBottom: 160 },

  counterRow:       { flexDirection: "row", gap: 6, justifyContent: "center", marginBottom: 20 },
  counterDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: "#e5e7eb" },
  counterDotActive: { backgroundColor: BD_GREEN, width: 20 },
  counterDotDone:   { backgroundColor: BD_GREEN + "55" },

  exerciseHint:   { fontSize: 12, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 },
  promptCard:     { alignItems: "center", marginBottom: 16 },
  exercisePrompt: { fontSize: 20, fontWeight: "700", color: "#374151", textAlign: "center", marginTop: 8 },

  illustrationCard: { alignItems: "center", marginBottom: 20 },
  illustrationRing: {
    width: 148, height: 148, borderRadius: 36,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width:0,height:6 }, shadowOpacity:0.1, shadowRadius:12, elevation:5,
  },
  banglaWord:   { fontSize: 36, fontWeight: "900", color: "#1f2937", textAlign: "center" },
  romanization: { fontSize: 16, color: "#9ca3af", fontStyle: "italic", marginTop: 4, textAlign: "center" },
  questionText: { fontSize: 17, fontWeight: "600", color: "#6b7280", marginTop: 8, textAlign: "center" },

  optionsGrid:     { gap: 10, marginTop: 14 },
  optionBtn:       { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, borderWidth: 2, borderColor: "#e5e7eb", backgroundColor: "#fff", borderBottomWidth: 4, borderBottomColor: "#d1d5db" },
  optionCorrect:   { backgroundColor: "#dcfce7", borderColor: "#4ade80", borderBottomColor: "#16a34a" },
  optionIncorrect: { backgroundColor: "#fee2e2", borderColor: "#f87171", borderBottomColor: "#dc2626" },
  optionText:      { fontSize: 16, fontWeight: "600", color: "#374151" },

  matchSubtitle:    { fontSize: 13, color: "#6b7280", marginBottom: 8 },
  matchProgressRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 18 },
  matchProgress:    { fontSize: 13, fontWeight: "700", color: BD_GREEN, flexShrink: 1 },
  matchGrid: { flexDirection: "row", gap: 10 },
  matchCol:  { flex: 1, gap: 10 },
  matchTile: {
    paddingVertical: 14, paddingHorizontal: 10, borderRadius: 14,
    borderWidth: 2, borderColor: "#e5e7eb", backgroundColor: "#fff",
    borderBottomWidth: 3, borderBottomColor: "#d1d5db",
    alignItems: "center", minHeight: 58, justifyContent: "center",
  },
  matchTileSel:   { backgroundColor: BD_GREEN, borderColor: BD_GREEN, borderBottomColor: "#004535" },
  matchTileDone:  { backgroundColor: "#f0fdf4", borderColor: "#4ade80", borderBottomColor: "#16a34a" },
  matchTileWrong: { backgroundColor: "#fee2e2", borderColor: "#f87171", borderBottomColor: "#dc2626" },
  matchBangla:    { fontSize: 18, fontWeight: "800", color: "#1f2937", textAlign: "center" },
  matchRoman:     { fontSize: 11, color: "#9ca3af", marginTop: 2, textAlign: "center" },
  matchEnglish:   { fontSize: 14, fontWeight: "700", color: "#374151", textAlign: "center" },

  // Translate-to-English
  translateInput: {
    borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 17, fontWeight: "600", color: "#1f2937",
    backgroundColor: "#fff", marginTop: 10,
    borderBottomWidth: 4, borderBottomColor: "#d1d5db",
  },
  translateInputDone: { backgroundColor: "#f9fafb", color: "#9ca3af" },
  checkBtn: {
    backgroundColor: BD_GREEN, borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginTop: 14,
    shadowColor: "#003d2d", shadowOffset: { width:0, height:4 }, shadowOpacity:0.3, elevation:4,
  },
  checkBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  answerReveal: {
    borderRadius: 14, borderWidth: 1.5, padding: 16, marginTop: 14,
  },
  answerRevealLabel: { fontSize: 11, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  answerRevealText:  { fontSize: 22, fontWeight: "900" },

  // Translate-to-Bangla
  selfAssessYes: {
    backgroundColor: BD_GREEN, borderRadius: 16, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    shadowColor: "#003d2d", shadowOffset: { width:0, height:3 }, shadowOpacity:0.25, elevation:4,
  },
  selfAssessYesText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  revealBtn: {
    borderRadius: 16, paddingVertical: 15, borderWidth: 2, borderColor: "#7c3aed",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#f5f3ff",
  },
  revealBtnText: { color: "#7c3aed", fontWeight: "700", fontSize: 15 },
  banglaReveal: {
    backgroundColor: "#f0fdf4", borderRadius: 18, borderWidth: 1.5, borderColor: "#4ade80",
    padding: 24, alignItems: "center", marginTop: 14,
  },
  banglaRevealText:  { fontSize: 42, fontWeight: "900", color: "#1f2937", textAlign: "center" },
  banglaRevealRoman: { fontSize: 17, color: "#6b7280", fontStyle: "italic", marginTop: 8, textAlign: "center" },

  // Fill-blank
  sentenceCard: {
    backgroundColor: "#f9fafb", borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1.5, borderColor: "#e5e7eb", alignItems: "center",
  },
  sentenceText: { fontSize: 22, fontWeight: "700", color: "#1f2937", textAlign: "center", lineHeight: 32 },
  blankFill:    { fontSize: 22, fontWeight: "900", borderBottomWidth: 2, paddingHorizontal: 4 },
  fillRoman:    { fontSize: 13, color: "#9ca3af", fontStyle: "italic", marginTop: 8 },

  // Feedback footer
  feedbackBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 32,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderTopWidth: 2,
  },
  feedbackLeft:      { flexDirection: "row", alignItems: "center", gap: 10 },
  feedbackCorrect:   { backgroundColor: "#f0fdf4", borderTopColor: "#4ade80" },
  feedbackIncorrect: { backgroundColor: "#fef2f2", borderTopColor: "#f87171" },
  feedbackTitle:  { fontSize: 18, fontWeight: "800" },
  feedbackXp:     { fontSize: 13, color: "#16a34a", fontWeight: "700", marginTop: 2 },
  feedbackAnswer: { fontSize: 13, color: "#dc2626", fontWeight: "600", marginTop: 2 },

  btnPrimary: {
    backgroundColor: BD_GREEN, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16,
    shadowColor: "#003d2d", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, elevation: 4,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  btnDanger: { backgroundColor: "#EF4444", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  btnText:   { color: "#fff", fontWeight: "800", fontSize: 15 },
  btnOutline: {
    borderWidth: 2, borderColor: BD_GREEN,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  btnOutlineText: { color: BD_GREEN, fontWeight: "800", fontSize: 15 },
  finishedBtns: { flexDirection: "row", gap: 10, width: "100%" },

  finishedContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  finishedTitle:     { fontSize: 28, fontWeight: "900", color: "#1f2937", textAlign: "center" },
  finishedXpBadge:   { backgroundColor: "#FFF9E6", borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  finishedScoreRow:  { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  finishedScorePill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#f0fdf4", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  finishedScoreText: { fontSize: 13, fontWeight: "700", color: "#16a34a" },
  finishedXpText:    { fontSize: 24, fontWeight: "800", color: "#D97706" },
  finishedDailyCard: {
    width: "100%", backgroundColor: "#f9fafb", borderRadius: 16,
    padding: 14, borderWidth: 1.5, borderColor: "#e5e7eb",
  },
  finishedDailyLabel:{ fontSize: 13, fontWeight: "700", color: "#374151" },
  finishedDailyPct:  { fontSize: 13, fontWeight: "700", color: "#6b7280" },
  finishedDailyBg:   { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  finishedDailyFill: { height: 8, borderRadius: 4 },
  quizBadge:         { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#f5f3ff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  quizBadgeText:     { fontSize: 14, fontWeight: "700", color: "#7c3aed" },
  heartsRow:         { flexDirection: "row", alignItems: "center", gap: 6 },
  heartsText:        { fontSize: 14, color: "#ef4444" },
  shareBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 2, borderColor: "#b45309",
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18,
    backgroundColor: "#fffbeb",
  },
  shareBtnText:      { fontSize: 13, fontWeight: "700", color: "#b45309" },
});
