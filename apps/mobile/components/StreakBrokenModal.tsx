import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { T, SHADOW, FONT } from "@/lib/theme";

type Props = { visible: boolean; lostStreak: number; onDismiss: () => void };

export default function StreakBrokenModal({ visible, lostStreak, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.emoji}>💔</Text>
          <Text style={s.title}>Streak Broken</Text>
          <Text style={s.sub}>
            Your {lostStreak}-day streak is gone.{"\n"}But every master started at zero.
          </Text>
          <TouchableOpacity style={s.btn} onPress={onDismiss} activeOpacity={0.8}>
            <Ionicons name="flame" size={18} color={T.white} />
            <Text style={s.btnText}>Start a new streak</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
  },
  card: {
    backgroundColor: T.card, borderWidth: 3, borderColor: T.red,
    borderRadius: 20, padding: 32, alignItems: "center", gap: 12,
    marginHorizontal: 32, ...SHADOW.red,
  },
  emoji:   { fontSize: 56 },
  title:   { fontFamily: FONT.bold, fontSize: 24, color: T.red },
  sub:     { fontFamily: FONT.regular, fontSize: 14, color: T.text as string, textAlign: "center", lineHeight: 20 },
  btn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: T.red, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 24, marginTop: 8,
    ...SHADOW.red,
  },
  btnText: { fontFamily: FONT.bold, fontSize: 15, color: T.white },
});
