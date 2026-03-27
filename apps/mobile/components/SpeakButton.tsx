// ── SpeakButton — tap to hear Bengali pronunciation ───────────────────────────
// Drop this anywhere next to a Bengali word or phrase.
// Usage: <SpeakButton text="কেমন আছেন?" dialect="standard" size={20} />

import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { speakWithDialect, stopSpeech } from "@/lib/tts";
import { T } from "@/lib/theme";

type Props = {
  text:     string;
  dialect?: string;
  size?:    number;
  color?:   string;
  style?:   object;
};

export default function SpeakButton({ text, dialect = "standard", size = 22, color = T.green, style }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const pulseLoop  = useRef<Animated.CompositeAnimation | null>(null);
  const isMounted  = useRef(true);

  // Stop the loop and any in-flight TTS when the component unmounts.
  useEffect(() => {
    return () => {
      isMounted.current = false;
      pulseLoop.current?.stop();
      scaleAnim.stopAnimation();
      stopSpeech();
    };
  }, []);

  async function handlePress() {
    if (speaking) {
      pulseLoop.current?.stop();
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
      stopSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    // Pulse animation while speaking — store ref so unmount can stop it.
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.18, duration: 400, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 400, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();

    await speakWithDialect(text, dialect);

    // Guard: component may have unmounted while awaiting TTS.
    if (!isMounted.current) return;
    pulseLoop.current?.stop();
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
    setSpeaking(false);
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.btn, style]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={speaking ? "volume-high" : "volume-medium-outline"}
          size={size}
          color={speaking ? color : color + "aa"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 4, alignItems: "center", justifyContent: "center" },
});
