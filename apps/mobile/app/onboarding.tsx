import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Dimensions, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { markOnboardingDone } from "@/lib/storage";
import { T } from "@/lib/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const BD_GREEN = T.green;
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const SLIDES: { icon: IoniconsName; title: string; body: string; color: string; bg: string }[] = [
  {
    icon:  "flag",
    title: "Welcome to BanglaLearn",
    body:  "Learn Bengali (Bangla) through bite-sized lessons, real dialect audio, and interactive exercises — just 5 minutes a day.",
    color: BD_GREEN,
    bg:    "#f0fdf4",
  },
  {
    icon:  "map",
    title: "Explore 4 Dialects",
    body:  "Learn Standard Bangla or dive into regional dialects — Sylheti, Barisali, or Chittagonian. Each has its own accent and phrases.",
    color: "#7c3aed",
    bg:    "#faf5ff",
  },
  {
    icon:  "flame",
    title: "Build a Streak",
    body:  "Complete your daily goal to keep your streak alive. Each lesson earns XP — hit your target and you're done for the day.",
    color: "#ea580c",
    bg:    "#fff7ed",
  },
  {
    icon:  "volume-high",
    title: "Practice Out Loud",
    body:  "Tap the speaker icon on any word to hear it spoken aloud. Then try to mimic the sound — repetition is the key to fluency.",
    color: "#0284c7",
    bg:    "#f0f9ff",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function goTo(next: number) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: false });
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  }

  async function finish() {
    await markOnboardingDone();
    router.replace("/(tabs)" as any);
  }

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: slide.bg }]}>
      {/* Skip */}
      {!isLast && (
        <TouchableOpacity onPress={finish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slide content */}
      <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
        <View style={[styles.emojiCircle, { backgroundColor: slide.color + "20" }]}>
          <Ionicons name={slide.icon} size={68} color={slide.color} />
        </View>
        <Text style={[styles.title, { color: slide.color }]}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </Animated.View>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? slide.color : "#d1d5db" },
              i === index && { width: 22 },
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <View style={styles.btnRow}>
        {index > 0 && (
          <TouchableOpacity onPress={() => goTo(index - 1)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={isLast ? finish : () => goTo(index + 1)}
          style={[styles.nextBtn, { backgroundColor: slide.color }]}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Start Learning" : "Next"}
          </Text>
          {!isLast && <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, paddingHorizontal: 28 },
  skipBtn:    { alignSelf: "flex-end", paddingVertical: 14, paddingHorizontal: 4 },
  skipText:   { fontSize: 14, color: "#9ca3af", fontWeight: "600" },
  center:     { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  emojiCircle:{
    width: 120, height: 120, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
  },
  emoji:      { fontSize: 58 },
  title:      { fontSize: 28, fontWeight: "900", textAlign: "center" },
  body:       {
    fontSize: 16, color: "#374151", textAlign: "center",
    lineHeight: 24, paddingHorizontal: 8,
  },
  dots:       { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  btnRow:     {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginBottom: 28,
  },
  backBtn:    {
    width: 48, height: 52, borderRadius: 16,
    borderWidth: 2, borderColor: "#e5e7eb",
    alignItems: "center", justifyContent: "center",
  },
  nextBtn:    {
    flex: 1, flexDirection: "row",
    paddingVertical: 16, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
