import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { T } from "@/lib/theme";

const BD_GREEN = T.green;

type Props = {
  word: string;
  romanization: string;
  meaning: string;
  sceneType?: "greeting" | "farewell" | "question" | "response";
};

export default function GreetingScene({ word, romanization, meaning, sceneType = "greeting" }: Props) {
  // Person positions
  const leftX = useRef(new Animated.Value(-80)).current;
  const rightX = useRef(new Animated.Value(80)).current;
  const leftRot = useRef(new Animated.Value(0)).current;
  const rightRot = useRef(new Animated.Value(0)).current;

  // Word bubble
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordScale = useRef(new Animated.Value(0.5)).current;
  const wordY = useRef(new Animated.Value(20)).current;

  // Background pulse
  const bgScale = useRef(new Animated.Value(0.8)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Background appears
    // 2. People slide in
    // 3. Word bubble pops up
    // 4. People bow/wave
    Animated.sequence([
      // Bg fade in
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(bgScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      // People slide in
      Animated.parallel([
        Animated.spring(leftX,  { toValue: 0, friction: 7, tension: 100, useNativeDriver: true }),
        Animated.spring(rightX, { toValue: 0, friction: 7, tension: 100, useNativeDriver: true }),
      ]),
      // Word pops up
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(wordScale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }),
        Animated.spring(wordY,     { toValue: 0, friction: 6,  useNativeDriver: true }),
      ]),
      Animated.delay(300),
      // Bow / wave
      Animated.parallel([
        Animated.sequence([
          Animated.timing(leftRot,  { toValue: 1,  duration: 280, useNativeDriver: true }),
          Animated.timing(leftRot,  { toValue: 0,  duration: 280, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(rightRot, { toValue: -1, duration: 280, useNativeDriver: true }),
          Animated.timing(rightRot, { toValue: 0,  duration: 280, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const leftRotDeg = leftRot.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-25deg", "0deg", "25deg"] });
  const rightRotDeg = rightRot.interpolate({ inputRange: [-1, 0, 1], outputRange: ["25deg", "0deg", "-25deg"] });

  const leftColor = BD_GREEN;
  const rightColor = sceneType === "question" ? "#1CB0F6" : sceneType === "farewell" ? "#9333ea" : "#FF9600";

  return (
    <Animated.View
      style={[
        styles.scene,
        { opacity: bgOpacity, transform: [{ scale: bgScale }] },
      ]}
    >
      {/* Left person */}
      <Animated.View style={[styles.person, { transform: [{ translateX: leftX }, { rotate: leftRotDeg }] }]}>
        <View style={[styles.personCircle, { backgroundColor: leftColor + "20", borderColor: leftColor + "40" }]}>
          <Ionicons name="person" size={36} color={leftColor} />
        </View>
        <Text style={[styles.personLabel, { color: leftColor }]}>You</Text>
      </Animated.View>

      {/* Word bubble in the center */}
      <Animated.View
        style={[
          styles.bubble,
          {
            opacity: wordOpacity,
            transform: [{ scale: wordScale }, { translateY: wordY }],
          },
        ]}
      >
        <Text style={styles.bubbleWord}>{word}</Text>
        <Text style={styles.bubbleRoman}>({romanization})</Text>
        <View style={styles.bubbleMeaning}>
          <Text style={styles.bubbleMeaningText}>{meaning}</Text>
        </View>
      </Animated.View>

      {/* Right person */}
      <Animated.View style={[styles.person, { transform: [{ translateX: rightX }, { rotate: rightRotDeg }] }]}>
        <View style={[styles.personCircle, { backgroundColor: rightColor + "20", borderColor: rightColor + "40" }]}>
          <Ionicons name="person" size={36} color={rightColor} />
        </View>
        <Text style={[styles.personLabel, { color: rightColor }]}>Friend</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#f0fdf4",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    overflow: "hidden",
  },
  person: {
    alignItems: "center",
    gap: 6,
  },
  personCircle: {
    width: 70, height: 70, borderRadius: 35,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  personLabel: {
    fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5,
  },
  bubble: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 130,
  },
  bubbleWord: {
    fontSize: 26, fontWeight: "900", color: "#1f2937", textAlign: "center",
  },
  bubbleRoman: {
    fontSize: 13, color: "#9ca3af", fontStyle: "italic", marginTop: 2, textAlign: "center",
  },
  bubbleMeaning: {
    backgroundColor: "#f0fdf4", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
  },
  bubbleMeaningText: {
    fontSize: 12, fontWeight: "700", color: "#16a34a",
  },
});
