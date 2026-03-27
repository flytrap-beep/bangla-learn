import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SpeakButton from "@/components/SpeakButton";
import { T } from "@/lib/theme";

const BD_GREEN = T.green;

// ── Data ──────────────────────────────────────────────────────────────────────

const VOWELS = [
  { letter: "অ", roman: "o",   sound: "Like 'o' in 'onion'" },
  { letter: "আ", roman: "aa",  sound: "Like 'a' in 'father'" },
  { letter: "ই", roman: "i",   sound: "Like 'i' in 'fit'" },
  { letter: "ঈ", roman: "ii",  sound: "Like 'ee' in 'feet' (longer)" },
  { letter: "উ", roman: "u",   sound: "Like 'u' in 'put'" },
  { letter: "ঊ", roman: "uu",  sound: "Like 'oo' in 'food' (longer)" },
  { letter: "এ", roman: "e",   sound: "Like 'e' in 'they'" },
  { letter: "ঐ", roman: "oi",  sound: "Like 'oi' in 'coin'" },
  { letter: "ও", roman: "o",   sound: "Like 'o' in 'go'" },
  { letter: "ঔ", roman: "ou",  sound: "Like 'ow' in 'how'" },
];

const CONSONANTS = [
  { letter: "ক", roman: "k",  sound: "'k' as in 'kite'" },
  { letter: "খ", roman: "kh", sound: "'kh' — aspirated 'k'" },
  { letter: "গ", roman: "g",  sound: "'g' as in 'go'" },
  { letter: "ঘ", roman: "gh", sound: "'gh' — aspirated 'g'" },
  { letter: "চ", roman: "ch", sound: "'ch' as in 'chair'" },
  { letter: "ছ", roman: "chh",sound: "'chh' — aspirated 'ch'" },
  { letter: "জ", roman: "j",  sound: "'j' as in 'jump'" },
  { letter: "ঝ", roman: "jh", sound: "'jh' — aspirated 'j'" },
  { letter: "ট", roman: "t",  sound: "retroflex 't' (tongue curled)" },
  { letter: "ঠ", roman: "th", sound: "aspirated retroflex 't'" },
  { letter: "ড", roman: "d",  sound: "retroflex 'd'" },
  { letter: "ঢ", roman: "dh", sound: "aspirated retroflex 'd'" },
  { letter: "ত", roman: "t",  sound: "dental 't' (soft, like Spanish)" },
  { letter: "থ", roman: "th", sound: "aspirated dental 't'" },
  { letter: "দ", roman: "d",  sound: "dental 'd' (soft)" },
  { letter: "ধ", roman: "dh", sound: "aspirated dental 'd'" },
  { letter: "ন", roman: "n",  sound: "'n' as in 'name'" },
  { letter: "প", roman: "p",  sound: "'p' as in 'pot'" },
  { letter: "ফ", roman: "ph", sound: "'ph' — aspirated 'p'" },
  { letter: "ব", roman: "b",  sound: "'b' as in 'bat'" },
  { letter: "ভ", roman: "bh", sound: "'bh' — aspirated 'b'" },
  { letter: "ম", roman: "m",  sound: "'m' as in 'man'" },
  { letter: "য", roman: "y",  sound: "'y' as in 'yes'" },
  { letter: "র", roman: "r",  sound: "soft rolled 'r'" },
  { letter: "ল", roman: "l",  sound: "'l' as in 'lamp'" },
  { letter: "শ", roman: "sh", sound: "'sh' as in 'shoe'" },
  { letter: "স", roman: "s",  sound: "'s' as in 'sun'" },
  { letter: "হ", roman: "h",  sound: "'h' as in 'hat'" },
];

const NUMBERS = [
  { digit: "০", word: "শূন্য", roman: "shunyo", english: "zero" },
  { digit: "১", word: "এক",    roman: "ek",     english: "one" },
  { digit: "২", word: "দুই",   roman: "dui",    english: "two" },
  { digit: "৩", word: "তিন",   roman: "tin",    english: "three" },
  { digit: "৪", word: "চার",   roman: "char",   english: "four" },
  { digit: "৫", word: "পাঁচ",  roman: "panch",  english: "five" },
  { digit: "৬", word: "ছয়",   roman: "chhoy",  english: "six" },
  { digit: "৭", word: "সাত",   roman: "saat",   english: "seven" },
  { digit: "৮", word: "আট",    roman: "aat",    english: "eight" },
  { digit: "৯", word: "নয়",   roman: "noy",    english: "nine" },
  { digit: "১০",word: "দশ",    roman: "dash",   english: "ten" },
  { digit: "১১",word: "এগারো", roman: "egaro",  english: "eleven" },
  { digit: "১২",word: "বারো",  roman: "baro",   english: "twelve" },
  { digit: "২০",word: "বিশ",   roman: "bish",   english: "twenty" },
  { digit: "৫০",word: "পঞ্চাশ",roman: "ponchash",english: "fifty" },
  { digit: "১০০",word:"একশো",  roman: "ekshoo", english: "one hundred" },
];

const PHRASES = [
  { english: "Hello / Hi",          bangla: "হ্যালো",           roman: "hyaalo" },
  { english: "Good morning",        bangla: "শুভ সকাল",         roman: "shubho shokal" },
  { english: "Good evening",        bangla: "শুভ সন্ধ্যা",      roman: "shubho shondhya" },
  { english: "Good night",          bangla: "শুভ রাত্রি",       roman: "shubho raatri" },
  { english: "How are you?",        bangla: "আপনি কেমন আছেন?",  roman: "aapni kemon aachen?" },
  { english: "I'm fine",            bangla: "আমি ভালো আছি",     roman: "aami bhaalo aachi" },
  { english: "Thank you",           bangla: "ধন্যবাদ",          roman: "dhonnobaad" },
  { english: "You're welcome",      bangla: "আপনাকে স্বাগতম",   roman: "aapnaake shagatom" },
  { english: "Please",              bangla: "অনুগ্রহ করে",      roman: "onugroho kore" },
  { english: "Sorry / Excuse me",   bangla: "মাফ করবেন",        roman: "maaf korben" },
  { english: "Yes",                 bangla: "হ্যাঁ",            roman: "hyan" },
  { english: "No",                  bangla: "না",               roman: "na" },
  { english: "I don't understand",  bangla: "আমি বুঝি না",      roman: "aami bujhi na" },
  { english: "Can you repeat?",     bangla: "আবার বলবেন?",      roman: "abaar bolben?" },
  { english: "What is your name?",  bangla: "আপনার নাম কী?",   roman: "aapnar naam ki?" },
  { english: "My name is...",       bangla: "আমার নাম...",      roman: "aamar naam..." },
  { english: "Where is...?",        bangla: "কোথায়...?",       roman: "kothay...?" },
  { english: "How much?",           bangla: "কত টাকা?",         roman: "koto taka?" },
  { english: "I love Bengali",      bangla: "আমি বাংলা ভালোবাসি", roman: "aami bangla bhaalobaashi" },
];

const GRAMMAR = [
  {
    title: "Word order",
    color: "#7c3aed",
    icon: "swap-horizontal-outline" as const,
    points: [
      "Bengali is Subject–Object–Verb (SOV): \"I rice eat\" not \"I eat rice\"",
      "Example: আমি ভাত খাই  →  ami bhaat khai  (I rice eat)",
      "Adjectives come before nouns, just like English",
      "Question words (what, where) usually come at the end of the sentence",
    ],
  },
  {
    title: "Pronouns",
    color: "#0284c7",
    icon: "person-outline" as const,
    points: [
      "আমি (ami) = I / me",
      "তুমি (tumi) = you (informal, for friends)",
      "আপনি (aapni) = you (formal, for elders/strangers)",
      "সে (she) = he / she / it",
      "আমরা (amra) = we",
      "তারা (tara) = they",
    ],
  },
  {
    title: "Verbs — present tense",
    color: BD_GREEN,
    icon: "flash-outline" as const,
    points: [
      "Verbs change ending based on who is doing the action",
      "Root: যা (ja) = go",
      "আমি যাই (ami jai) = I go",
      "তুমি যাও (tumi jao) = you go (informal)",
      "সে যায় (she jay) = he/she goes",
      "\"আছি\" (aachi) = am/is/are (the verb 'to be' present)",
    ],
  },
  {
    title: "Possession",
    color: "#d97706",
    icon: "key-outline" as const,
    points: [
      "Add -র (-r) or -এর (-er) to a noun to show possession",
      "আমার (aamar) = my / mine",
      "তোমার (tomar) = your (informal)",
      "আপনার (aapnar) = your (formal)",
      "বাংলাদেশের (Bangladesh-er) = Bangladesh's",
    ],
  },
  {
    title: "Negation",
    color: "#ef4444",
    icon: "close-circle-outline" as const,
    points: [
      "Add না (na) after the verb to negate",
      "আমি জানি (ami jani) = I know",
      "আমি জানি না (ami jani na) = I don't know",
      "না can also mean 'no' on its own",
    ],
  },
  {
    title: "Pronunciation tips",
    color: "#6366f1",
    icon: "volume-high-outline" as const,
    points: [
      "Aspirated consonants (kh, gh, ch, ph, bh...) have a puff of air — like 'k' in 'king' vs 'k' in 'skin'",
      "Retroflex consonants (ট ঠ ড ঢ) are made with the tongue curled back",
      "The vowel 'অ' sounds like 'o' at the start but often like 'a' mid-word",
      "Word stress in Bengali is usually on the first syllable",
    ],
  },
];

// ── Components ────────────────────────────────────────────────────────────────

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
      <Text style={[styles.sectionHeaderText, { color }]}>{title}</Text>
    </View>
  );
}

function LetterCard({ letter, roman, sound }: { letter: string; roman: string; sound: string }) {
  return (
    <View style={styles.letterCard}>
      <Text style={styles.letterChar}>{letter}</Text>
      <Text style={styles.letterRoman}>/{roman}/</Text>
      <SpeakButton text={letter} size={14} color={BD_GREEN} style={{ marginTop: 2 }} />
      <Text style={styles.letterSound}>{sound}</Text>
    </View>
  );
}

function PhraseRow({ english, bangla, roman }: { english: string; bangla: string; roman: string }) {
  return (
    <View style={styles.phraseRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.phraseEnglish}>{english}</Text>
        <Text style={styles.phraseBangla}>{bangla}</Text>
        <Text style={styles.phraseRoman}>/{roman}/</Text>
      </View>
      <SpeakButton text={bangla} size={20} color={BD_GREEN} />
    </View>
  );
}

function GrammarCard({ title, color, icon, points }: typeof GRAMMAR[0]) {
  const [open, setOpen] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  function toggle() {
    Animated.timing(heightAnim, {
      toValue: open ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setOpen((v) => !v);
  }

  return (
    <View style={styles.grammarCard}>
      <TouchableOpacity onPress={toggle} style={styles.grammarHeader} activeOpacity={0.75}>
        <View style={[styles.grammarIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.grammarTitle, { color }]}>{title}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#9ca3af" />
      </TouchableOpacity>
      <Animated.View style={{
        overflow: "hidden",
        maxHeight: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 300] }),
        opacity:   heightAnim,
      }}>
        <View style={styles.grammarBody}>
          {points.map((p, i) => (
            <View key={i} style={styles.grammarPoint}>
              <View style={[styles.grammarDot, { backgroundColor: color }]} />
              <Text style={styles.grammarPointText}>{p}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "alphabet", label: "Alphabet",  icon: "text-outline"      as const },
  { id: "numbers",  label: "Numbers",   icon: "calculator-outline" as const },
  { id: "phrases",  label: "Phrases",   icon: "chatbubble-outline" as const },
  { id: "grammar",  label: "Grammar",   icon: "school-outline"     as const },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Main screen ───────────────────────────────────────────────────────────────

export default function StudyGuideScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("alphabet");

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Bengali Study Guide</Text>
          <Text style={styles.headerSub}>English explanations · Tap 🔊 to hear any word</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
            activeOpacity={0.7}
          >
            <Ionicons name={t.icon} size={16} color={tab === t.id ? BD_GREEN : "#9ca3af"} />
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

        {tab === "alphabet" && (
          <View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#0284c7" />
              <Text style={styles.infoText}>
                Bengali has 11 vowels and 39 consonants. Aspirated sounds (kh, gh, ph...) are made with a burst of air. Tap 🔊 to hear each letter.
              </Text>
            </View>

            <SectionHeader title="Vowels (স্বরবর্ণ)" color="#7c3aed" />
            <View style={styles.letterGrid}>
              {VOWELS.map((v) => <LetterCard key={v.letter} {...v} />)}
            </View>

            <SectionHeader title="Consonants (ব্যঞ্জনবর্ণ)" color={BD_GREEN} />
            <View style={styles.letterGrid}>
              {CONSONANTS.map((c) => <LetterCard key={c.letter} {...c} />)}
            </View>
          </View>
        )}

        {tab === "numbers" && (
          <View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#0284c7" />
              <Text style={styles.infoText}>
                Bengali uses its own number script (০১২৩...) in everyday writing. The spoken words are completely different from the digits.
              </Text>
            </View>
            <SectionHeader title="Bengali Numbers" color="#d97706" />
            <View style={{ gap: 2 }}>
              {NUMBERS.map((n) => (
                <View key={n.digit} style={styles.numberRow}>
                  <Text style={styles.numberDigit}>{n.digit}</Text>
                  <Text style={styles.numberWord}>{n.word}</Text>
                  <Text style={styles.numberRoman}>/{n.roman}/</Text>
                  <Text style={styles.numberEnglish}>{n.english}</Text>
                  <SpeakButton text={n.word} size={18} color="#d97706" />
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === "phrases" && (
          <View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#0284c7" />
              <Text style={styles.infoText}>
                Tap 🔊 next to any phrase to hear it. Practice by repeating out loud — mimicking the sound is the fastest way to learn pronunciation.
              </Text>
            </View>
            <SectionHeader title="Essential Phrases" color={BD_GREEN} />
            <View style={{ gap: 2 }}>
              {PHRASES.map((p) => <PhraseRow key={p.english} {...p} />)}
            </View>
          </View>
        )}

        {tab === "grammar" && (
          <View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#0284c7" />
              <Text style={styles.infoText}>
                Tap any section to expand it. Bengali grammar is very different from English — don't worry if it takes time, just focus on the patterns.
              </Text>
            </View>
            <SectionHeader title="Grammar Basics" color="#6366f1" />
            <View style={{ gap: 8 }}>
              {GRAMMAR.map((g) => <GrammarCard key={g.title} {...g} />)}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    backgroundColor: BD_GREEN, flexDirection: "row",
    alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: "#fff" },
  headerSub:   { fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 },

  // Tabs
  tabBar: {
    flexDirection: "row", backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabBtnActive:  { borderBottomColor: BD_GREEN },
  tabLabel:      { fontSize: 11, fontWeight: "700", color: "#9ca3af" },
  tabLabelActive:{ color: BD_GREEN },

  // Info box
  infoBox: {
    flexDirection: "row", gap: 10, backgroundColor: "#eff6ff",
    borderRadius: 14, padding: 13, marginBottom: 16,
    borderWidth: 1, borderColor: "#bfdbfe",
  },
  infoText: { flex: 1, fontSize: 13, color: "#1e40af", lineHeight: 19 },

  // Section header
  sectionHeader: {
    borderLeftWidth: 4, paddingLeft: 12, marginBottom: 12, marginTop: 4,
  },
  sectionHeaderText: { fontSize: 16, fontWeight: "900" },

  // Letter cards
  letterGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20,
  },
  letterCard: {
    width: "22%", minWidth: 72,
    backgroundColor: "#fff", borderRadius: 14, padding: 10,
    alignItems: "center", borderWidth: 1.5, borderColor: "#f0f0f0",
  },
  letterChar:  { fontSize: 28, fontWeight: "900", color: "#1f2937" },
  letterRoman: { fontSize: 11, color: BD_GREEN, fontWeight: "700", marginTop: 2 },
  letterSound: { fontSize: 9, color: "#9ca3af", textAlign: "center", marginTop: 4, lineHeight: 13 },

  // Number rows
  numberRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 12, padding: 12,
    marginBottom: 6, borderWidth: 1, borderColor: "#f0f0f0",
  },
  numberDigit:   { fontSize: 22, fontWeight: "900", color: "#d97706", width: 36, textAlign: "center" },
  numberWord:    { fontSize: 18, fontWeight: "800", color: "#1f2937", flex: 1 },
  numberRoman:   { fontSize: 12, color: "#9ca3af", width: 70 },
  numberEnglish: { fontSize: 12, color: "#6b7280", width: 60 },

  // Phrase rows
  phraseRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: "#f0f0f0",
  },
  phraseEnglish: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 3 },
  phraseBangla:  { fontSize: 18, fontWeight: "900", color: BD_GREEN },
  phraseRoman:   { fontSize: 11, color: "#9ca3af", marginTop: 2 },

  // Grammar cards
  grammarCard: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1.5, borderColor: "#f0f0f0", overflow: "hidden",
  },
  grammarHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14,
  },
  grammarIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  grammarTitle: { flex: 1, fontSize: 14, fontWeight: "800" },
  grammarBody:  { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  grammarPoint: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  grammarDot:   { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  grammarPointText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },
});
