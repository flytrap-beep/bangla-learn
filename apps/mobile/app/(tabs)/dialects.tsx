import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, StatusBar, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { T, SHADOW, FONT, MICRO } from "@/lib/theme";
import { trackScreenView } from "@/lib/analytics";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

type DialectCard = {
  id: string;
  label: string;
  nameBn: string;
  region: string;
  desc: string;
  color: string;
  icon: IoniconsName;
  available: boolean;
};

const DIALECT_CARDS: DialectCard[] = [
  {
    id:        "standard",
    label:     "Standard",
    nameBn:    "মান বাংলা",
    region:    "Dhaka · Central Bangladesh",
    desc:      "The official language of Bangladesh. Spoken by 170M+ people and taught in all schools.",
    color:     T.green,
    icon:      "globe-outline",
    available: true,
  },
  {
    id:        "sylheti",
    label:     "Sylheti",
    nameBn:    "সিলেটি",
    region:    "Sylhet · Northeast & UK Diaspora",
    desc:      "The tea-garden dialect with a lilting rhythm. Spoken by ~11M people worldwide.",
    color:     T.sylheti,
    icon:      "cafe-outline",
    available: true,
  },
  {
    id:        "barisali",
    label:     "Barisali",
    nameBn:    "বরিশালি",
    region:    "Barisal · Southern Delta",
    desc:      "The musical dialect of the Venice of the East. Known for its warmth and poetic flow.",
    color:     T.barisali,
    icon:      "boat-outline",
    available: true,
  },
  {
    id:        "chatgaiya",
    label:     "Chatgaiya",
    nameBn:    "চাটগাঁইয়া",
    region:    "Chittagong · Southeast Coast",
    desc:      "Ancient coastal dialect with unique sounds. Spoken by ~13M in the port city and beyond.",
    color:     T.chittagonian,
    icon:      "triangle-outline",
    available: true,
  },
  {
    id:        "rajshahi",
    label:     "Rajshahi",
    nameBn:    "রাজশাহী",
    region:    "Rajshahi · Northwest",
    desc:      "The silk and mango dialect from the northwest plains. Soft and rural in character.",
    color:     "#059669",
    icon:      "leaf-outline",
    available: true,
  },
  {
    id:        "khulna",
    label:     "Khulna",
    nameBn:    "খুলনা",
    region:    "Khulna · Sundarban Delta",
    desc:      "Gateway to the world's largest mangrove forest. Rich in fishing and river vocabulary.",
    color:     "#0891b2",
    icon:      "water-outline",
    available: true,
  },
];

// ── Dialect card item (extracted to satisfy React hooks rules) ─────────────────
function DialectCardItem({ d, idx }: { d: DialectCard; idx: number }) {
  const router   = useRouter();
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1, delay: 80 + idx * 80, friction: 8, tension: 90, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{ width: "47%", opacity: cardAnim, transform: [{ scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}
    >
      <TouchableOpacity
        style={[
          s.card,
          { borderColor: d.color },
          d.available ? SHADOW.green : s.cardLocked,
        ]}
        onPress={() =>
          d.available
            ? router.push(`/dialect/${d.id === "chatgaiya" ? "chittagonian" : d.id}` as any)
            : null
        }
        activeOpacity={d.available ? 0.78 : 1}
        disabled={!d.available}
      >
        {/* Icon */}
        <View style={[s.flagWrap, { backgroundColor: d.color + "18" }]}>
          <Ionicons name={d.icon} size={30} color={d.color} />
        </View>

        {/* Name */}
        <Text style={[s.cardLabel, { color: d.color }]}>{d.label}</Text>
        <Text style={[s.cardBn, { color: d.color + "99" }]}>{d.nameBn}</Text>
        <Text style={s.cardRegion}>{d.region}</Text>

        {/* Divider */}
        <View style={[s.divider, { backgroundColor: d.color + "30" }]} />

        <Text style={s.cardDesc} numberOfLines={3}>{d.desc}</Text>

        {/* Status */}
        {d.available ? (
          <View style={[s.statusChip, { backgroundColor: d.color }]}>
            <Text style={s.statusChipText}>STUDY NOW</Text>
            <Ionicons name="arrow-forward" size={10} color="#fff" />
          </View>
        ) : (
          <View style={[s.statusChip, s.statusLocked]}>
            <Ionicons name="lock-closed" size={10} color={T.textMid as string} />
            <Text style={s.statusLockedText}>COMING SOON</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DialectsScreen() {
  const router    = useRouter();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    trackScreenView("dialects");
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerEyebrow}>Archive No. 042</Text>
        <Text style={s.headerTitle}>REGIONAL DIALECTS</Text>
        <View style={s.headerLine} />
        <Text style={s.headerDesc}>
          "A linguistic journey across the delta. Select the regional vernacular you wish to acquire for your travel records."
        </Text>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <View style={s.grid}>
          {DIALECT_CARDS.map((d, idx) => (
            <DialectCardItem key={d.id} d={d} idx={idx} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.bg },

  // Header
  header: {
    borderBottomWidth: 2, borderBottomColor: T.border,
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 18,
    alignItems: "center",
    backgroundColor: T.bg,
  },
  headerEyebrow: { ...MICRO as any, color: T.red, marginBottom: 4 },
  headerTitle:   { fontFamily: FONT.bold, fontSize: 24, color: T.green, letterSpacing: -0.5 },
  headerLine:    { width: 40, height: 2, backgroundColor: T.red, marginVertical: 12 },
  headerDesc: {
    fontFamily: FONT.regular, fontSize: 13, color: T.textMid as string,
    textAlign: "center", lineHeight: 20, fontStyle: "italic",
    paddingHorizontal: 12,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },

  // Card
  card: {
    backgroundColor: T.white,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  cardLocked: {
    opacity: 0.55,
    shadowColor: T.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 2,
  },
  flagWrap:   { width: 60, height: 60, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  cardLabel:  { fontFamily: FONT.bold, fontSize: 14, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 },
  cardBn:     { fontFamily: FONT.medium, fontSize: 13, marginBottom: 2 },
  cardRegion: { fontFamily: FONT.regular, fontSize: 10, color: T.textMuted as string, textAlign: "center", marginBottom: 10 },
  divider:    { width: "100%", height: 1, marginBottom: 10 },
  cardDesc:   { fontFamily: FONT.regular, fontSize: 11, color: T.textMid as string, textAlign: "center", lineHeight: 16, marginBottom: 12 },

  // Status chips
  statusChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10,
  },
  statusChipText: { fontFamily: FONT.bold, fontSize: 9, color: T.white, letterSpacing: 1 },
  statusLocked: {
    backgroundColor: T.border,
    borderWidth: 1, borderColor: T.border,
  },
  statusLockedText: { fontFamily: FONT.bold, fontSize: 9, color: T.textMid as string, letterSpacing: 1 },
});
