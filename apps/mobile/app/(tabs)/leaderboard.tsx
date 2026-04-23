import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Animated, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { getStats } from "@/lib/storage";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/sync";
import { useAuth } from "@/lib/AuthContext";
import { T, SHADOW, FONT } from "@/lib/theme";
import { trackScreenView } from "@/lib/analytics";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// Shown while Firestore loads or when offline
const MOCK_PEERS: LeaderboardEntry[] = [
  { uid: "m1", name: "Zarin Tasnim",  xp: 4840, streak: 22 },
  { uid: "m2", name: "Farhan Ahmed",  xp: 4210, streak: 15 },
  { uid: "m3", name: "Istiak Hasan",  xp: 3990, streak: 18 },
  { uid: "m4", name: "Nusrat Jahan",  xp: 980,  streak: 7  },
  { uid: "m5", name: "Tanvir Alam",   xp: 860,  streak: 4  },
  { uid: "m6", name: "Raisa Sultana", xp: 740,  streak: 3  },
  { uid: "m7", name: "Mahfuz Karim",  xp: 680,  streak: 5  },
];

const PODIUM_COLORS = [T.green, T.red, T.gold] as const;
const PODIUM_ORDER  = [1, 0, 2] as const; // display order: 2nd, 1st, 3rd

function avatarIcon(name: string): IoniconsName {
  const icons: IoniconsName[] = [
    "happy-outline", "library-outline", "school-outline",
    "musical-notes-outline", "bulb-outline", "leaf-outline",
    "ribbon-outline", "compass-outline", "star-outline",
  ];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return icons[h % icons.length];
}

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [myXp,     setMyXp]     = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [peers,    setPeers]    = useState<LeaderboardEntry[]>(MOCK_PEERS);
  const [loading,  setLoading]  = useState(false);
  const [isLive,   setIsLive]   = useState(false); // true = Firestore data loaded

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const podiumScale = useRef(new Animated.Value(0.85)).current;

  useFocusEffect(useCallback(() => {
    trackScreenView("leaderboard");
    getStats().then((s) => {
      setMyXp(s.totalXp);
      setMyStreak(s.currentStreak);
    });

    setLoading(true);
    getLeaderboard().then((rows) => {
      if (rows.length > 0) {
        setPeers(rows);
        setIsLive(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    Animated.parallel([
      Animated.timing(fadeAnim,    { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim,   { toValue: 0, friction: 8,  tension: 90, useNativeDriver: true }),
      Animated.spring(podiumScale, { toValue: 1, friction: 7,  tension: 80, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []));

  // Build a merged list with the local user inserted at the correct rank
  const myUid   = user?.uid ?? "me";
  const myEntry: LeaderboardEntry = { uid: myUid, name: "You", xp: myXp, streak: myStreak };

  // Filter out the local user from the peers list (if they appear by uid)
  const filteredPeers = peers.filter((p) => p.uid !== myUid);

  // Rank everyone
  const allWithMe = [...filteredPeers, myEntry]
    .sort((a, b) => b.xp - a.xp)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const ranked     = allWithMe;
  const podiumTop3 = ranked.slice(0, 3);
  const listRows   = ranked.slice(3);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerEyebrow}>BhashaLoop</Text>
          <Text style={s.headerTitle}>LEADERBOARD</Text>
          {loading && <ActivityIndicator size="small" color={T.textMuted as string} style={{ marginTop: 8 }} />}
          {!loading && (
            <View style={s.livePill}>
              <View style={[s.liveDot, { backgroundColor: isLive ? T.success : T.textMuted as string }]} />
              <Text style={s.liveText}>{isLive ? "Live rankings" : "Demo rankings"}</Text>
            </View>
          )}
        </View>

        {/* ── Podium ── */}
        {podiumTop3.length >= 3 && (
          <Animated.View style={[s.podium, { transform: [{ scale: podiumScale }] }]}>
            {(PODIUM_ORDER as readonly number[]).map((idx) => {
              const peer    = podiumTop3[idx];
              const is1st   = idx === 0;
              const isMe    = peer.uid === myUid;
              const clr     = PODIUM_COLORS[idx];
              return (
                <View key={peer.uid} style={[s.podiumCol, is1st && s.podiumColFirst]}>
                  {is1st && <Ionicons name="star" size={20} color={T.gold} style={{ marginBottom: 6 }} />}
                  <View style={[s.podiumAvatar, { borderColor: clr }, is1st && s.podiumAvatarFirst, isMe && { borderColor: T.red }]}>
                    <Ionicons name={isMe ? "person-circle-outline" : avatarIcon(peer.name)} size={is1st ? 34 : 26} color={isMe ? T.red : clr} />
                  </View>
                  <View style={[s.podiumBadge, { backgroundColor: clr }]}>
                    <Text style={s.podiumBadgeText}>{peer.rank}{peer.rank === 1 ? "st" : peer.rank === 2 ? "nd" : "rd"}</Text>
                  </View>
                  <Text style={[s.podiumName, is1st && { fontSize: 13 }, isMe && { color: T.red }]} numberOfLines={1}>{peer.name}</Text>
                  <Text style={s.podiumXp}>{peer.xp.toLocaleString()} XP</Text>
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* ── Ranked list ── */}
        <View style={s.list}>
          {listRows.map((peer) => {
            const isMe = peer.uid === myUid;
            return (
              <View key={peer.uid} style={[s.row, isMe && s.rowMe]}>
                <Text style={[s.rowRank, isMe && { color: T.red }]}>{peer.rank}</Text>
                <View style={[s.rowAvatar, { borderColor: isMe ? T.red : T.border }]}>
                  <Ionicons name={isMe ? "person-circle-outline" : avatarIcon(peer.name)} size={20} color={isMe ? T.red : T.textMid as string} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.rowName, isMe && { color: T.red }]}>{peer.name}</Text>
                  <Text style={s.rowXpLabel}>{peer.xp.toLocaleString()} XP</Text>
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

  header: {
    alignItems: "center",
    paddingTop: 24, paddingBottom: 20,
    borderBottomWidth: 2, borderBottomColor: T.border,
  },
  headerEyebrow: { fontFamily: FONT.bold, fontSize: 10, color: T.textMid as string, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 },
  headerTitle:   { fontFamily: FONT.bold, fontSize: 28, color: T.green, letterSpacing: -0.5 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  liveDot:  { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontFamily: FONT.medium, fontSize: 11, color: T.textMid as string },

  podium: {
    flexDirection: "row", justifyContent: "center", alignItems: "flex-end",
    gap: 12, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24,
    borderBottomWidth: 2, borderBottomColor: T.border, backgroundColor: T.bg,
  },
  podiumCol:       { alignItems: "center", gap: 6, width: 90 },
  podiumColFirst:  { marginBottom: 16 },
  podiumAvatar: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 3,
    backgroundColor: T.white, alignItems: "center", justifyContent: "center",
    ...SHADOW.soft,
  },
  podiumAvatarFirst: { width: 72, height: 72, borderRadius: 36 },
  podiumBadge:       { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginTop: 2 },
  podiumBadgeText:   { fontFamily: FONT.bold, fontSize: 10, color: T.white, letterSpacing: 0.5 },
  podiumName:        { fontFamily: FONT.bold, fontSize: 11, color: T.green, textAlign: "center" },
  podiumXp:          { fontFamily: FONT.medium, fontSize: 10, color: T.textMid as string },

  list:    { padding: 16, gap: 10 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: T.white, borderWidth: 2, borderColor: T.border,
    borderRadius: 14, padding: 14,
  },
  rowMe: { borderColor: T.red, backgroundColor: T.red + "08", ...SHADOW.red },
  rowRank:       { fontFamily: FONT.bold, fontSize: 20, color: T.textMuted as string, width: 28, textAlign: "center", fontStyle: "italic" },
  rowAvatar:     { width: 40, height: 40, borderRadius: 20, borderWidth: 2, backgroundColor: T.card, alignItems: "center", justifyContent: "center" },
  rowName:       { fontFamily: FONT.bold, fontSize: 14, color: T.green },
  rowXpLabel:    { fontFamily: FONT.medium, fontSize: 10, color: T.textMid as string, textTransform: "uppercase", letterSpacing: 1 },
  rowStreak:     { flexDirection: "row", alignItems: "center", gap: 3 },
  rowStreakText:  { fontFamily: FONT.bold, fontSize: 11, color: T.textMuted as string },
});
