// ── Streak Milestone Modal ────────────────────────────────────────────────────
// Shown when the user hits a 7, 14, or 30-day streak.
// Awards bonus coins and celebrates with animation.

import React, { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { T, SHADOW, FONT } from "@/lib/theme";

export const STREAK_MILESTONES = [7, 14, 30] as const;
export type StreakMilestone = typeof STREAK_MILESTONES[number];

const MILESTONE_DATA: Record<StreakMilestone, {
  emoji: string; label: string; sub: string; coins: number; color: string;
}> = {
  7:  { emoji: "🔥", label: "7-Day Streak!",  sub: "One full week — you're on fire!",    coins: 15, color: "#d97706" },
  14: { emoji: "⚡", label: "14-Day Streak!", sub: "Two weeks strong. Unstoppable!",      coins: 30, color: T.sylheti },
  30: { emoji: "👑", label: "30-Day Streak!", sub: "A full month. You are a legend.",     coins: 75, color: T.gold    },
};

type Props = {
  visible:   boolean;
  milestone: StreakMilestone | null;
  onDismiss: () => void;
};

export default function StreakMilestoneModal({ visible, milestone, onDismiss }: Props) {
  const scaleAnim  = useRef(new Animated.Value(0.6)).current;
  const opacAnim   = useRef(new Animated.Value(0)).current;
  const coinAnim   = useRef(new Animated.Value(0)).current;
  const emojiAnim  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim,  { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
        Animated.timing(opacAnim,   { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(emojiAnim,  { toValue: 1, friction: 4, tension: 60, delay: 150, useNativeDriver: true }),
      ]).start(() => {
        // Coin counter animation after entry
        Animated.timing(coinAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: false }).start();
      });
    } else {
      scaleAnim.setValue(0.6);
      opacAnim.setValue(0);
      coinAnim.setValue(0);
      emojiAnim.setValue(0.5);
    }
  }, [visible]);

  if (!milestone) return null;
  const data = MILESTONE_DATA[milestone];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[s.overlay, { opacity: opacAnim }]}>
        <Animated.View style={[s.card, { transform: [{ scale: scaleAnim }] }]}>

          {/* Emoji */}
          <Animated.Text style={[s.emoji, { transform: [{ scale: emojiAnim }] }]}>
            {data.emoji}
          </Animated.Text>

          {/* Title */}
          <Text style={[s.title, { color: data.color }]}>{data.label}</Text>
          <Text style={s.sub}>{data.sub}</Text>

          {/* Coin reward pill */}
          <View style={[s.coinPill, { borderColor: data.color, backgroundColor: data.color + "12" }]}>
            <Ionicons name="ellipse" size={16} color="#b45309" />
            <Text style={[s.coinText, { color: data.color }]}>+{data.coins} coins earned!</Text>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* CTA */}
          <TouchableOpacity
            style={[s.btn, { backgroundColor: data.color }]}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text style={s.btnText}>Keep the streak alive!</Text>
            <Ionicons name="flame" size={16} color={T.white} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.60)",
    alignItems: "center", justifyContent: "center",
  },
  card: {
    backgroundColor: T.bg,
    borderWidth: 3, borderColor: T.green,
    borderRadius: 20, padding: 32,
    alignItems: "center", gap: 12,
    marginHorizontal: 28,
    ...SHADOW.green,
  },
  emoji:    { fontSize: 64, marginBottom: 4 },
  title:    { fontFamily: FONT.bold, fontSize: 26, textAlign: "center" },
  sub:      { fontFamily: FONT.regular, fontSize: 14, color: T.textMid as string, textAlign: "center", lineHeight: 20 },
  coinPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 2, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 4,
  },
  coinText: { fontFamily: FONT.bold, fontSize: 15 },
  divider:  { width: "100%", height: 1, backgroundColor: T.border, marginVertical: 4 },
  btn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28,
    marginTop: 4,
  },
  btnText: { fontFamily: FONT.bold, fontSize: 15, color: T.white },
});
