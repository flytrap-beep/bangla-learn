// ── ShareCard — branded capture target for BhashaLoop Wrapped image sharing ──
// Rendered OFF-SCREEN (absolute, left:-9999) and captured with react-native-view-shot.
// Solid background (no transparency) so the PNG looks right in every share target.
// collapsable={false} is required on Android or the view may be optimized away
// and captureRef returns a blank image.

import React, { forwardRef } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { T, FONT } from "@/lib/theme";
import type { WeeklyWrappedData } from "@/lib/storage";

export type ShareCardData =
  | { kind: "report_card"; lessonTitle: string; accuracy: number; xp: number; isQuiz: boolean; streak: number }
  | { kind: "streak"; streak: number; totalXp: number; milestone?: boolean }
  | { kind: "profile_report"; totalXp: number; lessons: number; streak: number; dialects: number }
  | { kind: "wrapped"; data: WeeklyWrappedData };

const DIALECT_NAMES: Record<string, string> = {
  standard: "Standard Bengali", sylheti: "Sylheti", barisali: "Barisali",
  chittagonian: "Chittagonian", rajshahi: "Rajshahi", khulna: "Khulna",
};

const CARD_W = 350;
const CARD_H = 440;

const ShareCard = forwardRef<View, { card: ShareCardData }>(({ card }, ref) => {
  return (
    <View ref={ref} collapsable={false} style={s.card}>
      {/* Brand header */}
      <View style={s.brandRow}>
        <View style={s.logoRing}>
          <Image source={require("../assets/logo.png")} style={s.logo} resizeMode="cover" />
        </View>
        <View>
          <Text style={s.wordmark}>BhashaLoop</Text>
          <Text style={s.tagline}>LEARN BENGALI YOUR WAY</Text>
        </View>
      </View>

      <View style={s.divider} />

      {card.kind === "report_card" && (
        <>
          <Text style={s.eyebrow}>{card.isQuiz ? "QUIZ PASSED" : "LESSON COMPLETE"}</Text>
          <Text style={s.title} numberOfLines={2}>{card.lessonTitle}</Text>
          <View style={s.heroBlock}>
            <Text style={[s.heroValue, { color: T.green }]}>{card.accuracy}%</Text>
            <Text style={s.heroLabel}>accuracy</Text>
          </View>
          <View style={s.statRow}>
            <MiniStat value={`+${card.xp}`} label="XP earned" color={T.gold} />
            {card.streak > 0 && <MiniStat value={`${card.streak}d`} label="streak" color={T.red} />}
          </View>
        </>
      )}

      {card.kind === "streak" && (
        <>
          <Text style={s.eyebrow}>{card.milestone ? "STREAK MILESTONE" : "ON A ROLL"}</Text>
          <Text style={s.bigEmoji}>🔥</Text>
          <View style={s.heroBlock}>
            <Text style={[s.heroValue, { color: T.red }]}>{card.streak}</Text>
            <Text style={s.heroLabel}>day streak</Text>
          </View>
          <View style={s.statRow}>
            <MiniStat value={String(card.totalXp)} label="total XP" color={T.gold} />
          </View>
        </>
      )}

      {card.kind === "profile_report" && (
        <>
          <Text style={s.eyebrow}>MY REPORT CARD</Text>
          <Text style={s.bigEmoji}>🎓</Text>
          <View style={s.heroBlock}>
            <Text style={[s.heroValue, { color: T.gold }]}>{card.totalXp}</Text>
            <Text style={s.heroLabel}>total XP</Text>
          </View>
          <View style={s.statRow}>
            <MiniStat value={String(card.lessons)} label="lessons" color={T.green} />
            {card.streak > 0 && <MiniStat value={`${card.streak}d`} label="streak" color={T.red} />}
            {card.dialects > 1 && <MiniStat value={String(card.dialects)} label="dialects" color={T.sylheti} />}
          </View>
        </>
      )}

      {card.kind === "wrapped" && (
        <>
          <Text style={s.eyebrow}>MY BENGALI WEEK</Text>
          <Text style={s.title}>{card.data.week.replace("-W", " · Week ")}</Text>
          <View style={s.heroBlock}>
            <Text style={[s.heroValue, { color: T.gold }]}>{card.data.xpEarned}</Text>
            <Text style={s.heroLabel}>XP earned</Text>
          </View>
          <View style={s.statRow}>
            <MiniStat value={String(card.data.lessonsCompleted)} label="lessons" color={T.green} />
            {card.data.currentStreak > 0 && (
              <MiniStat value={`${card.data.currentStreak}d`} label="streak" color={T.red} />
            )}
          </View>
          {card.data.topDialect && (
            <Text style={s.dialectLine}>
              Top dialect: {DIALECT_NAMES[card.data.topDialect] ?? card.data.topDialect}
            </Text>
          )}
        </>
      )}

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.divider} />
        <Text style={s.hashtag}>#BhashaLoop · learn Bangla in 6 dialects</Text>
      </View>
    </View>
  );
});

export default ShareCard;

function MiniStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={[s.miniStat, { borderColor: color }]}>
      <Text style={[s.miniValue, { color }]}>{value}</Text>
      <Text style={s.miniLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: CARD_W, height: CARD_H,
    backgroundColor: T.bg,
    borderWidth: 3, borderColor: T.green, borderRadius: 24,
    padding: 26, alignItems: "center",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "flex-start" },
  logoRing: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: T.green, overflow: "hidden", backgroundColor: T.white,
  },
  logo: { width: "100%", height: "100%" },
  wordmark: { fontFamily: FONT.bold, fontSize: 17, color: T.green },
  tagline:  { fontFamily: FONT.bold, fontSize: 7.5, color: T.textMid as string, letterSpacing: 1.4 },
  divider: { height: 2, backgroundColor: T.border, alignSelf: "stretch", marginVertical: 14 },
  eyebrow: { fontFamily: FONT.bold, fontSize: 11, color: T.textMid as string, letterSpacing: 2, marginBottom: 6 },
  title: { fontFamily: FONT.bold, fontSize: 20, color: T.green, textAlign: "center", marginBottom: 4 },
  bigEmoji: { fontSize: 54, marginVertical: 2 },
  heroBlock: { alignItems: "center", marginVertical: 10 },
  heroValue: { fontFamily: FONT.bold, fontSize: 64, lineHeight: 70 },
  heroLabel: { fontFamily: FONT.medium, fontSize: 13, color: T.textMid as string, textTransform: "uppercase", letterSpacing: 1.5 },
  statRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  miniStat: {
    borderWidth: 2, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 18,
    alignItems: "center", backgroundColor: T.white,
  },
  miniValue: { fontFamily: FONT.bold, fontSize: 20 },
  miniLabel: { fontFamily: FONT.medium, fontSize: 10, color: T.textMid as string, textTransform: "uppercase", letterSpacing: 1 },
  dialectLine: { fontFamily: FONT.medium, fontSize: 13, color: T.text as string, marginTop: 12 },
  footer: { marginTop: "auto", alignSelf: "stretch", alignItems: "center" },
  hashtag: { fontFamily: FONT.bold, fontSize: 12, color: T.textMid as string },
});
