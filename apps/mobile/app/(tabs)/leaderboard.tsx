import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStats } from "@/lib/storage";
import { T, SHADOW, FONT, MICRO } from "@/lib/theme";
import { trackScreenView } from "@/lib/analytics";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// Mock leaderboard peers (Firebase-ready: replace with Firestore query)
const MOCK_PEERS: { rank: number; name: string; xp: number; streak: number; avatar: IoniconsName }[] = [
  { rank: 1,  name: "Zarin Tasnim",  xp: 4840, streak: 22, avatar: "happy-outline"        },
  { rank: 2,  name: "Farhan Ahmed",  xp: 4210, streak: 15, avatar: "library-outline"      },
  { rank: 3,  name: "Istiak Hasan",  xp: 3990, streak: 18, avatar: "school-outline"       },
  { rank: 5,  name: "Nusrat Jahan",  xp: 980,  streak: 7,  avatar: "musical-notes-outline"},
  { rank: 6,  name: "Tanvir Alam",   xp: 860,  streak: 4,  avatar: "bulb-outline"         },
  { rank: 7,  name: "Raisa Sultana", xp: 740,  streak: 3,  avatar: "leaf-outline"         },
  { rank: 8,  name: "Mahfuz Karim",  xp: 680,  streak: 5,  avatar: "ribbon-outline"       },
];

const PODIUM_BG = ["#1b4d3e", "#d64545", "#f4c542"] as const;
const PODIUM_ORDER = [1, 0, 2] as const; // display: 2nd, 1st, 3rd

export default function LeaderboardScreen() {
  const [myXp, setMyXp] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  // Podium pops in with a bounce
  const podiumScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    trackScreenView("leaderboard");
    getStats().then((s) => {
      setMyXp(s.totalXp);
      setMyStreak(s.currentStreak);
    });
    Animated.parallel([
      Animated.timing(fadeAnim,   { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim,  { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
      Animated.spring(podiumScale,{ toValue: 1, friction: 7, tension: 80, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  // Insert the local user at the correct rank
  const myRank = MOCK_PEERS.filter((p) => p.xp > myXp).length + 1;
  const meEntry: { rank: number; name: string; xp: number; streak: number; avatar: IoniconsName } = { rank: myRank, name: "You", xp: myXp, streak: myStreak, avatar: "person-circle-outline" };

  const podiumPeers = MOCK_PEERS.slice(0, 3);
  const listPeers   = [
    ...MOCK_PEERS.slice(3),
  ];
  // Insert "me" into list if not already in top 3
  if (myRank > 3) {
    const insertIdx = listPeers.findIndex((p) => p.xp < myXp);
    if (insertIdx === -1) listPeers.push(meEntry);
    else listPeers.splice(insertIdx, 0, meEntry);
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerEyebrow}>The Academy of</Text>
          <Text style={s.headerTitle}>EXCELLENCE</Text>
        </View>

        {/* ── Podium ── */}
        <Animated.View style={[s.podium, { transform: [{ scale: podiumScale }] }]}>
          {PODIUM_ORDER.map((idx) => {
            const peer = podiumPeers[idx];
            const is1st = idx === 0;
            return (
              <View key={peer.rank} style={[s.podiumCol, is1st && s.podiumColFirst]}>
                {is1st && (
                  <Ionicons name="star" size={20} color={T.gold} style={{ marginBottom: 6 }} />
                )}
                <View style={[
                  s.podiumAvatar,
                  { borderColor: PODIUM_BG[idx] },
                  is1st && s.podiumAvatarFirst,
                ]}>
                  <Ionicons name={peer.avatar} size={is1st ? 34 : 26} color={PODIUM_BG[idx]} />
                </View>
                <View style={[s.podiumBadge, { backgroundColor: PODIUM_BG[idx] }]}>
                  <Text style={s.podiumBadgeText}>{peer.rank}{peer.rank === 1 ? "st" : peer.rank === 2 ? "nd" : "rd"}</Text>
                </View>
                <Text style={[s.podiumName, is1st && { fontSize: 13 }]} numberOfLines={1}>{peer.name}</Text>
                <Text style={s.podiumXp}>{peer.xp.toLocaleString()} XP</Text>
              </View>
            );
          })}
        </Animated.View>

        {/* ── Ranked list ── */}
        <View style={s.list}>
          {/* "Me" in top 3 — highlighted row */}
          {myRank <= 3 && (
            <View style={[s.row, s.rowMe]}>
              <Text style={[s.rowRank, { color: T.red }]}>{myRank}</Text>
              <View style={[s.rowAvatar, { borderColor: T.red }]}>
                <Ionicons name={meEntry.avatar} size={20} color={T.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.rowName, { color: T.red }]}>You</Text>
                <Text style={s.rowXpLabel}>{myXp.toLocaleString()} Points</Text>
              </View>
              <View style={s.rowStreak}>
                <Ionicons name="flame" size={12} color={T.red} />
                <Text style={[s.rowStreakText, { color: T.red }]}>{myStreak}d</Text>
              </View>
            </View>
          )}

          {listPeers.map((peer, i) => {
            const isMe = peer.name === "You";
            return (
              <View key={i} style={[s.row, isMe && s.rowMe]}>
                <Text style={[s.rowRank, isMe && { color: T.red }]}>{peer.rank}</Text>
                <View style={[s.rowAvatar, { borderColor: isMe ? T.red : T.border }]}>
                  <Ionicons name={peer.avatar} size={20} color={isMe ? T.red : T.textMid as string} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.rowName, isMe && { color: T.red }]}>{peer.name}</Text>
                  <Text style={s.rowXpLabel}>{peer.xp.toLocaleString()} Points</Text>
                </View>
                <View style={s.rowStreak}>
                  <Ionicons name="flame" size={12} color={isMe ? T.red : T.textMuted as string} />
                  <Text style={[s.rowStreakText, isMe && { color: T.red }]}>{peer.streak}d</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // Header
  header: {
    alignItems: "center",
    paddingTop: 24, paddingBottom: 20,
    borderBottomWidth: 2, borderBottomColor: T.border,
  },
  headerEyebrow: { fontFamily: FONT.bold, fontSize: 10, color: T.textMid as string, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 },
  headerTitle:   { fontFamily: FONT.bold, fontSize: 28, color: T.green, letterSpacing: -0.5 },

  // Podium
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: T.border,
    backgroundColor: T.bg,
  },
  podiumCol:      { alignItems: "center", gap: 6, width: 90 },
  podiumColFirst: { marginBottom: 16 },
  podiumAvatar: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 3,
    backgroundColor: T.white,
    alignItems: "center", justifyContent: "center",
    ...SHADOW.soft,
  },
  podiumAvatarFirst: { width: 72, height: 72, borderRadius: 36 },
  podiumBadge: {
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginTop: 2,
  },
  podiumBadgeText: { fontFamily: FONT.bold, fontSize: 10, color: T.white, letterSpacing: 0.5 },
  podiumName: { fontFamily: FONT.bold, fontSize: 11, color: T.green, textAlign: "center" },
  podiumXp:   { fontFamily: FONT.medium, fontSize: 10, color: T.textMid as string },

  // Ranked list
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: T.white,
    borderWidth: 2, borderColor: T.border,
    borderRadius: 14, padding: 14,
  },
  rowMe: {
    borderColor: T.red,
    backgroundColor: T.red + "08",
    ...SHADOW.red,
  },
  rowRank: {
    fontFamily: FONT.bold, fontSize: 20, color: T.textMuted as string,
    width: 28, textAlign: "center", fontStyle: "italic",
  },
  rowAvatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, backgroundColor: T.card,
    alignItems: "center", justifyContent: "center",
  },
  rowName:      { fontFamily: FONT.bold, fontSize: 14, color: T.green },
  rowXpLabel:   { fontFamily: FONT.medium, fontSize: 10, color: T.textMid as string, textTransform: "uppercase", letterSpacing: 1 },
  rowStreak:    { flexDirection: "row", alignItems: "center", gap: 3 },
  rowStreakText: { fontFamily: FONT.bold, fontSize: 11, color: T.textMuted as string },
});
