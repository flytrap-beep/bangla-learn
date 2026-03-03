import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { getCurriculum } from "@bangla-learn/content";
import { DIALECTS } from "@bangla-learn/types";
import type { Dialect } from "@bangla-learn/types";
import { getActiveDialect, getCompletedLessons, setActiveDialect } from "@/lib/storage";

export default function HomeScreen() {
  const router = useRouter();
  const [dialect, setDialect] = useState<Dialect>("standard");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const d = await getActiveDialect();
      setDialect(d);
      const completed = await getCompletedLessons(d);
      setCompletedIds(new Set(completed));
    }
    load();
  }, []);

  async function switchDialect(d: Dialect) {
    await setActiveDialect(d);
    setDialect(d);
    const completed = await getCompletedLessons(d);
    setCompletedIds(new Set(completed));
  }

  const curriculum = getCurriculum(dialect);

  return (
    <SafeAreaView style={styles.container}>
      {/* Dialect pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dialectBar} contentContainerStyle={styles.dialectBarContent}>
        {(Object.keys(DIALECTS) as Dialect[]).map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => switchDialect(d)}
            style={[styles.dialectPill, d === dialect && styles.dialectPillActive]}
          >
            <Text style={[styles.dialectPillText, d === dialect && styles.dialectPillTextActive]}>
              {DIALECTS[d].flagEmoji} {DIALECTS[d].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {curriculum.units.map((unit) => (
          <View key={unit.id} style={styles.unitSection}>
            {/* Unit header */}
            <View style={[styles.unitHeader, { backgroundColor: unit.color }]}>
              <Text style={styles.unitLabel}>Unit {unit.order}</Text>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={styles.unitDesc}>{unit.description}</Text>
            </View>

            {/* Lessons */}
            <View style={styles.lessonsContainer}>
              {unit.lessons.map((lesson, idx) => {
                const isCompleted = completedIds.has(lesson.id);
                const prevCompleted =
                  idx === 0 || completedIds.has(unit.lessons[idx - 1].id);
                const isLocked = !isCompleted && !prevCompleted;

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    disabled={isLocked}
                    onPress={() =>
                      router.push(`/lesson/${lesson.id}?dialect=${dialect}`)
                    }
                    style={[
                      styles.lessonNode,
                      isCompleted && styles.lessonNodeCompleted,
                      isLocked && styles.lessonNodeLocked,
                    ]}
                  >
                    <Text style={styles.lessonNodeIcon}>
                      {isLocked ? "🔒" : isCompleted ? "⭐" : "📖"}
                    </Text>
                    <Text
                      style={[
                        styles.lessonNodeLabel,
                        isCompleted && { color: "#fff" },
                        isLocked && { color: "#9ca3af" },
                      ]}
                    >
                      {lesson.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  dialectBar: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", maxHeight: 60 },
  dialectBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: "row" },
  dialectPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 2, borderColor: "#e5e7eb", backgroundColor: "#fff",
  },
  dialectPillActive: { backgroundColor: "#58CC02", borderColor: "#58CC02" },
  dialectPillText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  dialectPillTextActive: { color: "#fff" },
  scroll: { padding: 20, paddingBottom: 40 },
  unitSection: { marginBottom: 32 },
  unitHeader: { borderRadius: 16, padding: 18, marginBottom: 20 },
  unitLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  unitTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 4 },
  unitDesc: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  lessonsContainer: { gap: 12 },
  lessonNode: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  lessonNodeCompleted: { backgroundColor: "#58CC02", borderColor: "#4AB800" },
  lessonNodeLocked: { backgroundColor: "#f3f4f6", borderColor: "#e5e7eb", opacity: 0.7 },
  lessonNodeIcon: { fontSize: 24 },
  lessonNodeLabel: { fontSize: 15, fontWeight: "700", color: "#1f2937", flex: 1 },
});
