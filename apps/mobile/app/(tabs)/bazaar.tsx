import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Alert, Animated,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getStats, getCoins, addHearts, spendCoins, spendXp,
  activateStreakFreeze, isStreakFreezeActive,
} from "@/lib/storage";
import { T, SHADOW, FONT, MICRO } from "@/lib/theme";
import { trackScreenView, trackBazaarOpen } from "@/lib/analytics";

// ── Product catalogue ─────────────────────────────────────────────────────────
// Each product has prices in all 3 currencies (null = not available yet)
type Product = {
  id:       string;
  name:     string;
  desc:     string;
  icon:     React.ComponentProps<typeof Ionicons>["name"];
  color:    string;
  iapPrice: string | null;   // "$0.99" or null
  xpPrice:  number | null;
  coinPrice: number | null;
  buy: (method: "iap" | "xp" | "coins") => Promise<{ ok: boolean; msg: string }>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function BazaarScreen() {
  const [hearts,      setHearts]      = useState(5);
  const [totalXp,     setTotalXp]     = useState(0);
  const [coins,       setCoins]       = useState(0);
  const [freezeOn,    setFreezeOn]    = useState(false);
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const heroScale = useRef(new Animated.Value(0.7)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;

  async function refresh() {
    const [s, c, f] = await Promise.all([
      getStats(), getCoins(), isStreakFreezeActive(),
    ]);
    setHearts(s.hearts);
    setTotalXp(s.totalXp);
    setCoins(c);
    setFreezeOn(f);
  }

  // Refresh every time tab is focused
  useFocusEffect(useCallback(() => { refresh(); }, []));

  useEffect(() => {
    trackScreenView("bazaar");
    trackBazaarOpen();
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, friction: 6, tension: 80, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }

  // ── Product definitions ────────────────────────────────────────────────────
  const PRODUCTS: Product[] = [
    {
      id:       "heart_refill",
      name:     "Heart Refill",
      desc:     "Instantly restore all 5 hearts and get back to learning.",
      icon:     "heart",
      color:    T.red,
      iapPrice: "$0.99",
      xpPrice:  100,
      coinPrice: 50,
      buy: async (method) => {
        if (hearts >= 5) return { ok: false, msg: "Your hearts are already full!" };
        if (method === "iap") {
          return { ok: false, msg: "In-app purchases coming soon!" };
        }
        if (method === "xp") {
          const ok = await spendXp(100);
          if (!ok) return { ok: false, msg: `Need 100 XP — you have ${totalXp}.` };
        }
        if (method === "coins") {
          const ok = await spendCoins(50);
          if (!ok) return { ok: false, msg: `Need 50 coins — you have ${coins}.` };
        }
        await addHearts(5);
        await refresh();
        return { ok: true, msg: "Hearts fully restored! Keep going!" };
      },
    },
    {
      id:       "streak_freeze",
      name:     "Streak Freeze",
      desc:     "Protect your streak from one missed day. Use it wisely.",
      icon:     "snow-outline",
      color:    T.barisali,
      iapPrice: "$1.99",
      xpPrice:  200,
      coinPrice: 100,
      buy: async (method) => {
        if (freezeOn) return { ok: false, msg: "You already have a Streak Freeze active!" };
        if (method === "iap") {
          return { ok: false, msg: "In-app purchases coming soon!" };
        }
        if (method === "xp") {
          const ok = await spendXp(200);
          if (!ok) return { ok: false, msg: `Need 200 XP — you have ${totalXp}.` };
        }
        if (method === "coins") {
          const ok = await spendCoins(100);
          if (!ok) return { ok: false, msg: `Need 100 coins — you have ${coins}.` };
        }
        await activateStreakFreeze();
        await refresh();
        return { ok: true, msg: "Streak Freeze activated! Miss a day safely." };
      },
    },
    {
      id:       "xp_boost",
      name:     "XP Boost · 2hr",
      desc:     "Double your wisdom points for the next two hours.",
      icon:     "flash",
      color:    T.gold,
      iapPrice: "$0.99",
      xpPrice:  null,        // can't buy an XP boost with XP
      coinPrice: 75,
      buy: async (method) => {
        if (method === "iap" || method === "xp") {
          return { ok: false, msg: "XP Boost coming in the next update!" };
        }
        return { ok: false, msg: "XP Boost coming in the next update!" };
      },
    },
  ];

  // ── Buy handler ────────────────────────────────────────────────────────────
  async function handleBuy(product: Product, method: "iap" | "xp" | "coins") {
    const { ok, msg } = await product.buy(method);
    showToast(msg, ok);
  }

  function confirmBuy(product: Product, method: "iap" | "xp" | "coins") {
    const label = method === "iap"
      ? product.iapPrice!
      : method === "xp"
        ? `${product.xpPrice} XP`
        : `${product.coinPrice} coins`;

    Alert.alert(
      `Buy ${product.name}?`,
      `Cost: ${label}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Buy", onPress: () => handleBuy(product, method) },
      ],
    );
  }

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

          {/* Currency row */}
          <View style={s.currencyRow}>
            <View style={s.currencyPill}>
              <Ionicons name="heart" size={16} color={T.red} />
              <Text style={[s.currencyVal, { color: T.red }]}>{hearts}/5</Text>
            </View>
            <View style={s.currencyPill}>
              <Ionicons name="flash" size={16} color={T.gold} />
              <Text style={[s.currencyVal, { color: T.green }]}>{totalXp.toLocaleString()} XP</Text>
            </View>
            <View style={s.currencyPill}>
              <Ionicons name="ellipse" size={14} color="#b45309" />
              <Text style={[s.currencyVal, { color: "#b45309" }]}>{coins} coins</Text>
            </View>
          </View>

          {freezeOn && (
            <View style={s.freezeBadge}>
              <Ionicons name="snow" size={14} color={T.barisali} />
              <Text style={s.freezeBadgeText}>Streak Freeze active</Text>
            </View>
          )}
        </View>

        {/* ── Section label ── */}
        <View style={s.sectionRow}>
          <View style={s.sectionLine} />
          <Text style={s.sectionTitle}>ESSENTIAL PROVISIONS</Text>
          <View style={s.sectionLine} />
        </View>

        {/* ── Product cards ── */}
        <View style={s.items}>
          {PRODUCTS.map((product) => (
            <View key={product.id} style={[s.itemCard, SHADOW.green]}>
              {/* Icon + name/desc */}
              <View style={s.itemTop}>
                <View style={[s.itemIcon, { backgroundColor: product.color }]}>
                  <Ionicons name={product.icon} size={30} color={T.white} />
                </View>
                <View style={s.itemBody}>
                  <Text style={s.itemName}>{product.name}</Text>
                  <Text style={s.itemDesc}>{product.desc}</Text>
                </View>
              </View>

              {/* 3 buy buttons */}
              <View style={s.buyRow}>
                {/* IAP */}
                {product.iapPrice && (
                  <TouchableOpacity
                    style={[s.buyBtn, { backgroundColor: T.red }]}
                    onPress={() => confirmBuy(product, "iap")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="card-outline" size={12} color={T.white} />
                    <Text style={s.buyBtnText}>{product.iapPrice}</Text>
                  </TouchableOpacity>
                )}

                {/* XP spend */}
                {product.xpPrice != null && (
                  <TouchableOpacity
                    style={[s.buyBtn, { backgroundColor: T.green, opacity: totalXp < product.xpPrice ? 0.5 : 1 }]}
                    onPress={() => confirmBuy(product, "xp")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flash" size={12} color={T.gold} />
                    <Text style={s.buyBtnText}>{product.xpPrice} XP</Text>
                  </TouchableOpacity>
                )}

                {/* Coins spend */}
                {product.coinPrice != null && (
                  <TouchableOpacity
                    style={[s.buyBtn, { backgroundColor: "#92400e", opacity: coins < product.coinPrice ? 0.5 : 1 }]}
                    onPress={() => confirmBuy(product, "coins")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="ellipse" size={10} color="#fde68a" />
                    <Text style={s.buyBtnText}>{product.coinPrice} coins</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Payment methods legend ── */}
        <View style={s.legend}>
          <Text style={s.legendTitle}>HOW PAYMENT WORKS</Text>
          <View style={s.legendRow}>
            <Ionicons name="card-outline" size={14} color={T.red} />
            <Text style={s.legendText}><Text style={{ fontFamily: FONT.bold }}>Real money</Text> — instant, one-time via Apple Pay</Text>
          </View>
          <View style={s.legendRow}>
            <Ionicons name="flash" size={14} color={T.gold} />
            <Text style={s.legendText}><Text style={{ fontFamily: FONT.bold }}>XP spend</Text> — deducts from your score (rankings tradeoff)</Text>
          </View>
          <View style={s.legendRow}>
            <Ionicons name="ellipse" size={12} color="#b45309" />
            <Text style={s.legendText}><Text style={{ fontFamily: FONT.bold }}>Coins</Text> — earned from streaks, sharing & quiz completions</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* ── Toast ── */}
      {toast && (
        <Animated.View style={[s.toast, { opacity: toastAnim, backgroundColor: toast.ok ? T.success + "18" : T.red + "18", borderColor: toast.ok ? T.success : T.red }]}>
          <Ionicons name={toast.ok ? "checkmark-circle" : "alert-circle"} size={18} color={toast.ok ? T.success : T.red} />
          <Text style={[s.toastText, { color: toast.ok ? T.green : T.red }]}>{toast.msg}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // Hero
  hero: {
    backgroundColor: T.card,
    borderBottomWidth: 4, borderBottomColor: T.gold,
    paddingVertical: 28, paddingHorizontal: 24,
    alignItems: "center",
  },
  heroIcon: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: T.red,
    backgroundColor: T.white,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
    ...SHADOW.soft,
  },
  heroTitle: { fontFamily: FONT.bold, fontSize: 26, color: T.green, letterSpacing: 1 },
  heroSub:   { fontFamily: FONT.regular, fontSize: 13, color: T.red, fontStyle: "italic", marginTop: 4 },
  heroLine:  { width: 40, height: 2, backgroundColor: T.border, marginVertical: 16 },

  // Currency row
  currencyRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  currencyPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: T.white, borderWidth: 1.5, borderColor: T.border,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  currencyVal: { fontFamily: FONT.bold, fontSize: 13 },

  // Freeze badge
  freezeBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 12,
    backgroundColor: T.barisali + "18",
    borderWidth: 1.5, borderColor: T.barisali,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  freezeBadgeText: { fontFamily: FONT.bold, fontSize: 12, color: T.barisali },

  // Section
  sectionRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginHorizontal: 20, marginTop: 28, marginBottom: 16,
  },
  sectionLine:  { flex: 1, height: 1, backgroundColor: T.border },
  sectionTitle: { ...(MICRO as any), color: T.textMid as string },

  // Product cards
  items:    { paddingHorizontal: 16, gap: 16 },
  itemCard: {
    backgroundColor: T.white,
    borderWidth: 2, borderColor: T.green,
    borderRadius: 16, padding: 16,
    gap: 14,
  },
  itemTop: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  itemIcon: {
    width: 58, height: 58, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: T.border,
    flexShrink: 0,
  },
  itemBody:  { flex: 1 },
  itemName:  { fontFamily: FONT.bold, fontSize: 15, color: T.green, marginBottom: 4 },
  itemDesc:  { fontFamily: FONT.regular, fontSize: 12, color: T.textMid as string, lineHeight: 17 },

  // Buy buttons row
  buyRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  buyBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12,
    ...SHADOW.soft,
  },
  buyBtnText: {
    fontFamily: FONT.bold, fontSize: 11, color: T.white,
    textTransform: "uppercase", letterSpacing: 0.4,
  },

  // Legend
  legend: {
    marginHorizontal: 16, marginTop: 28,
    backgroundColor: T.card,
    borderWidth: 1.5, borderColor: T.border,
    borderRadius: 14, padding: 16, gap: 10,
  },
  legendTitle: { ...(MICRO as any), color: T.textMid as string, marginBottom: 2 },
  legendRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  legendText:  { fontFamily: FONT.regular, fontSize: 12, color: T.text as string, flex: 1, lineHeight: 17 },

  // Toast
  toast: {
    position: "absolute", bottom: 24, left: 20, right: 20,
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1.5, borderRadius: 12, padding: 14,
  },
  toastText: { fontFamily: FONT.bold, fontSize: 14, flex: 1 },
});
