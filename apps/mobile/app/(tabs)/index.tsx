import React, { useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Animated, Dimensions,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { getCurriculum } from "@bangla-learn/content";
import { DIALECTS } from "@bangla-learn/types";
import type { Dialect, Lesson } from "@bangla-learn/types";
import {
  getActiveDialect, getCompletedLessons, setActiveDialect,
  getStats, getDailyProgress,
} from "@/lib/storage";
import SpeakButton from "@/components/SpeakButton";
import { T, SHADOW, FONT, MICRO } from "@/lib/theme";
import { trackScreenView, trackDialectSelect } from "@/lib/analytics";

const SCREEN_W      = Dimensions.get("window").width;
const MAP_COMPACT_W = Math.floor(SCREEN_W * 0.46) - 4;
type IoniconsName   = React.ComponentProps<typeof Ionicons>["name"];

// ── Bangladesh border outline ──────────────────────────────────────────────────
// viewBox "0 0 300 380"  (15px padding, scale ≈ 58.4 px/deg)
// Generated from Natural Earth GeoJSON (1832 pts) simplified with
// Ramer-Douglas-Peucker ε=0.08° → 107 pts.
// lon_min=88.022  lat_max=26.624
// x = 15 + (lon − 88.022) × 58.43
// y = 18 + (26.624 − lat) × 58.43
const BD_OUTLINE =
  "M 281,290 L 284,330 L 266,320 L 258,329 L 266,362 " +
  "L 245,321 L 249,305 L 242,301 L 237,278 L 242,263 " +
  "L 235,274 L 216,244 L 218,235 L 208,247 L 200,246 " +
  "L 201,256 L 190,248 L 186,254 L 167,226 L 166,204 " +
  "L 172,199 L 166,201 L 166,194 L 158,196 L 163,207 " +
  "L 145,203 L 166,216 L 157,227 L 162,236 L 152,244 " +
  "L 159,247 L 156,259 L 161,254 L 166,261 L 163,276 " +
  "L 154,283 L 154,271 L 147,297 L 132,296 L 145,278 " +
  "L 127,288 L 123,272 L 131,260 L 123,264 L 119,284 " +
  "L 124,295 L 114,298 L 110,293 L 113,301 L 106,306 " +
  "L 109,269 L 103,289 L 100,271 L 99,301 L 94,303 " +
  "L 93,290 L 84,308 L 63,231 L 70,218 L 54,215 " +
  "L 59,201 L 45,192 L 47,180 L 55,176 L 57,155 " +
  "L 42,153 L 15,134 L 20,118 L 33,120 L 40,102 " +
  "L 68,103 L 71,96 L 19,64 L 23,46 L 43,34 " +
  "L 32,27 L 36,18 L 52,30 L 52,39 L 73,41 " +
  "L 66,32 L 75,32 L 79,46 L 92,55 L 104,57 " +
  "L 110,42 L 121,56 L 120,96 L 152,104 L 249,102 " +
  "L 276,117 L 260,119 L 254,148 L 242,152 L 240,162 " +
  "L 232,158 L 210,166 L 197,188 L 207,224 L 212,214 " +
  "L 223,233 L 235,225 L 232,214 L 244,201 L 243,188 " +
  "L 263,189 L 281,289 Z";

type DivMeta = {
  id: string; nameEn: string; nameBn: string;
  dialect: Dialect; color: string; icon: IoniconsName;
  cx: number; cy: number; primary: boolean;
};

const DIVISIONS: DivMeta[] = [
  { id: "rangpur",    nameEn: "Rangpur",    nameBn: "রংপুর",     dialect: "standard",     color: T.green,          icon: "nutrition-outline", cx: 88,  cy: 70,  primary: false },
  { id: "rajshahi",   nameEn: "Rajshahi",   nameBn: "রাজশাহী",   dialect: "rajshahi",     color: "#16a34a",        icon: "rose-outline",      cx: 48,  cy: 150, primary: true  },
  { id: "sylhet",     nameEn: "Sylhet",     nameBn: "সিলেট",     dialect: "sylheti",      color: T.sylheti,        icon: "cafe-outline",      cx: 240, cy: 119, primary: true  },
  { id: "mymensingh", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ",  dialect: "standard",     color: T.green,          icon: "leaf-outline",      cx: 155, cy: 128, primary: false },
  { id: "dhaka",      nameEn: "Dhaka",      nameBn: "ঢাকা",      dialect: "standard",     color: T.green,          icon: "business-outline",  cx: 155, cy: 188, primary: true  },
  { id: "khulna",     nameEn: "Khulna",     nameBn: "খুলনা",     dialect: "khulna",       color: "#0891b2",        icon: "water-outline",     cx: 105, cy: 241, primary: true  },
  { id: "barisal",    nameEn: "Barisal",    nameBn: "বরিশাল",    dialect: "barisali",     color: T.barisali,       icon: "boat-outline",      cx: 152, cy: 247, primary: true  },
  { id: "chittagong", nameEn: "Chittagong", nameBn: "চট্টগ্রাম", dialect: "chittagonian", color: T.chittagonian,   icon: "navigate-outline",  cx: 238, cy: 267, primary: true  },
];

const DIALECT_INFO: Record<Dialect, {
  nameBn: string; tagline: string; color: string; region: string;
  phrase: { bangla: string; roman: string; english: string };
  tip: string;
}> = {
  standard: {
    nameBn: "মান বাংলা", color: T.green, region: "Dhaka · Central",
    tagline: "Official language of Bangladesh · 170M+ speakers",
    phrase: { bangla: "কেমন আছেন?", roman: "Kemon achen?", english: "How are you?" },
    tip: "Verb goes at the END: আমি ভাত খাই = I rice eat",
  },
  sylheti: {
    nameBn: "সিলেটি", color: T.sylheti, region: "Sylhet · Northeast",
    tagline: "Sylhet Division + UK diaspora · ~11M speakers",
    phrase: { bangla: "ভালা আসেন?", roman: "Bhala assen?", english: "Are you well?" },
    tip: "হে = He/She · আফা = Sister · হই = Yes · কিতা = What",
  },
  barisali: {
    nameBn: "বরিশালি", color: T.barisali, region: "Barisal · South",
    tagline: "Barisal Division · ~9M speakers · musical dialect",
    phrase: { bangla: "কই যাও?", roman: "Koi jao?", english: "Where are you going?" },
    tip: "কই = Where · হেই = He/She · কেমুন = How · বাপ = Father",
  },
  chittagonian: {
    nameBn: "চাটগাঁইয়া", color: T.chittagonian, region: "Chittagong · Southeast",
    tagline: "Chittagong Division · ~13M speakers · ancient dialect",
    phrase: { bangla: "আঁই যাই", roman: "Ai jai", english: "I am going" },
    tip: "আঁই = I (not আমি!) · তুঁই = You · আঁরা = We · বোইন = Sister",
  },
  rajshahi: {
    nameBn: "রাজশাহী", color: "#16a34a", region: "Rajshahi · Northwest",
    tagline: "Rajshahi Division · silk, mangoes & soft spoken forms",
    phrase: { bangla: "তোমার নাম কী?", roman: "Tomar nam ki?", english: "What is your name?" },
    tip: "সে = He/She · তারা = They · Standard-compatible forms · বোন = Sister",
  },
  khulna: {
    nameBn: "খুলনা", color: "#0891b2", region: "Khulna · Southwest Delta",
    tagline: "Khulna Division · Sundarbans gateway · paired regional/standard forms",
    phrase: { bangla: "আমি আইতেছি।", roman: "Ami aitesi.", english: "I am coming." },
    tip: "আপনে = polite you · -তেছি = progressive · বইন/বোন · বাবা/বাপ",
  },
};

// ── Interactive Bangladesh Map ─────────────────────────────────────────────────
function InteractiveMap({ activeDialect, onSelect, mapW }: {
  activeDialect: Dialect; onSelect: (d: Dialect) => void; mapW: number;
}) {
  const mapH = Math.floor(mapW * (380 / 300));

  return (
    <View style={{ width: mapW, height: mapH, borderRadius: 12, overflow: "hidden", borderWidth: 2, borderColor: T.border }}>
      <Svg width={mapW} height={mapH} viewBox="0 0 300 380">
        <Path
          d={BD_OUTLINE}
          fill={T.card}
          stroke={T.green}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {DIVISIONS.map((d) => {
          const isActive  = d.dialect === activeDialect;
          const isPrimary = d.primary;
          return (
            <Circle
              key={d.id}
              cx={d.cx} cy={d.cy}
              r={isActive && isPrimary ? 22 : isPrimary ? 18 : 10}
              fill={isActive ? d.color : d.color + (isPrimary ? "35" : "20")}
              stroke={d.color}
              strokeWidth={isActive ? 3 : isPrimary ? 2 : 1}
              opacity={isPrimary ? 1 : 0.55}
            />
          );
        })}
      </Svg>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {DIVISIONS.map((d) => {
          const isActive = d.dialect === activeDialect;
          const x  = (d.cx / 300) * mapW;
          const y  = (d.cy / 380) * mapH;
          const sz = d.primary ? (isActive ? 44 : 36) : 20;
          return (
            <TouchableOpacity
              key={d.id}
              onPress={() => onSelect(d.dialect)}
              activeOpacity={0.7}
              style={{
                position: "absolute", left: x - sz / 2, top: y - sz / 2,
                width: sz, height: sz,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons
                name={d.icon}
                size={isActive ? 15 : d.primary ? 13 : 9}
                color={isActive ? T.white : d.color}
              />
              {d.primary && (
                <Text style={{
                  fontSize: isActive ? 7 : 6, fontFamily: FONT.bold,
                  color: isActive ? T.white : d.color,
                  position: "absolute", bottom: isActive ? -10 : -8,
                  width: 60, textAlign: "center",
                }}>
                  {d.nameEn}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Dialect info card ──────────────────────────────────────────────────────────
function DialectCard({ dialect, onGuide }: { dialect: Dialect; onGuide: () => void }) {
  const info      = DIALECT_INFO[dialect];
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(20); fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 100, useNativeDriver: true }),
    ]).start();
  }, [dialect]);

  return (
    <Animated.View style={[
      s.dialectCard,
      { borderColor: info.color, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      SHADOW.green,
    ]}>
      <View style={s.dialectCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={[s.dialectEnTitle, { color: info.color }]}>{DIALECTS[dialect].label}</Text>
          <Text style={[s.dialectBnSub, { color: info.color + "99" }]}>{info.region}</Text>
          <Text style={s.dialectTagline}>{info.tagline}</Text>
        </View>
        <TouchableOpacity
          style={[s.guideBtn, { backgroundColor: info.color, ...SHADOW.soft }]}
          onPress={onGuide}
          activeOpacity={0.8}
        >
          <Ionicons name="book-outline" size={13} color={T.white} />
          <Text style={s.guideBtnText}>Guide</Text>
        </TouchableOpacity>
      </View>

      <View style={[s.phraseRow, { backgroundColor: info.color + "0d", borderColor: info.color + "30" }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.phraseEnglish}>{info.phrase.english}</Text>
          <Text style={[s.phraseBangla, { color: info.color }]}>{info.phrase.bangla}</Text>
          <Text style={s.phraseRoman}>/{info.phrase.roman}/</Text>
        </View>
        <SpeakButton text={info.phrase.bangla} dialect={dialect} size={22} color={info.color} />
      </View>

      <View style={s.tipRow}>
        <Ionicons name="bulb-outline" size={14} color="#d97706" />
        <Text style={s.tipText}>{info.tip}</Text>
      </View>
    </Animated.View>
  );
}

// ── Lesson icon ────────────────────────────────────────────────────────────────
function lessonIcon(title: string): IoniconsName {
  const t = title.toLowerCase();
  if (t.includes("hello") || t.includes("greeting") || t.includes("phrase")) return "chatbubble-outline";
  if (t.includes("how are"))   return "happy-outline";
  if (t.includes("number"))    return "calculator-outline";
  if (t.includes("family"))    return "people-outline";
  if (t.includes("bangladesh")) return "flag-outline";
  if (t.includes("food") || t.includes("rice")) return "restaurant-outline";
  if (t.includes("travel"))    return "bicycle-outline";
  return "book-outline";
}

// ── Daily goal card ────────────────────────────────────────────────────────────
function DailyGoalCard({ xpToday, goal, done }: { xpToday: number; goal: number; done: boolean }) {
  const pct      = Math.min(100, goal > 0 ? (xpToday / goal) * 100 : 0);
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: pct, duration: 600, delay: 300, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={[s.goalCard, done && s.goalCardDone, SHADOW.green]}>
      <View style={s.goalRow}>
        <View style={s.goalLeft}>
          <Ionicons name={done ? "trophy" : "flag-outline"} size={28} color={done ? T.success : T.gold} />
          <View>
            <Text style={s.goalTitle}>{done ? "Daily goal complete!" : "Daily goal"}</Text>
            <Text style={s.goalSub}>{xpToday} / {goal} XP earned today</Text>
          </View>
        </View>
        <Text style={[s.goalPct, done && { color: T.success }]}>{Math.round(pct)}%</Text>
      </View>
      <View style={s.goalBarBg}>
        <Animated.View
          style={[s.goalBarFill, {
            width: fillAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
            backgroundColor: done ? T.success : T.gold,
          }]}
        />
      </View>
    </View>
  );
}

// ── Lesson card ────────────────────────────────────────────────────────────────
function LessonCard({ lesson, isCompleted, isCurrent, isLocked, unitColor, dialect, router, index }: {
  lesson: Lesson; isCompleted: boolean; isCurrent: boolean; isLocked: boolean;
  unitColor: string; dialect: Dialect; router: ReturnType<typeof useRouter>; index: number;
}) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, delay: index * 55, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay: index * 55, friction: 8, tension: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  // Continuous pulse on the active lesson (like Bhasha Academy pulsing node)
  useEffect(() => {
    pulseLoop.current?.stop();
    if (isCurrent) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 750, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 750, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => { pulseLoop.current?.stop(); };
  }, [isCurrent]);

  const icon: IoniconsName = isLocked ? "lock-closed"
    : isCompleted ? "checkmark-circle"
    : lesson.isTrace ? "pencil"
    : lesson.isQuiz  ? "ribbon"
    : lessonIcon(lesson.title);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: pulseAnim }] }}>
      <TouchableOpacity
        onPress={() => !isLocked && router.push(`/lesson/${lesson.id}?dialect=${dialect}` as any)}
        disabled={isLocked}
        activeOpacity={0.75}
        style={[
          s.lessonCard,
          isCurrent  && { borderColor: unitColor, ...SHADOW.green },
          isCompleted && { borderColor: unitColor + "80" },
          isLocked   && s.lessonCardLocked,
        ]}
      >
        {/* Left accent bar */}
        <View style={[s.lessonAccent, { backgroundColor: isLocked ? T.border : unitColor }]} />

        {/* Icon circle */}
        <View style={[
          s.lessonIconWrap,
          { backgroundColor: isLocked ? T.border : isCompleted ? unitColor : unitColor + "20" },
        ]}>
          <Ionicons
            name={icon}
            size={22}
            color={isLocked ? T.textMuted as string : isCompleted ? T.white : unitColor}
          />
        </View>

        {/* Text */}
        <View style={{ flex: 1, paddingVertical: 14 }}>
          <Text style={[s.lessonTitle, { color: isLocked ? T.textMuted as string : T.green }]}>
            {lesson.title}
          </Text>
          <View style={s.lessonMeta}>
            {lesson.isTrace && !isLocked && (
              <View style={[s.lessonTag, { backgroundColor: unitColor + "18" }]}>
                <Ionicons name="create-outline" size={10} color={unitColor} />
                <Text style={[s.lessonTagText, { color: unitColor }]}>Letters</Text>
              </View>
            )}
            {lesson.isQuiz && !isLocked && (
              <View style={[s.lessonTag, { backgroundColor: unitColor + "18" }]}>
                <Ionicons name="clipboard-outline" size={10} color={unitColor} />
                <Text style={[s.lessonTagText, { color: unitColor }]}>Quiz</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              {isCompleted && <Ionicons name="star" size={11} color={T.gold} />}
              <Text style={s.lessonXp}>{lesson.xpReward} XP</Text>
            </View>
          </View>
        </View>

        {/* Right action */}
        <View style={{ paddingRight: 14, alignItems: "center" }}>
          {isCurrent && (
            <View style={[s.startChip, { backgroundColor: unitColor, ...SHADOW.soft }]}>
              <Text style={s.startChipText}>START</Text>
            </View>
          )}
          {isCompleted && !isCurrent && (
            <Ionicons name="checkmark-circle" size={22} color={unitColor} />
          )}
          {isLocked && (
            <Ionicons name="lock-closed" size={16} color={T.border} />
          )}
          {!isCurrent && !isCompleted && !isLocked && (
            <Ionicons name="chevron-forward" size={18} color={unitColor + "80"} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [dialect,   setDialect]   = useState<Dialect>("standard");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [streak,    setStreak]    = useState(0);
  const [hearts,    setHearts]    = useState(5);
  const [totalXp,   setTotalXp]   = useState(0);
  const [dailyXp,   setDailyXp]   = useState(0);
  const [dailyGoal, setDailyGoal] = useState(50);
  const [dailyDone, setDailyDone] = useState(false);

  const headerY     = useRef(new Animated.Value(-80)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const d       = await getActiveDialect();
        setDialect(d);
        const completed = await getCompletedLessons(d);
        setCompletedIds(new Set(completed));
        const stats   = await getStats();
        setStreak(stats.currentStreak);
        setHearts(stats.hearts);
        setTotalXp(stats.totalXp);
        const daily   = await getDailyProgress();
        setDailyXp(daily.xpToday);
        setDailyGoal(daily.goal);
        setDailyDone(daily.done);
      })();
      // Only animate on true first mount (values already at 0)
      Animated.parallel([
        Animated.spring(headerY,     { toValue: 0, friction: 8, tension: 100, useNativeDriver: true }),
        Animated.timing(contentFade, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
      ]).start();
      trackScreenView("home");
    }, [])
  );

  async function switchDialect(d: Dialect) {
    trackDialectSelect(d);
    await setActiveDialect(d);
    setDialect(d);
    const completed = await getCompletedLessons(d);
    setCompletedIds(new Set(completed));
  }

  const curriculum = getCurriculum(dialect);

  // First unlocked-but-incomplete lesson
  let currentLessonId: string | null = null;
  outer: for (const unit of curriculum.units) {
    for (let i = 0; i < unit.lessons.length; i++) {
      const l = unit.lessons[i];
      if (!completedIds.has(l.id)) {
        const prevDone = i === 0 || completedIds.has(unit.lessons[i - 1].id);
        if (prevDone) { currentLessonId = l.id; break outer; }
      }
    }
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* ── Bhasha Academy header ── */}
      <Animated.View style={[s.header, { transform: [{ translateY: headerY }] }]}>
        {/* Left: hearts + streak */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          <View style={s.headerPill}>
            <Ionicons name="heart" size={16} color={T.red} />
            <Text style={[s.headerPillText, { color: T.red }]}>{hearts}</Text>
          </View>
          <View style={[s.headerPill, { backgroundColor: "#fff7ed" }]}>
            <Text style={{ fontSize: 14 }}>🔥</Text>
            <Text style={[s.headerPillText, { color: "#d97706" }]}>{streak}</Text>
          </View>
        </View>

        {/* Centered branding */}
        <View style={s.headerCenter}>
          <Text style={s.headerEyebrow}>THE ACADEMY OF</Text>
          <Text style={s.headerTitle}>BENGALI LETTERS</Text>
        </View>

        {/* XP pill (right) */}
        <View style={[s.headerPill, s.headerPillGold]}>
          <Ionicons name="flash" size={16} color={T.gold} />
          <Text style={[s.headerPillText, { color: T.green }]}>{totalXp}</Text>
        </View>
      </Animated.View>

      {/* ── Scrollable content ── */}
      <Animated.View style={{ flex: 1, opacity: contentFade }}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >

          {/* ── Bangladesh map + dialect legend ── */}
          <View style={s.mapSection}>
            <Text style={s.mapLabel}>Tap a region to choose your dialect</Text>
            <View style={s.mapRow}>
              <InteractiveMap activeDialect={dialect} onSelect={switchDialect} mapW={MAP_COMPACT_W} />
              <View style={s.legendBox}>
                {(Object.keys(DIALECT_INFO) as Dialect[]).map((d) => {
                  const inf      = DIALECT_INFO[d];
                  const isActive = d === dialect;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => switchDialect(d)}
                      activeOpacity={0.75}
                      style={[
                        s.legendItem,
                        isActive && { backgroundColor: inf.color + "12", borderColor: inf.color },
                      ]}
                    >
                      <View style={[s.legendDot, { backgroundColor: inf.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.legendName, { color: isActive ? inf.color : T.green }]}>
                          {DIALECTS[d].label}
                        </Text>
                        <Text style={s.legendSub}>{inf.region}</Text>
                      </View>
                      {isActive && <Ionicons name="checkmark-circle" size={13} color={inf.color} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <DialectCard dialect={dialect} onGuide={() => router.push(`/dialect/${dialect}` as any)} />
          </View>

          {/* ── Daily goal ── */}
          <View style={{ marginHorizontal: 16, marginTop: 16 }}>
            <DailyGoalCard xpToday={dailyXp} goal={dailyGoal} done={dailyDone} />
          </View>

          {/* ── Units & lesson cards ── */}
          {curriculum.units.map((unit) => {
            const done     = unit.lessons.filter((l) => completedIds.has(l.id)).length;
            const complete = done === unit.lessons.length;
            const pct      = unit.lessons.length > 0 ? (done / unit.lessons.length) * 100 : 0;
            const totalUnitXp = unit.lessons.reduce((s, l) => s + l.xpReward, 0);

            return (
              <View key={unit.id} style={{ marginBottom: 6 }}>

                {/* Unit header banner */}
                <View style={[s.unitBanner, { backgroundColor: unit.color }]}>
                  <View style={s.unitBannerTop}>
                    <View style={{ flex: 1 }}>
                      <View style={s.unitLevelRow}>
                        <Text style={s.unitLevel}>LEVEL {unit.order}</Text>
                        <View style={s.unitDiffBadge}>
                          <Text style={s.unitDiffText}>
                            {unit.order === 1 ? "Beginner" : unit.order === 2 ? "Elementary" : "Intermediate"}
                          </Text>
                        </View>
                      </View>
                      <Text style={s.unitTitle}>{unit.title}</Text>
                      <Text style={s.unitDesc}>{unit.description}</Text>
                    </View>
                    <View style={s.unitRing}>
                      {complete
                        ? <Ionicons name="trophy" size={22} color={T.white} />
                        : <Text style={s.unitRingNum}>{done}/{unit.lessons.length}</Text>
                      }
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={s.progressLabel}>{done}/{unit.lessons.length} lessons · {totalUnitXp} XP total</Text>

                  {unit.prep && (
                    <TouchableOpacity
                      style={s.prepBtn}
                      onPress={() => router.push(`/prep/${unit.id}?dialect=${dialect}` as any)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="school-outline" size={14} color={unit.color} />
                      <Text style={[s.prepBtnText, { color: unit.color }]}>
                        Study First: Letters, Words & Grammar
                      </Text>
                      <Ionicons name="chevron-forward" size={13} color={unit.color} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Lesson cards */}
                <View style={s.cardList}>
                  {unit.lessons.map((lesson, idx) => {
                    const isCompleted = completedIds.has(lesson.id);
                    const prevDone    = idx === 0 || completedIds.has(unit.lessons[idx - 1].id);
                    const isLocked    = !isCompleted && !prevDone;
                    const isCurrent   = lesson.id === currentLessonId;
                    return (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isLocked={isLocked}
                        unitColor={unit.color}
                        dialect={dialect}
                        router={router}
                        index={idx}
                      />
                    );
                  })}

                  {complete && (
                    <View style={[s.completeBanner, { backgroundColor: unit.color + "18", borderColor: unit.color }]}>
                      <Ionicons name="trophy" size={22} color={unit.color} />
                      <View>
                        <Text style={[s.completeBannerTitle, { color: unit.color }]}>Level Complete!</Text>
                        <Text style={s.completeBannerSub}>{totalUnitXp} XP earned</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // ── Header ──
  header: {
    backgroundColor:    T.bg,
    borderBottomWidth:  2,
    borderBottomColor:  T.border,
    flexDirection:      "row",
    alignItems:         "center",
    justifyContent:     "space-between",
    paddingHorizontal:  16,
    paddingVertical:    12,
  },
  headerPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 2, borderColor: T.green,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: T.white,
  },
  headerPillGold: { borderColor: T.gold, backgroundColor: T.gold + "20" },
  headerPillText: { fontFamily: FONT.bold, fontSize: 14 },
  headerCenter:   { alignItems: "center" },
  headerEyebrow: {
    fontFamily: FONT.bold, fontSize: 9,
    color: T.textMid as string,
    textTransform: "uppercase", letterSpacing: 2,
  },
  headerTitle: {
    fontFamily: FONT.bold, fontSize: 16,
    color: T.green, letterSpacing: 0.5,
  },

  // ── Map section ──
  mapSection: {
    backgroundColor:      T.white,
    paddingHorizontal:    16, paddingTop: 14, paddingBottom: 16,
    borderBottomWidth:    2, borderBottomColor: T.border,
  },
  mapLabel: {
    fontFamily: FONT.bold, fontSize: 10, color: T.textMid as string,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
  },
  mapRow:    { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  legendBox: { flex: 1, gap: 6 },
  legendItem: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 7, paddingHorizontal: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: T.border,
    backgroundColor: T.white,
  },
  legendDot:  { width: 9, height: 9, borderRadius: 4.5 },
  legendName: { fontFamily: FONT.bold, fontSize: 11, flexShrink: 1, flexWrap: "wrap" },
  legendSub:  { fontFamily: FONT.medium, fontSize: 8.5, color: T.textMuted as string, marginTop: 1, flexShrink: 1, flexWrap: "wrap" },

  // ── Dialect card ──
  dialectCard: {
    borderRadius: 14, borderWidth: 2, backgroundColor: T.white, padding: 14,
    marginTop: 2,
  },
  dialectCardTop:    { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  dialectEnTitle:    { fontFamily: FONT.bold, fontSize: 20, marginBottom: 1 },
  dialectBnSub:      { fontFamily: FONT.medium, fontSize: 11, marginBottom: 3 },
  dialectTagline:    { fontFamily: FONT.regular, fontSize: 11, color: T.textMid as string, lineHeight: 16 },
  guideBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  guideBtnText:  { fontFamily: FONT.bold, color: T.white, fontSize: 12 },
  phraseRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 10,
  },
  phraseEnglish: { fontFamily: FONT.bold, fontSize: 14, color: T.green, marginBottom: 4 },
  phraseBangla:  { fontFamily: FONT.bold, fontSize: 18, marginBottom: 1 },
  phraseRoman:   { fontFamily: FONT.medium, fontSize: 11, color: T.textMid as string },
  tipRow:        { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  tipText:       { fontFamily: FONT.regular, fontSize: 12, color: T.textMid as string, flex: 1, lineHeight: 18 },

  // ── Daily goal ──
  goalCard: {
    backgroundColor: "#fffbeb", borderRadius: 14,
    padding: 16, borderWidth: 2, borderColor: T.gold,
  },
  goalCardDone: { backgroundColor: "#f0fdf4", borderColor: T.success },
  goalRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  goalLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  goalEmoji: { fontSize: 26 },
  goalTitle: { fontFamily: FONT.bold, fontSize: 14, color: T.green },
  goalSub:   { fontFamily: FONT.medium, fontSize: 12, color: T.textMid as string, marginTop: 1 },
  goalPct:   { fontFamily: FONT.bold, fontSize: 16, color: T.gold },
  goalBarBg: { height: 8, backgroundColor: T.border, borderRadius: 4, overflow: "hidden", borderWidth: 1, borderColor: T.border },
  goalBarFill: { height: 8, borderRadius: 4 },

  // ── Unit banner ──
  unitBanner:    { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  unitBannerTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14, gap: 10 },
  unitLevelRow:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  unitLevel:     { fontFamily: FONT.bold, color: "rgba(255,255,255,0.75)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 },
  unitDiffBadge: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  unitDiffText:  { fontFamily: FONT.bold, color: T.white, fontSize: 10 },
  unitTitle:     { fontFamily: FONT.bold, color: T.white, fontSize: 22 },
  unitDesc:      { fontFamily: FONT.regular, color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4, lineHeight: 18 },
  unitRing: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
  },
  unitRingNum:  { fontFamily: FONT.bold, color: T.white, fontSize: 14 },
  progressBg:   { height: 7, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: 7, backgroundColor: T.white, borderRadius: 4 },
  progressLabel:{ fontFamily: FONT.medium, color: "rgba(255,255,255,0.75)", fontSize: 11 },
  prepBtn: {
    marginTop: 12, backgroundColor: T.white, borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 14,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  prepBtnText: { fontFamily: FONT.bold, fontSize: 13, flex: 1 },

  // ── Lesson cards ──
  cardList: {
    backgroundColor: T.bg,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, gap: 10,
  },
  lessonCard: {
    backgroundColor: T.white, borderRadius: 14,
    flexDirection: "row", alignItems: "center",
    overflow: "hidden",
    borderWidth: 2, borderColor: T.border,
  },
  lessonCardLocked: { opacity: 0.5 },
  lessonAccent:  { width: 5, alignSelf: "stretch" },
  lessonIconWrap: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
    margin: 12, marginRight: 10,
  },
  lessonTitle:   { fontFamily: FONT.bold, fontSize: 15, marginBottom: 5, flexShrink: 1 },
  lessonMeta:    { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  lessonTag:     { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 3 },
  lessonTagText: { fontFamily: FONT.bold, fontSize: 10 },
  lessonXp:      { fontFamily: FONT.medium, fontSize: 11, color: T.textMuted as string, flexShrink: 1 },
  startChip: {
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  startChipText: { fontFamily: FONT.bold, color: T.white, fontSize: 12, letterSpacing: 1 },

  // ── Unit complete banner ──
  completeBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 2,
    paddingVertical: 14, paddingHorizontal: 18, marginTop: 4,
  },
  completeBannerTitle: { fontFamily: FONT.bold, fontSize: 16 },
  completeBannerSub:   { fontFamily: FONT.medium, fontSize: 12, color: T.textMid as string, marginTop: 2 },
});
