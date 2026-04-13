// ── Weekly Wrapped Modal ──────────────────────────────────────────────────────
// Shown once per calendar week when the user opens the app after completing
// at least one lesson. Summarises XP, lessons, streak, and top dialect.
// Sharing earns 10 coins.

import React, { useEffect, useRef } from "react";
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Share, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { T, SHADOW, FONT } from "@/lib/theme";
import { addCoinsForShare } from "@/lib/storage";
import type { WeeklyWrappedData } from "@/lib/storage";

type Props = {
  visible:   boolean;
  data:      WeeklyWrappedData | null;
  onDismiss: () => void;
};

const DIALECT_NAMES: Record<string, string> = {
  standard:     "Standard Bengali",
  sylheti:      "Sylheti",
  barisali:     "Barisali",
  chittagonian: "Chittagonian",
  rajshahi:     "Rajshahi",
  khulna:       "Khulna",
};

function buildShareText(data: WeeklyWrappedData): string {
  const parts = [
    `📅 My Bengali Week — ${data.week}`,
    `${"─".repeat(24)}`,
    `📚 ${data.lessonsCompleted} lesson${data.lessonsCompleted !== 1 ? "s" : ""} completed`,
    `⚡ ${data.xpEarned} XP earned`,
    data.currentStreak > 0 ? `🔥 ${data.currentStreak}-day streak` : null,
    data.topDialect ? `🗺️  Top dialect: ${DIALECT_NAMES[data.topDialect] ?? data.topDialect}` : null,
    `${"─".repeat(24)}`,
    "Learning Bengali with The Academy of Bengali Letters! 🇧🇩",
    "#AcademyOfBengaliLetters",
  ].filter(Boolean);
  return parts.join("\n");
}

export default function WeeklyWrappedModal({ visible, data, onDismiss }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 85, useNativeDriver: true }),
        Animated.timing(opacAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacAnim.setValue(0);
    }
  }, [visible]);

  if (!data) return null;

  async function handleShare() {
    try {
      const result = await Share.share({ message: buildShareText(data!) });
      if (result.action === Share.sharedAction) {
        await addCoinsForShare("wrapped");
      }
    } catch {}
    onDismiss();
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[s.overlay, { opacity: opacAnim }]}>
        <Animated.View style={[s.card, { transform: [{ scale: scaleAnim }] }]}>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.emoji}>📅</Text>
            <View>
              <Text style={s.eyebrow}>Weekly recap</Text>
              <Text style={s.week}>{data.week.replace("-W", " · Week ")}</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Stats grid */}
          <View style={s.grid}>
            <Stat icon="flash" color={T.gold}         label="XP earned"  value={String(data.xpEarned)} />
            <Stat icon="book"  color={T.green}         label="Lessons"    value={String(data.lessonsCompleted)} />
            {data.currentStreak > 0 && (
              <Stat icon="flame" color="#ea580c"       label="Streak"     value={`${data.currentStreak}d`} />
            )}
            {data.topDialect && (
              <Stat icon="globe-outline" color={T.sylheti} label="Top dialect"
                    value={DIALECT_NAMES[data.topDialect] ?? data.topDialect} />
            )}
          </View>

          <View style={s.divider} />

          {/* Actions */}
          <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.85}>
            <Ionicons name="share-social-outline" size={18} color={T.white} />
            <Text style={s.shareBtnText}>Share & earn 10 coins</Text>
            <View style={s.coinPill}>
              <Ionicons name="ellipse" size={11} color="#b45309" />
              <Text style={s.coinText}>+10</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={s.dismissBtn} onPress={onDismiss} activeOpacity={0.7}>
            <Text style={s.dismissText}>Maybe later</Text>
          </TouchableOpacity>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Stat({ icon, color, label, value }: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string; label: string; value: string;
}) {
  return (
    <View style={st.statBox}>
      <View style={[st.iconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={st.statValue}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
  },
  card: {
    backgroundColor: T.card,
    borderWidth: 3, borderColor: T.green,
    borderRadius: 20, padding: 24,
    marginHorizontal: 24, gap: 16,
    ...SHADOW.green,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  emoji:  { fontSize: 40 },
  eyebrow: { fontFamily: FONT.bold, fontSize: 10, color: T.textMuted as string, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 },
  week:   { fontFamily: FONT.bold, fontSize: 18, color: T.green },
  divider: { height: 1, backgroundColor: T.border },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shareBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: T.green, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 18,
    ...SHADOW.green,
  },
  shareBtnText: { fontFamily: FONT.bold, fontSize: 14, color: T.white, flex: 1 },
  coinPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  coinText: { fontFamily: FONT.bold, fontSize: 12, color: T.white },
  dismissBtn: { alignItems: "center", paddingVertical: 4 },
  dismissText: { fontFamily: FONT.medium, fontSize: 13, color: T.textMuted as string },
});

const st = StyleSheet.create({
  statBox: { width: "47%", alignItems: "center", gap: 4, padding: 12, backgroundColor: T.bg, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statValue: { fontFamily: FONT.bold, fontSize: 20, color: T.text as string },
  statLabel: { fontFamily: FONT.medium, fontSize: 11, color: T.textMuted as string, textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center" },
});
