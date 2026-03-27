import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCurriculum } from "@bangla-learn/content";
import type { Character, Dialect } from "@bangla-learn/types";
import { T } from "@/lib/theme";

const BD_GREEN = T.green;

type Tab = "vowels" | "consonants" | "flashcards" | "grammar";

function CharCard({ char }: { char: Character }) {
  return (
    <View style={styles.charCard}>
      <Text style={styles.charSymbol}>{char.symbol}</Text>
      <Text style={styles.charRoman}>{char.romanization}</Text>
      {char.exampleWord && (
        <Text style={styles.charExample} numberOfLines={1}>
          {char.exampleWord}
        </Text>
      )}
    </View>
  );
}

export default function PrepScreen() {
  const { unitId, dialect } = useLocalSearchParams<{ unitId: string; dialect: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("vowels");

  const curriculum = getCurriculum((dialect ?? "standard") as Dialect);
  const unit = curriculum.units.find((u) => u.id === unitId);

  if (!unit || !unit.prep) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No study material found</Text>
      </SafeAreaView>
    );
  }

  const { characters, flashcards, grammar } = unit.prep;
  const vowels = characters.filter((c) => c.type === "vowel");
  const consonants = characters.filter((c) => c.type === "consonant");

  const TABS: { id: Tab; label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; count: number }[] = [
    { id: "vowels",     label: "Vowels",   icon: "language-outline",  count: vowels.length },
    { id: "consonants", label: "ABC",      icon: "grid-outline",      count: consonants.length },
    { id: "flashcards", label: "Words",    icon: "albums-outline",    count: flashcards.length },
    { id: "grammar",    label: "Grammar",  icon: "book-outline",      count: grammar.length },
  ];

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerSub}>Level {unit.order}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{unit.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: unit.color }]}>
          <Ionicons name="school-outline" size={14} color="#fff" />
          <Text style={styles.badgeText}>Study</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBarScroll}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.tabBtn, t.id === tab && styles.tabBtnActive]}
          >
            <Ionicons name={t.icon} size={16} color={t.id === tab ? "#fff" : "#6b7280"} />
            <Text style={[styles.tabLabel, t.id === tab && { color: "#fff" }]}>
              {t.label}
            </Text>
            <View style={[styles.tabCount, t.id === tab && styles.tabCountActive]}>
              <Text style={[styles.tabCountText, t.id === tab && { color: BD_GREEN }]}>{t.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Vowels / Consonants */}
        {(tab === "vowels" || tab === "consonants") && (
          <>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name={tab === "vowels" ? "language-outline" : "grid-outline"}
                size={16} color={BD_GREEN}
              />
              <Text style={styles.sectionTitle}>
                {tab === "vowels"
                  ? `Bengali Vowels (স্বরবর্ণ) — ${vowels.length}`
                  : `Bengali Consonants (ব্যঞ্জনবর্ণ) — ${consonants.length}`}
              </Text>
            </View>
            <Text style={styles.sectionHint}>
              {tab === "vowels"
                ? "Vowels can stand alone or combine with consonants as diacritics."
                : "Each consonant has a unique shape. Tap to study — trace to practise!"}
            </Text>
            <View style={styles.charGrid}>
              {(tab === "vowels" ? vowels : consonants).map((c) => (
                <CharCard key={c.symbol} char={c} />
              ))}
            </View>
          </>
        )}

        {/* Flashcards */}
        {tab === "flashcards" && (
          <>
            <Text style={styles.sectionHint}>Tap a card to study the vocabulary for this unit.</Text>
            {flashcards.map((fc) => (
              <View key={fc.id} style={styles.flashCard}>
                <View style={styles.flashLeft}>
                  <Text style={styles.flashBangla}>{fc.bangla}</Text>
                  <Text style={styles.flashRoman}>({fc.romanization})</Text>
                </View>
                <View style={styles.flashRight}>
                  <Text style={styles.flashEnglish}>{fc.english}</Text>
                  {fc.category && (
                    <View style={styles.flashTag}>
                      <Text style={styles.flashTagText}>{fc.category}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Grammar */}
        {tab === "grammar" && (
          <>
            <Text style={styles.sectionHint}>Read these grammar notes before starting lessons.</Text>
            {grammar.map((g, i) => (
              <View key={i} style={styles.grammarCard}>
                <View style={styles.grammarHeader}>
                  <View style={[styles.grammarIcon, { backgroundColor: unit.color + "22" }]}>
                    <Ionicons name="library-outline" size={18} color={unit.color} />
                  </View>
                  <Text style={styles.grammarTitle}>{g.title}</Text>
                </View>
                <Text style={styles.grammarExplanation}>{g.explanation}</Text>
                {g.examples.length > 0 && (
                  <View style={styles.grammarExamples}>
                    {g.examples.map((ex, j) => (
                      <View key={j} style={styles.grammarExample}>
                        <Text style={styles.exBangla}>{ex.bangla}</Text>
                        <Text style={styles.exRoman}>({ex.romanization})</Text>
                        <Text style={styles.exEnglish}>{ex.english}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    backgroundColor: BD_GREEN, flexDirection: "row",
    alignItems: "center", paddingHorizontal: 20, paddingVertical: 14,
  },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 1 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  tabBarScroll: {
    backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
    maxHeight: 60, flexGrow: 0,
  },
  tabBarContent: {
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
    flexDirection: "row", alignItems: "center",
  },
  tabBtn: {
    flexDirection: "row", alignItems: "center",
    gap: 5, paddingVertical: 9, paddingHorizontal: 14,
    borderRadius: 14, backgroundColor: "#f3f4f6",
    minWidth: 80,
  },
  tabBtnActive: { backgroundColor: BD_GREEN },
  tabLabel: { fontSize: 13, fontWeight: "700", color: "#6b7280" },
  tabCount: {
    backgroundColor: "#e5e7eb", borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  tabCountActive: { backgroundColor: "rgba(255,255,255,0.28)" },
  tabCountText: { fontSize: 11, fontWeight: "800", color: "#6b7280" },

  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitleRow: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: "800", color: "#1f2937",
  },
  sectionHint: { fontSize: 13, color: "#6b7280", marginBottom: 14, lineHeight: 20 },

  // Character grid
  charGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },
  charCard: {
    width: "22%", aspectRatio: 1,
    backgroundColor: "#fff", borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#e5e7eb", paddingVertical: 8, paddingHorizontal: 4,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  charSymbol: { fontSize: 26, fontWeight: "900", color: "#1f2937" },
  charRoman: { fontSize: 10, fontWeight: "700", color: BD_GREEN, marginTop: 2 },
  charExample: { fontSize: 9, color: "#9ca3af", marginTop: 1, textAlign: "center" },

  // Flashcards
  flashCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 10, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#f3f4f6",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  flashLeft: { flex: 1 },
  flashRight: { flex: 1, alignItems: "flex-end" },
  flashBangla: { fontSize: 22, fontWeight: "900", color: "#1f2937" },
  flashRoman: { fontSize: 12, color: "#9ca3af", fontStyle: "italic", marginTop: 2 },
  flashEnglish: { fontSize: 16, fontWeight: "700", color: "#374151" },
  flashTag: {
    backgroundColor: "#f0fdf4", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
  },
  flashTagText: { fontSize: 10, fontWeight: "700", color: "#16a34a", textTransform: "uppercase" },

  // Grammar
  grammarCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6",
  },
  grammarHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  grammarIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  grammarTitle: { fontSize: 15, fontWeight: "800", color: "#1f2937", flex: 1 },
  grammarExplanation: { fontSize: 14, color: "#6b7280", lineHeight: 22 },
  grammarExamples: { marginTop: 12, gap: 8 },
  grammarExample: {
    backgroundColor: "#f9fafb", borderRadius: 10,
    padding: 12, borderLeftWidth: 3, borderLeftColor: BD_GREEN,
  },
  exBangla: { fontSize: 17, fontWeight: "800", color: "#1f2937" },
  exRoman: { fontSize: 12, color: "#9ca3af", fontStyle: "italic", marginTop: 2 },
  exEnglish: { fontSize: 13, color: "#6b7280", marginTop: 4 },
});
