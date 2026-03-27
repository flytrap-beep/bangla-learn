import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  StatusBar, Animated, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAllDialectProgress, getStats, getLessonHistory } from "@/lib/storage";
import type { LessonAttempt } from "@/lib/storage";
import { getCurriculum } from "@bangla-learn/content";
import type { Dialect } from "@bangla-learn/types";
import { useAuth } from "@/lib/AuthContext";
import { logOut } from "@/lib/auth";
import { T, SHADOW, FONT, MICRO } from "@/lib/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ── Level system ───────────────────────────────────────────────────────────────
const LEVELS = [
  { nameEn: "Beginner",  nameBn: "শিক্ষার্থী",  min: 0,    max: 100,  color: "#9ca3af", icon: "leaf-outline"    as IoniconsName },
  { nameEn: "Learner",   nameBn: "শিক্ষার্থী+", min: 100,  max: 300,  color: T.success, icon: "book-outline"    as IoniconsName },
  { nameEn: "Explorer",  nameBn: "ভাষাপ্রেমী",  min: 300,  max: 700,  color: "#3b82f6", icon: "compass-outline" as IoniconsName },
  { nameEn: "Scholar",   nameBn: "বিশেষজ্ঞ",   min: 700,  max: 1500, color: T.sylheti, icon: "school-outline"  as IoniconsName },
  { nameEn: "Master",    nameBn: "মাস্টার",     min: 1500, max: 9999, color: T.gold,    icon: "trophy-outline"  as IoniconsName },
];

function getLevel(xp: number) {
  return LEVELS.find((l) => xp >= l.min && xp < l.max) ?? LEVELS[LEVELS.length - 1];
}

// ── Dialect meta ───────────────────────────────────────────────────────────────
const DIALECT_META: Record<Dialect, { nameEn: string; nameBn: string; color: string; icon: IoniconsName }> = {
  standard:     { nameEn: "Standard",     nameBn: "মান বাংলা",  color: T.green,          icon: "globe-outline"    },
  sylheti:      { nameEn: "Sylheti",      nameBn: "সিলেটি",      color: T.sylheti,        icon: "cafe-outline"     },
  barisali:     { nameEn: "Barisali",     nameBn: "বরিশালি",    color: T.barisali,       icon: "boat-outline"     },
  chittagonian: { nameEn: "Chittagonian", nameBn: "চাটগাঁইয়া", color: T.chittagonian,   icon: "triangle-outline" },
};

// ── Achievements ───────────────────────────────────────────────────────────────
type Achievement = {
  id: string; icon: IoniconsName; label: string; desc: string;
  unlocked: (xp: number, streak: number, totalLessons: number, dialectsStarted: number) => boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: "first",     icon: "star-outline",      label: "First Step",    desc: "Complete 1 lesson",     unlocked: (_, __, l)     => l >= 1  },
  { id: "lessons5",  icon: "bookmark-outline",  label: "Getting Going", desc: "Complete 5 lessons",    unlocked: (_, __, l)     => l >= 5  },
  { id: "lessons20", icon: "library-outline",   label: "Bookworm",      desc: "Complete 20 lessons",   unlocked: (_, __, l)     => l >= 20 },
  { id: "xp50",      icon: "flash-outline",     label: "50 XP",         desc: "Earn 50 XP",            unlocked: (x)            => x >= 50  },
  { id: "xp200",     icon: "medal-outline",     label: "200 XP Club",   desc: "Earn 200 XP",           unlocked: (x)            => x >= 200 },
  { id: "xp500",     icon: "diamond-outline",   label: "500 XP",        desc: "Earn 500 XP",           unlocked: (x)            => x >= 500 },
  { id: "streak3",   icon: "flame-outline",     label: "On Fire!",      desc: "3-day streak",          unlocked: (_, s)         => s >= 3  },
  { id: "streak7",   icon: "calendar-outline",  label: "Week Warrior",  desc: "7-day streak",          unlocked: (_, s)         => s >= 7  },
  { id: "streak30",  icon: "bonfire-outline",   label: "Unstoppable",   desc: "30-day streak",         unlocked: (_, s)         => s >= 30 },
  { id: "dialects2", icon: "globe-outline",     label: "Bilingual",     desc: "Start 2 dialects",      unlocked: (_, __, _l, d) => d >= 2  },
  { id: "dialects4", icon: "earth-outline",     label: "Polyglot",      desc: "Start all 4 dialects",  unlocked: (_, __, _l, d) => d >= 4  },
];

// ── Level bar ──────────────────────────────────────────────────────────────────
function LevelBar({ xp }: { xp: number }) {
  const level   = getLevel(xp);
  const nextLvl = LEVELS[LEVELS.indexOf(level) + 1];
  const pct     = nextLvl ? ((xp - level.min) / (nextLvl.min - level.min)) * 100 : 100;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={[s.card, SHADOW.green]}>
      <View style={s.levelRow}>
        <View style={[s.levelIconWrap, { backgroundColor: level.color + "20" }]}>
          <Ionicons name={level.icon} size={20} color={level.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Text style={[s.levelName, { color: level.color }]}>{level.nameEn}</Text>
            <Text style={s.levelBn}>{level.nameBn}</Text>
          </View>
          <View style={s.levelBarBg}>
            <Animated.View
              style={[s.levelBarFill, {
                backgroundColor: level.color,
                width: barAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
              }]}
            />
          </View>
          <Text style={s.levelXpLabel}>
            {xp} XP{nextLvl ? ` · ${nextLvl.min - xp} to ${nextLvl.nameEn}` : " · Max Level!"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── 7-day streak calendar ──────────────────────────────────────────────────────
function StreakCalendar({ streak }: { streak: number }) {
  const days     = ["M", "T", "W", "T", "F", "S", "S"];
  const jsDay    = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  return (
    <View style={s.streakRow}>
      {days.map((day, i) => {
        const daysAgo = (todayIdx - i + 7) % 7;
        const active  = daysAgo < streak;
        const isToday = i === todayIdx;
        return (
          <View key={i} style={s.dayCol}>
            <View style={[
              s.dayDot,
              active  && { backgroundColor: T.red },
              isToday && s.dayDotToday,
              !active && !isToday && { backgroundColor: T.border },
            ]}>
              {active
                ? <Ionicons name="flame" size={13} color={T.white} />
                : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isToday ? T.red : T.border }} />
              }
            </View>
            <Text style={[s.dayLabel, isToday && { color: T.red, fontFamily: FONT.bold }]}>{day}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Dialect progress row ───────────────────────────────────────────────────────
function DialectRow({ dialect, completed, total }: { dialect: Dialect; completed: number; total: number }) {
  const meta = DIALECT_META[dialect];
  const pct  = total > 0 ? Math.round((completed / total) * 100) : 0;
  const barW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barW, { toValue: pct, duration: 700, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={s.dialectRow}>
      <View style={[s.dialectIconWrap, { backgroundColor: meta.color + "18" }]}>
        <Ionicons name={meta.icon} size={18} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.dialectLabelRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[s.dialectName, { color: meta.color }]}>{meta.nameEn}</Text>
            <Text style={[s.dialectNameBn, { color: meta.color + "80" }]}>{meta.nameBn}</Text>
          </View>
          <Text style={s.dialectPct}>{pct}%  <Text style={{ color: T.textMuted as string }}>{completed}/{total}</Text></Text>
        </View>
        <View style={s.dialectBarBg}>
          <Animated.View style={[
            s.dialectBarFill,
            { backgroundColor: meta.color, width: barW.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) },
          ]} />
        </View>
      </View>
    </View>
  );
}

// ── Achievement badge ──────────────────────────────────────────────────────────
function AchievementBadge({ a, unlocked }: { a: Achievement; unlocked: boolean }) {
  return (
    <View style={[s.badge, unlocked ? SHADOW.soft : undefined, !unlocked && s.badgeLocked]}>
      <View style={[s.badgeIcon, { backgroundColor: unlocked ? T.green + "18" : T.border }]}>
        <Ionicons name={a.icon} size={22} color={unlocked ? T.green : T.textMuted as string} />
      </View>
      <Text style={[s.badgeLabel, !unlocked && { color: T.textMuted as string }]} numberOfLines={1}>{a.label}</Text>
      <Text style={[s.badgeDesc,  !unlocked && { color: T.border }]} numberOfLines={2}>{a.desc}</Text>
      {unlocked && (
        <View style={s.badgeCheck}>
          <Ionicons name="checkmark-circle" size={14} color={T.red} />
        </View>
      )}
    </View>
  );
}

// ── Account card ───────────────────────────────────────────────────────────────
function AccountCard() {
  const { user, isAnonymous } = useAuth();
  const router                = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try { await logOut(); } catch {}
    setSigningOut(false);
  }

  if (isAnonymous) {
    return (
      <View style={[s.card, SHADOW.green]}>
        <View style={s.cardHeader}>
          <Ionicons name="person-circle-outline" size={18} color={T.textMuted as string} />
          <Text style={s.cardTitle}>My Account</Text>
        </View>
        <Text style={s.accountAnonymousText}>
          You're learning as a guest. Create a free account to sync your progress across devices and never lose your XP.
        </Text>
        <View style={s.accountBtns}>
          <TouchableOpacity
            style={[s.accountBtn, { backgroundColor: T.green, ...SHADOW.green }]}
            onPress={() => router.push("/auth/register" as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={15} color={T.white} />
            <Text style={s.accountBtnText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.accountBtn, s.accountBtnOutline]}
            onPress={() => router.push("/auth/login" as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={15} color={T.green} />
            <Text style={[s.accountBtnText, { color: T.green }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.card, SHADOW.green]}>
      <View style={s.cardHeader}>
        <Ionicons name="checkmark-circle" size={18} color={T.success} />
        <Text style={s.cardTitle}>My Account</Text>
        <View style={s.syncBadge}>
          <Ionicons name="cloud-done-outline" size={12} color={T.white} />
          <Text style={s.syncBadgeText}>Synced</Text>
        </View>
      </View>
      <Text style={s.accountName}>{user?.displayName ?? "Learner"}</Text>
      <Text style={s.accountEmail}>{user?.email}</Text>
      <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} disabled={signingOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={15} color={T.textMid as string} />
        <Text style={s.signOutText}>{signingOut ? "Signing out…" : "Sign Out"}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const [stats,    setStats]    = useState({ totalXp: 0, currentStreak: 0, hearts: 5 });
  const [progress, setProgress] = useState<Record<Dialect, string[]>>({
    standard: [], sylheti: [], barisali: [], chittagonian: [],
  });
  const [history, setHistory] = useState<LessonAttempt[]>([]);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Promise.all([getStats(), getAllDialectProgress(), getLessonHistory()]).then(([s, p, h]) => {
      setStats(s);
      setProgress(p);
      setHistory(h);
    });
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const dialectTotals = (["standard", "sylheti", "barisali", "chittagonian"] as Dialect[]).map((d) => ({
    dialect:   d,
    completed: progress[d].length,
    total:     getCurriculum(d).units.reduce((s, u) => s + u.lessons.length, 0),
  }));

  const totalLessons    = dialectTotals.reduce((sum, d) => sum + d.completed, 0);
  const dialectsStarted = dialectTotals.filter((d) => d.completed > 0).length;
  const heartsArr       = Array.from({ length: 5 }, (_, i) => i < stats.hearts);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* ── Bhasha-style header ── */}
      <View style={s.header}>
        <Text style={s.headerEyebrow}>THE ACADEMY OF</Text>
        <Text style={s.headerTitle}>DOSSIER</Text>
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>

          {/* ── Avatar + name ── */}
          <View style={s.avatarSection}>
            <View style={s.avatarWrap}>
              <View style={s.avatarCircle}>
                <Ionicons name="person" size={56} color={T.green + "60"} />
              </View>
              <View style={s.avatarBadge}>
                <Ionicons name="star" size={14} color={T.gold} />
              </View>
            </View>
            <Text style={s.userName}>Language Learner</Text>
            <Text style={s.userSub}>Bangladesh · {totalLessons} lessons completed</Text>
          </View>

          {/* ── Stats row ── */}
          <View style={s.statsRow}>
            <View style={[s.statCard, SHADOW.green, { backgroundColor: T.card }]}>
              <Ionicons name="flame" size={24} color={T.red} />
              <Text style={[s.statVal, { color: T.red }]}>{stats.currentStreak}</Text>
              <Text style={s.statLbl}>Day Streak</Text>
            </View>
            <View style={[s.statCard, SHADOW.green, { backgroundColor: T.card }]}>
              <Ionicons name="flash" size={24} color={T.gold} />
              <Text style={[s.statVal, { color: T.gold }]}>{stats.totalXp}</Text>
              <Text style={s.statLbl}>Total XP</Text>
            </View>
            <View style={[s.statCard, SHADOW.green, { backgroundColor: T.card }]}>
              <View style={{ flexDirection: "row", gap: 2, marginBottom: 4 }}>
                {heartsArr.map((full, i) => (
                  <Ionicons key={i} name={full ? "heart" : "heart-outline"} size={13} color={T.red} />
                ))}
              </View>
              <Text style={[s.statVal, { color: T.red }]}>{stats.hearts}</Text>
              <Text style={s.statLbl}>Hearts</Text>
            </View>
          </View>

          {/* ── Level card ── */}
          <LevelBar xp={stats.totalXp} />

          {/* ── Streak calendar ── */}
          <View style={[s.card, SHADOW.soft]}>
            <View style={s.cardHeader}>
              <Ionicons name="calendar-outline" size={16} color={T.red} />
              <Text style={s.cardTitle}>This Week</Text>
            </View>
            <StreakCalendar streak={stats.currentStreak} />
          </View>

          {/* ── Dialect progress ── */}
          <View style={[s.card, SHADOW.soft]}>
            <View style={s.cardHeader}>
              <Ionicons name="globe-outline" size={16} color={T.green} />
              <Text style={s.cardTitle}>Dialect Progress</Text>
            </View>
            {dialectTotals.map(({ dialect, completed, total }) => (
              <DialectRow key={dialect} dialect={dialect} completed={completed} total={total} />
            ))}
          </View>

          {/* ── Merit badges ── */}
          <View style={[s.card, SHADOW.soft]}>
            <View style={s.cardHeader}>
              <Ionicons name="trophy-outline" size={16} color={T.gold} />
              <Text style={s.cardTitle}>Merit Badges</Text>
              <Text style={s.cardSub}>
                {ACHIEVEMENTS.filter((a) => a.unlocked(stats.totalXp, stats.currentStreak, totalLessons, dialectsStarted)).length}
                /{ACHIEVEMENTS.length} unlocked
              </Text>
            </View>
            <View style={s.badgesGrid}>
              {ACHIEVEMENTS.map((a) => (
                <AchievementBadge
                  key={a.id}
                  a={a}
                  unlocked={a.unlocked(stats.totalXp, stats.currentStreak, totalLessons, dialectsStarted)}
                />
              ))}
            </View>
          </View>

          {/* ── Study Guide shortcut ── */}
          <TouchableOpacity
            style={[s.studyGuideBtn, SHADOW.green]}
            onPress={() => router.push("/study-guide" as any)}
            activeOpacity={0.85}
          >
            <View style={s.studyGuideBtnLeft}>
              <View style={s.studyGuideBtnIcon}>
                <Ionicons name="library-outline" size={22} color={T.white} />
              </View>
              <View>
                <Text style={s.studyGuideBtnTitle}>Bengali Study Guide</Text>
                <Text style={s.studyGuideBtnSub}>Alphabet · Numbers · Grammar · Phrases</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={T.green} />
          </TouchableOpacity>

          {/* ── Account card ── */}
          <AccountCard />

          {/* ── Recent activity ── */}
          {history.length > 0 && (
            <View style={[s.card, SHADOW.soft]}>
              <View style={s.cardHeader}>
                <Ionicons name="time-outline" size={16} color={T.green} />
                <Text style={s.cardTitle}>Recent Activity</Text>
              </View>
              <View style={{ gap: 10, marginTop: 4 }}>
                {history.slice(0, 10).map((item, idx) => {
                  const score = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 100;
                  const dialectColors: Record<string, string> = {
                    standard: T.green, sylheti: T.sylheti,
                    barisali: T.barisali, chittagonian: T.chittagonian,
                  };
                  const color   = dialectColors[item.dialect] ?? T.green;
                  const date    = new Date(item.date);
                  const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                  return (
                    <View key={idx} style={s.historyRow}>
                      <View style={[s.historyDot, { backgroundColor: color + "20" }]}>
                        <Ionicons
                          name={item.isQuiz ? "ribbon-outline" : "book-outline"}
                          size={16} color={color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.historyTitle} numberOfLines={1}>{item.lessonTitle}</Text>
                        <Text style={s.historySub}>
                          {item.dialect.charAt(0).toUpperCase() + item.dialect.slice(1)} · {dateStr}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[s.historyScore, { color }]}>{score}%</Text>
                        <Text style={s.historyXp}>+{item.xpEarned} XP</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Footer quote ── */}
          <View style={[s.footerCard, SHADOW.green]}>
            <Text style={s.footerBn}>আমরা বাংলা ভালোবাসি</Text>
            <View style={s.footerLine} />
            <Text style={s.footerEn}>We love Bengali · spoken by 230 million people worldwide</Text>
          </View>

          <View style={{ height: 24 }} />
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.bg },

  // Header
  header: {
    backgroundColor:   T.bg,
    borderBottomWidth: 2, borderBottomColor: T.border,
    paddingHorizontal: 20, paddingVertical: 16,
    alignItems: "center",
  },
  headerEyebrow: { ...MICRO as any, color: T.textMid as string, marginBottom: 2 },
  headerTitle:   { fontFamily: FONT.bold, fontSize: 22, color: T.green, letterSpacing: 0.5 },

  scroll: { padding: 16, paddingBottom: 40 },

  // Avatar
  avatarSection: { alignItems: "center", paddingVertical: 24, marginBottom: 4 },
  avatarWrap:    { position: "relative", marginBottom: 12 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: T.red,
    backgroundColor: T.card,
    alignItems: "center", justifyContent: "center",
    ...SHADOW.red,
  },
  avatarBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: T.red, borderWidth: 2, borderColor: T.white,
    alignItems: "center", justifyContent: "center",
  },
  userName: { fontFamily: FONT.bold, fontSize: 22, color: T.red, fontStyle: "italic" },
  userSub:  { fontFamily: FONT.medium, fontSize: 13, color: T.textMid as string, marginTop: 2 },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: "center",
    borderWidth: 2, borderColor: T.border,
  },
  statVal: { fontFamily: FONT.bold, fontSize: 24, marginTop: 4 },
  statLbl: { ...MICRO as any, marginTop: 3, color: T.textMid as string },

  // Generic card
  card: {
    backgroundColor: T.white, borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 2, borderColor: T.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 14 },
  cardTitle:  { fontFamily: FONT.bold, fontSize: 14, color: T.green, flex: 1 },
  cardSub:    { fontFamily: FONT.medium, fontSize: 11, color: T.textMid as string },

  // Level bar (reuses card style)
  levelRow:     { flexDirection: "row", alignItems: "center" },
  levelIconWrap:{ width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  levelName:    { fontFamily: FONT.bold, fontSize: 17 },
  levelBn:      { fontFamily: FONT.medium, fontSize: 13, color: T.textMid as string },
  levelBarBg:   { height: 8, backgroundColor: T.border, borderRadius: 4, overflow: "hidden" },
  levelBarFill: { height: 8, borderRadius: 4 },
  levelXpLabel: { fontFamily: FONT.medium, fontSize: 11, color: T.textMid as string, marginTop: 5 },

  // Streak calendar
  streakRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCol:    { alignItems: "center", gap: 5 },
  dayDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: T.border,
  },
  dayDotToday: { borderWidth: 2, borderColor: T.red, backgroundColor: T.red + "15" },
  dayLabel:    { fontFamily: FONT.medium, fontSize: 10, color: T.textMid as string },

  // Dialect rows
  dialectRow:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  dialectIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  dialectLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  dialectName:     { fontFamily: FONT.bold, fontSize: 14 },
  dialectNameBn:   { fontFamily: FONT.regular, fontSize: 11 },
  dialectPct:      { fontFamily: FONT.bold, fontSize: 13, color: T.green },
  dialectBarBg:    { height: 6, backgroundColor: T.border, borderRadius: 3, overflow: "hidden" },
  dialectBarFill:  { height: 6, borderRadius: 3 },

  // Merit badges grid
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    width: "30%", borderRadius: 12, padding: 10,
    backgroundColor: T.white, alignItems: "center",
    borderWidth: 2, borderColor: T.border,
    position: "relative",
  },
  badgeLocked: { backgroundColor: T.bg, opacity: 0.55 },
  badgeIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  badgeLabel: { fontFamily: FONT.bold, fontSize: 10, color: T.green, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 },
  badgeDesc:  { fontFamily: FONT.regular, fontSize: 9, color: T.textMid as string, textAlign: "center", marginTop: 2, lineHeight: 13 },
  badgeCheck: { position: "absolute", top: 6, right: 6 },

  // Account card
  accountAnonymousText: { fontFamily: FONT.regular, fontSize: 13, color: T.textMid as string, lineHeight: 20, marginBottom: 14 },
  accountBtns:     { flexDirection: "row", gap: 10 },
  accountBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  accountBtnOutline: { borderWidth: 2, borderColor: T.green, backgroundColor: T.white },
  accountBtnText:    { fontFamily: FONT.bold, fontSize: 13, color: T.white },
  accountName:  { fontFamily: FONT.bold, fontSize: 16, color: T.green, marginBottom: 2 },
  accountEmail: { fontFamily: FONT.medium, fontSize: 13, color: T.textMid as string, marginBottom: 12 },
  syncBadge: {
    backgroundColor: T.success, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  syncBadgeText: { fontFamily: FONT.bold, color: T.white, fontSize: 10 },
  signOutBtn:    { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: T.border },
  signOutText:   { fontFamily: FONT.medium, fontSize: 14, color: T.textMid as string },

  // Study Guide shortcut
  studyGuideBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: T.white,
    borderWidth: 2, borderColor: T.green,
    borderRadius: 14, padding: 14, marginBottom: 14,
  },
  studyGuideBtnLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  studyGuideBtnIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: T.green, alignItems: "center", justifyContent: "center",
  },
  studyGuideBtnTitle: { fontFamily: FONT.bold, fontSize: 14, color: T.green },
  studyGuideBtnSub:   { fontFamily: FONT.medium, fontSize: 11, color: T.textMid as string, marginTop: 2 },

  // Recent activity
  historyRow:  { flexDirection: "row", alignItems: "center", gap: 10 },
  historyDot:  { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  historyTitle:{ fontFamily: FONT.bold, fontSize: 13, color: T.green },
  historySub:  { fontFamily: FONT.medium, fontSize: 11, color: T.textMid as string, marginTop: 1 },
  historyScore:{ fontFamily: FONT.bold, fontSize: 13 },
  historyXp:   { fontFamily: FONT.medium, fontSize: 11, color: T.textMid as string },

  // Footer
  footerCard: {
    backgroundColor: T.green, borderRadius: 14, padding: 20, marginBottom: 14,
    alignItems: "center", borderWidth: 2, borderColor: T.green,
  },
  footerBn:   { fontFamily: FONT.bold, color: T.white, fontSize: 20, textAlign: "center", marginBottom: 8 },
  footerLine: { width: 32, height: 2, backgroundColor: T.gold, marginBottom: 8 },
  footerEn:   { fontFamily: FONT.medium, color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "center" },
});
