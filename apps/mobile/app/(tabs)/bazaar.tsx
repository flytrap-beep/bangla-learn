import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, StatusBar, Alert, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStats, addHearts } from "@/lib/storage";
import { T, SHADOW, FONT, MICRO } from "@/lib/theme";

type Item = {
  name:    string;
  desc:    string;
  price:   string;
  icon:    React.ComponentProps<typeof Ionicons>["name"];
  color:   string;
  action?: () => Promise<void>;
};

export default function BazaarScreen() {
  const [hearts, setHearts]   = useState(5);
  const [message, setMessage] = useState<string | null>(null);
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  // Hero icon bounces in
  const heroScale  = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    getStats().then((s) => setHearts(s.hearts));
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, friction: 6, tension: 80, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  async function buyHearts() {
    if (hearts >= 5) {
      setMessage("Your hearts are already full!");
      return;
    }
    await addHearts(1);
    const s = await getStats();
    setHearts(s.hearts);
    setMessage("Heart restored! Keep learning!");
  }

  function comingSoon(name: string) {
    Alert.alert("Coming Soon", `${name} will be available in the next update!`);
  }

  const ITEMS: Item[] = [
    {
      name:   "Extra Heart",
      desc:   "Restore one lost heart so your journey never ends.",
      price:  "Free for now",
      icon:   "heart",
      color:  T.red,
      action: buyHearts,
    },
    {
      name:  "XP Boost · 2hr",
      desc:  "Double your wisdom points for the next two hours.",
      price: "Coming soon",
      icon:  "flash",
      color: T.gold,
      action: async () => comingSoon("XP Boost"),
    },
    {
      name:  "Streak Freeze",
      desc:  "Protect your daily streak from a missed day.",
      price: "Coming soon",
      icon:  "snow-outline",
      color: T.barisali,
      action: async () => comingSoon("Streak Freeze"),
    },
  ];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ── Hero banner ── */}
        <View style={s.hero}>
          <Animated.View style={[s.heroIcon, { transform: [{ scale: heroScale }] }]}>
            <Ionicons name="storefront" size={48} color={T.red} />
          </Animated.View>
          <Text style={s.heroTitle}>AMAR BAZAAR</Text>
          <Text style={s.heroSub}>Premium Goods for Language Travellers</Text>
          <View style={s.heroLine} />

          {/* Hearts display */}
          <View style={s.heartsRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <Ionicons
                key={i}
                name={i < hearts ? "heart" : "heart-outline"}
                size={24}
                color={T.red}
              />
            ))}
          </View>
          <Text style={s.heartsLabel}>{hearts} / 5 hearts remaining</Text>
        </View>

        {/* ── Section title ── */}
        <View style={s.sectionRow}>
          <View style={s.sectionLine} />
          <Text style={s.sectionTitle}>ESSENTIAL PROVISIONS</Text>
          <View style={s.sectionLine} />
        </View>

        {/* ── Item cards ── */}
        <View style={s.items}>
          {ITEMS.map((item) => (
            <View
              key={item.name}
              style={[s.itemCard, SHADOW.green]}
            >
              <View style={[s.itemIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={32} color={T.white} />
              </View>
              <View style={s.itemBody}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemDesc}>{item.desc}</Text>
              </View>
              <TouchableOpacity
                style={[s.buyBtn, { backgroundColor: T.green }]}
                onPress={item.action}
                activeOpacity={0.8}
              >
                <Text style={s.buyBtnText}>{item.price}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ── Message toast ── */}
        {message && (
          <View style={s.toast}>
            <Text style={s.toastText}>{message}</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // Hero
  hero: {
    backgroundColor: T.card,
    borderBottomWidth: 4, borderBottomColor: T.gold,
    paddingVertical: 32, paddingHorizontal: 24,
    alignItems: "center",
  },
  heroIcon: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: T.red,
    backgroundColor: T.white,
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
    ...SHADOW.soft,
  },
  heroTitle: { fontFamily: FONT.bold, fontSize: 26, color: T.green, letterSpacing: 1 },
  heroSub:   { fontFamily: FONT.regular, fontSize: 13, color: T.red, fontStyle: "italic", marginTop: 4 },
  heroLine:  { width: 40, height: 2, backgroundColor: T.border, marginVertical: 16 },

  // Hearts
  heartsRow:   { flexDirection: "row", gap: 8, marginBottom: 8 },
  heartsLabel: { fontFamily: FONT.bold, fontSize: 11, color: T.textMid as string, textTransform: "uppercase", letterSpacing: 1 },

  // Section
  sectionRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginHorizontal: 20, marginTop: 28, marginBottom: 16,
  },
  sectionLine:  { flex: 1, height: 1, backgroundColor: T.border },
  sectionTitle: { ...MICRO as any, color: T.textMid as string },

  // Items
  items: { paddingHorizontal: 16, gap: 14 },
  itemCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: T.white,
    borderWidth: 2, borderColor: T.green,
    borderRadius: 16, padding: 14,
  },
  itemIcon: {
    width: 60, height: 60, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: T.border,
    flexShrink: 0,
  },
  itemBody:  { flex: 1 },
  itemName:  { fontFamily: FONT.bold, fontSize: 15, color: T.green, marginBottom: 3 },
  itemDesc:  { fontFamily: FONT.regular, fontSize: 12, color: T.textMid as string, lineHeight: 17 },
  buyBtn: {
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12,
    alignItems: "center",
    ...SHADOW.soft,
  },
  buyBtnText: { fontFamily: FONT.bold, fontSize: 11, color: T.white, textTransform: "uppercase", letterSpacing: 0.5 },

  // Toast
  toast: {
    marginHorizontal: 20, marginTop: 20,
    backgroundColor: T.success + "18",
    borderWidth: 1.5, borderColor: T.success,
    borderRadius: 12, padding: 14,
    alignItems: "center",
  },
  toastText: { fontFamily: FONT.bold, fontSize: 14, color: T.green },
});
