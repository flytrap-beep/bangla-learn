import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { getStats } from "@/lib/storage";

type Stats = { totalXp: number; currentStreak: number; hearts: number };

export default function ProfileScreen() {
  const [stats, setStats] = useState<Stats>({ totalXp: 0, currentStreak: 0, hearts: 5 });

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  const statCards = [
    { icon: "🔥", value: stats.currentStreak, label: "Day Streak", color: "#FF9600" },
    { icon: "⭐", value: stats.totalXp, label: "Total XP", color: "#FFD700" },
    { icon: "❤️", value: stats.hearts, label: "Hearts", color: "#FF4B4B" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🇧🇩</Text>
          </View>
          <Text style={styles.appName}>BanglaLearn</Text>
          <Text style={styles.subtitle}>Your learning journey</Text>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <View key={card.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{card.icon}</Text>
              <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Hearts refill</Text>
          <Text style={styles.infoText}>
            You get 1 heart back every 30 minutes. Max 5 hearts.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About BanglaLearn</Text>
          <Text style={styles.infoText}>
            The first app to teach Bengali in 4 dialects: Standard, Sylheti, Barisali, and Chittagonian.
            Built for the diaspora and for anyone who wants to learn Bangla.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 28 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#58CC02", alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  avatarText: { fontSize: 36 },
  appName: { fontSize: 24, fontWeight: "800", color: "#1f2937" },
  subtitle: { fontSize: 14, color: "#9ca3af", marginTop: 4 },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 16,
    padding: 16, alignItems: "center",
    borderWidth: 1, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statIcon: { fontSize: 28, marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#9ca3af", marginTop: 4, textAlign: "center" },
  infoCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb",
  },
  infoTitle: { fontSize: 15, fontWeight: "700", color: "#1f2937", marginBottom: 6 },
  infoText: { fontSize: 14, color: "#6b7280", lineHeight: 22 },
});
