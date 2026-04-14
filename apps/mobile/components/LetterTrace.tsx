import React, { useRef, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, PanResponder, Animated,
  LayoutChangeEvent, TouchableOpacity,
} from "react-native";
import Svg, { Path, Circle, Defs, Marker, Line } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import type { LetterTraceExercise } from "@bangla-learn/types";
import { T } from "@/lib/theme";

const BD_GREEN  = T.green;
const HIT_RADIUS = 40;   // hit zone in pixels — generous so tracing feels accurate
// Pass when ≥ 65 % of waypoints are hit
const PASS_RATIO = 0.65;

// ── Waypoints — stroke paths for all Bengali characters ──────────────────────
// px/py = % of canvas (width/height). Ghost letter at fontSize=155 renders with
// matra at y≈30-33% (not 0%). All top-portion y values reflect this offset.
const WAYPOINTS: Record<string, { px: number; py: number; n: string }[]> = {

  // ════════════════════════════════════════════════════════════════════════════
  //  VOWELS  (স্বরবর্ণ)
  // ════════════════════════════════════════════════════════════════════════════

  // অ — matra right→left, curve down-left, loop right, tail
  "অ": [
    { px: 62, py: 30, n: "1" },
    { px: 40, py: 30, n: "2" },
    { px: 26, py: 40, n: "3" },
    { px: 22, py: 54, n: "4" },
    { px: 30, py: 65, n: "5" },
    { px: 50, py: 70, n: "6" },
    { px: 62, py: 59, n: "7" },
    { px: 60, py: 46, n: "8" },
    { px: 60, py: 80, n: "9" },
  ],

  // আ — matra across, অ-like body left, right vertical
  "আ": [
    { px: 28, py: 30, n: "1" },
    { px: 72, py: 30, n: "2" },
    { px: 30, py: 38, n: "3" },
    { px: 22, py: 54, n: "4" },
    { px: 30, py: 67, n: "5" },
    { px: 48, py: 68, n: "6" },
    { px: 52, py: 54, n: "7" },
    { px: 72, py: 36, n: "8" },
    { px: 72, py: 75, n: "9" },
  ],

  // ই — matra left→right, S-curve descending to lower-left hook
  "ই": [
    { px: 28, py: 30, n: "1" },
    { px: 68, py: 30, n: "2" },
    { px: 66, py: 40, n: "3" },
    { px: 56, py: 50, n: "4" },
    { px: 44, py: 62, n: "5" },
    { px: 34, py: 70, n: "6" },
    { px: 27, py: 82, n: "7" },
  ],

  // ঈ — matra, S-curve, bottom loops back right then hooks down
  "ঈ": [
    { px: 28, py: 30, n: "1" },
    { px: 68, py: 30, n: "2" },
    { px: 66, py: 40, n: "3" },
    { px: 55, py: 48, n: "4" },
    { px: 43, py: 60, n: "5" },
    { px: 33, py: 68, n: "6" },
    { px: 30, py: 78, n: "7" },
    { px: 55, py: 80, n: "8" },
    { px: 40, py: 88, n: "9" },
  ],

  // উ — matra, open oval: right down, bottom, back up left
  "উ": [
    { px: 28, py: 30, n: "1" },
    { px: 68, py: 30, n: "2" },
    { px: 70, py: 42, n: "3" },
    { px: 68, py: 59, n: "4" },
    { px: 54, py: 72, n: "5" },
    { px: 36, py: 68, n: "6" },
    { px: 28, py: 54, n: "7" },
    { px: 33, py: 40, n: "8" },
  ],

  // ঊ — like উ with an inner reverse loop
  "ঊ": [
    { px: 28, py: 30, n: "1" },
    { px: 68, py: 30, n: "2" },
    { px: 72, py: 42, n: "3" },
    { px: 70, py: 59, n: "4" },
    { px: 55, py: 72, n: "5" },
    { px: 35, py: 68, n: "6" },
    { px: 27, py: 54, n: "7" },
    { px: 32, py: 40, n: "8" },
    { px: 50, py: 48, n: "9" },
    { px: 62, py: 62, n: "10" },
  ],

  // ঋ — matra, diagonal body with characteristic ri-curve
  "ঋ": [
    { px: 28, py: 30, n: "1" },
    { px: 68, py: 30, n: "2" },
    { px: 55, py: 36, n: "3" },
    { px: 42, py: 44, n: "4" },
    { px: 38, py: 56, n: "5" },
    { px: 46, py: 65, n: "6" },
    { px: 62, py: 62, n: "7" },
    { px: 66, py: 78, n: "8" },
  ],

  // এ — matra right→left, curve down, mid-bar right, curve down, base left
  "এ": [
    { px: 68, py: 30, n: "1" },
    { px: 32, py: 30, n: "2" },
    { px: 28, py: 43, n: "3" },
    { px: 32, py: 54, n: "4" },
    { px: 66, py: 54, n: "5" },
    { px: 68, py: 65, n: "6" },
    { px: 55, py: 78, n: "7" },
    { px: 32, py: 78, n: "8" },
  ],

  // ঐ — matra, center stem down, fork left and right at base
  "ঐ": [
    { px: 26, py: 30, n: "1" },
    { px: 72, py: 30, n: "2" },
    { px: 50, py: 36, n: "3" },
    { px: 50, py: 46, n: "4" },
    { px: 50, py: 64, n: "5" },
    { px: 33, py: 75, n: "6" },
    { px: 50, py: 75, n: "7" },
    { px: 65, py: 75, n: "8" },
  ],

  // ও — left C-curve, matra right, right vertical
  "ও": [
    { px: 38, py: 30, n: "1" },
    { px: 26, py: 42, n: "2" },
    { px: 24, py: 56, n: "3" },
    { px: 32, py: 67, n: "4" },
    { px: 50, py: 76, n: "5" },
    { px: 65, py: 65, n: "6" },
    { px: 68, py: 50, n: "7" },
    { px: 65, py: 30, n: "8" },
  ],

  // ঔ — ও left part, right element: top hook, arc down, hook back up
  "ঔ": [
    { px: 26, py: 30, n: "1" },
    { px: 22, py: 44, n: "2" },
    { px: 26, py: 64, n: "3" },
    { px: 42, py: 74, n: "4" },
    { px: 52, py: 30, n: "5" },
    { px: 70, py: 36, n: "6" },
    { px: 74, py: 48, n: "7" },
    { px: 65, py: 62, n: "8" },
    { px: 52, py: 72, n: "9" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  CONSONANTS — Ka group
  // ════════════════════════════════════════════════════════════════════════════

  // ক — matra, left vertical, upper-right arm, lower-right arm
  "ক": [
    { px: 28, py: 32, n: "1" },
    { px: 70, py: 32, n: "2" },
    { px: 34, py: 36, n: "3" },
    { px: 34, py: 54, n: "4" },
    { px: 34, py: 76, n: "5" },
    { px: 48, py: 46, n: "6" },
    { px: 68, py: 36, n: "7" },
    { px: 50, py: 59, n: "8" },
    { px: 70, py: 65, n: "9" },
  ],

  // খ — matra, left vertical, right upper arm, right lower arm
  "খ": [
    { px: 28, py: 32, n: "1" },
    { px: 70, py: 32, n: "2" },
    { px: 34, py: 36, n: "3" },
    { px: 34, py: 56, n: "4" },
    { px: 34, py: 76, n: "5" },
    { px: 48, py: 48, n: "6" },
    { px: 68, py: 34, n: "7" },
    { px: 50, py: 60, n: "8" },
    { px: 68, py: 64, n: "9" },
  ],

  // গ — matra right→left, down left, across bottom, up right, inner bar
  "গ": [
    { px: 68, py: 32, n: "1" },
    { px: 32, py: 32, n: "2" },
    { px: 28, py: 46, n: "3" },
    { px: 30, py: 64, n: "4" },
    { px: 50, py: 68, n: "5" },
    { px: 66, py: 62, n: "6" },
    { px: 66, py: 46, n: "7" },
    { px: 46, py: 46, n: "8" },
  ],

  // ঘ — matra, left vertical, right upper hook, lower hook, bottom tail
  "ঘ": [
    { px: 28, py: 32, n: "1" },
    { px: 70, py: 32, n: "2" },
    { px: 34, py: 36, n: "3" },
    { px: 34, py: 56, n: "4" },
    { px: 34, py: 76, n: "5" },
    { px: 48, py: 48, n: "6" },
    { px: 68, py: 34, n: "7" },
    { px: 68, py: 59, n: "8" },
    { px: 54, py: 70, n: "9" },
  ],

  // ঙ — matra, backward-9 body, descending tail
  "ঙ": [
    { px: 68, py: 32, n: "1" },
    { px: 42, py: 32, n: "2" },
    { px: 28, py: 42, n: "3" },
    { px: 26, py: 58, n: "4" },
    { px: 40, py: 66, n: "5" },
    { px: 58, py: 62, n: "6" },
    { px: 66, py: 50, n: "7" },
    { px: 60, py: 80, n: "8" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  Ca group
  // ════════════════════════════════════════════════════════════════════════════

  // চ — matra right→left, body curves down and along bottom right
  "চ": [
    { px: 68, py: 32, n: "1" },
    { px: 34, py: 32, n: "2" },
    { px: 28, py: 46, n: "3" },
    { px: 28, py: 62, n: "4" },
    { px: 36, py: 74, n: "5" },
    { px: 52, py: 78, n: "6" },
    { px: 66, py: 72, n: "7" },
  ],

  // ছ — like চ with extra foot at bottom-right
  "ছ": [
    { px: 68, py: 32, n: "1" },
    { px: 34, py: 32, n: "2" },
    { px: 28, py: 46, n: "3" },
    { px: 28, py: 62, n: "4" },
    { px: 36, py: 72, n: "5" },
    { px: 52, py: 74, n: "6" },
    { px: 58, py: 64, n: "7" },
    { px: 56, py: 82, n: "8" },
  ],

  // জ — matra, center stem, curves left at bottom hook
  "জ": [
    { px: 28, py: 32, n: "1" },
    { px: 70, py: 32, n: "2" },
    { px: 52, py: 36, n: "3" },
    { px: 52, py: 52, n: "4" },
    { px: 52, py: 65, n: "5" },
    { px: 38, py: 76, n: "6" },
    { px: 28, py: 82, n: "7" },
  ],

  // ঝ — matra, center stem, bottom fork left and right
  "ঝ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 50, py: 64, n: "5" },
    { px: 32, py: 74, n: "6" },
    { px: 50, py: 74, n: "7" },
    { px: 66, py: 74, n: "8" },
  ],

  // ঞ — two connected oval loops
  "ঞ": [
    { px: 30, py: 34, n: "1" },
    { px: 26, py: 46, n: "2" },
    { px: 36, py: 64, n: "3" },
    { px: 52, py: 64, n: "4" },
    { px: 66, py: 56, n: "5" },
    { px: 66, py: 38, n: "6" },
    { px: 52, py: 34, n: "7" },
    { px: 38, py: 38, n: "8" },
    { px: 38, py: 52, n: "9" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  Ṭa group (retroflex)
  // ════════════════════════════════════════════════════════════════════════════

  // ট — matra, center vertical, T-base left and right
  "ট": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 50, py: 70, n: "5" },
    { px: 30, py: 76, n: "6" },
    { px: 50, py: 76, n: "7" },
    { px: 68, py: 76, n: "8" },
  ],

  // ঠ — matra, V-spread arms meeting at bottom
  "ঠ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 28, py: 40, n: "3" },
    { px: 38, py: 54, n: "4" },
    { px: 50, py: 64, n: "5" },
    { px: 62, py: 54, n: "6" },
    { px: 70, py: 40, n: "7" },
    { px: 50, py: 76, n: "8" },
  ],

  // ড — full oval clockwise: top→right→bottom→left→top
  "ড": [
    { px: 50, py: 32, n: "1" },
    { px: 66, py: 34, n: "2" },
    { px: 72, py: 48, n: "3" },
    { px: 70, py: 64, n: "4" },
    { px: 54, py: 74, n: "5" },
    { px: 36, py: 72, n: "6" },
    { px: 26, py: 60, n: "7" },
    { px: 28, py: 44, n: "8" },
    { px: 40, py: 34, n: "9" },
  ],

  // ঢ — like ড oval + inner stroke + right arm extension
  "ঢ": [
    { px: 50, py: 32, n: "1" },
    { px: 66, py: 34, n: "2" },
    { px: 72, py: 48, n: "3" },
    { px: 70, py: 64, n: "4" },
    { px: 54, py: 74, n: "5" },
    { px: 36, py: 72, n: "6" },
    { px: 26, py: 60, n: "7" },
    { px: 28, py: 44, n: "8" },
    { px: 40, py: 34, n: "9" },
    { px: 72, py: 46, n: "10" },
    { px: 80, py: 38, n: "11" },
  ],

  // ণ — matra, right side down, bottom arc left, close loop up
  "ণ": [
    { px: 28, py: 32, n: "1" },
    { px: 70, py: 32, n: "2" },
    { px: 70, py: 46, n: "3" },
    { px: 70, py: 62, n: "4" },
    { px: 54, py: 74, n: "5" },
    { px: 36, py: 72, n: "6" },
    { px: 26, py: 60, n: "7" },
    { px: 28, py: 46, n: "8" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  Ta group (dental)
  // ════════════════════════════════════════════════════════════════════════════

  // ত — matra, center stem, two legs spreading at base
  "ত": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 50, py: 64, n: "5" },
    { px: 32, py: 74, n: "6" },
    { px: 50, py: 74, n: "7" },
    { px: 66, py: 74, n: "8" },
  ],

  // থ — matra, center vertical, complex right extension
  "থ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 50, py: 62, n: "5" },
    { px: 38, py: 76, n: "6" },
    { px: 50, py: 76, n: "7" },
    { px: 62, py: 66, n: "8" },
    { px: 70, py: 76, n: "9" },
  ],

  // দ — curved top-right sweep, body curves left, straight base
  "দ": [
    { px: 68, py: 32, n: "1" },
    { px: 50, py: 30, n: "2" },
    { px: 34, py: 36, n: "3" },
    { px: 28, py: 50, n: "4" },
    { px: 32, py: 64, n: "5" },
    { px: 50, py: 76, n: "6" },
    { px: 68, py: 72, n: "7" },
  ],

  // ধ — matra, center stem, complex fork at bottom
  "ধ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 50, py: 64, n: "5" },
    { px: 32, py: 72, n: "6" },
    { px: 50, py: 72, n: "7" },
    { px: 66, py: 62, n: "8" },
    { px: 70, py: 74, n: "9" },
  ],

  // ন — matra, right side down, bottom arc, close back up left
  "ন": [
    { px: 28, py: 32, n: "1" },
    { px: 70, py: 32, n: "2" },
    { px: 70, py: 44, n: "3" },
    { px: 72, py: 60, n: "4" },
    { px: 60, py: 72, n: "5" },
    { px: 44, py: 76, n: "6" },
    { px: 28, py: 66, n: "7" },
    { px: 26, py: 50, n: "8" },
    { px: 30, py: 38, n: "9" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  Pa group
  // ════════════════════════════════════════════════════════════════════════════

  // প — matra, left vertical, right vertical with crossbar at mid
  "প": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 32, py: 34, n: "3" },
    { px: 32, py: 54, n: "4" },
    { px: 32, py: 76, n: "5" },
    { px: 66, py: 34, n: "6" },
    { px: 66, py: 54, n: "7" },
    { px: 50, py: 54, n: "8" },
  ],

  // ফ — matra, left vertical, right vertical, both to bottom (no crossbar)
  "ফ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 32, py: 34, n: "3" },
    { px: 32, py: 56, n: "4" },
    { px: 32, py: 76, n: "5" },
    { px: 66, py: 34, n: "6" },
    { px: 68, py: 56, n: "7" },
    { px: 66, py: 76, n: "8" },
  ],

  // ব — matra, left vertical, right curve closing back at mid-left
  "ব": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 32, py: 34, n: "3" },
    { px: 32, py: 54, n: "4" },
    { px: 32, py: 76, n: "5" },
    { px: 66, py: 40, n: "6" },
    { px: 70, py: 56, n: "7" },
    { px: 66, py: 68, n: "8" },
    { px: 32, py: 60, n: "9" },
  ],

  // ভ — matra, left vertical, right vertical with bottom hook
  "ভ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 32, py: 34, n: "3" },
    { px: 32, py: 56, n: "4" },
    { px: 32, py: 76, n: "5" },
    { px: 66, py: 34, n: "6" },
    { px: 68, py: 54, n: "7" },
    { px: 58, py: 66, n: "8" },
    { px: 44, py: 74, n: "9" },
  ],

  // ম — matra, oval body (clockwise loop)
  "ম": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 36, n: "3" },
    { px: 70, py: 44, n: "4" },
    { px: 74, py: 58, n: "5" },
    { px: 64, py: 70, n: "6" },
    { px: 50, py: 76, n: "7" },
    { px: 34, py: 70, n: "8" },
    { px: 26, py: 58, n: "9" },
    { px: 28, py: 44, n: "10" },
    { px: 40, py: 36, n: "11" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  Semi-vowels
  // ════════════════════════════════════════════════════════════════════════════

  // য — matra, center stem, curves left then hooks right at bottom
  "য": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 50, py: 64, n: "5" },
    { px: 34, py: 68, n: "6" },
    { px: 28, py: 78, n: "7" },
    { px: 50, py: 80, n: "8" },
    { px: 64, py: 72, n: "9" },
  ],

  // র — matra, then diagonal stroke descending right
  "র": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 52, py: 34, n: "3" },
    { px: 52, py: 48, n: "4" },
    { px: 56, py: 64, n: "5" },
    { px: 60, py: 76, n: "6" },
  ],

  // ল — center vertical top→bottom, T-spread at base
  "ল": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 52, n: "4" },
    { px: 50, py: 70, n: "5" },
    { px: 30, py: 76, n: "6" },
    { px: 50, py: 76, n: "7" },
    { px: 68, py: 70, n: "8" },
    { px: 60, py: 78, n: "9" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  Sibilants / Aspirate
  // ════════════════════════════════════════════════════════════════════════════

  // শ — matra, left half-vertical, right half-vertical, center drop to base
  "শ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 32, py: 34, n: "3" },
    { px: 32, py: 56, n: "4" },
    { px: 68, py: 34, n: "5" },
    { px: 68, py: 56, n: "6" },
    { px: 50, py: 64, n: "7" },
    { px: 50, py: 76, n: "8" },
  ],

  // ষ — matra, diagonal body curving to lower-right
  "ষ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 32, py: 36, n: "3" },
    { px: 38, py: 48, n: "4" },
    { px: 50, py: 60, n: "5" },
    { px: 62, py: 64, n: "6" },
    { px: 70, py: 76, n: "7" },
  ],

  // স — top bar right→left, left side down, mid-bar right, right down, base left
  "স": [
    { px: 70, py: 32, n: "1" },
    { px: 30, py: 32, n: "2" },
    { px: 28, py: 44, n: "3" },
    { px: 30, py: 54, n: "4" },
    { px: 66, py: 54, n: "5" },
    { px: 68, py: 64, n: "6" },
    { px: 62, py: 76, n: "7" },
    { px: 30, py: 76, n: "8" },
  ],

  // হ — left vertical full height, right arm curves up-right then down
  "হ": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 32, py: 34, n: "3" },
    { px: 32, py: 54, n: "4" },
    { px: 32, py: 76, n: "5" },
    { px: 38, py: 48, n: "6" },
    { px: 66, py: 36, n: "7" },
    { px: 70, py: 54, n: "8" },
    { px: 66, py: 70, n: "9" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  Modified consonants (nukta letters)
  // ════════════════════════════════════════════════════════════════════════════

  // ড় — oval like ড + descending tail
  "ড়": [
    { px: 50, py: 32, n: "1" },
    { px: 66, py: 34, n: "2" },
    { px: 72, py: 48, n: "3" },
    { px: 70, py: 60, n: "4" },
    { px: 54, py: 72, n: "5" },
    { px: 36, py: 70, n: "6" },
    { px: 26, py: 58, n: "7" },
    { px: 28, py: 44, n: "8" },
    { px: 40, py: 34, n: "9" },
    { px: 50, py: 84, n: "10" },
  ],

  // ঢ় — like ঢ oval + inner stroke + tail
  "ঢ়": [
    { px: 50, py: 32, n: "1" },
    { px: 66, py: 34, n: "2" },
    { px: 72, py: 48, n: "3" },
    { px: 70, py: 60, n: "4" },
    { px: 54, py: 72, n: "5" },
    { px: 36, py: 70, n: "6" },
    { px: 26, py: 58, n: "7" },
    { px: 28, py: 44, n: "8" },
    { px: 40, py: 34, n: "9" },
    { px: 72, py: 46, n: "10" },
    { px: 50, py: 84, n: "11" },
  ],

  // য় — like য body + descending tail
  "য়": [
    { px: 26, py: 32, n: "1" },
    { px: 72, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 50, py: 60, n: "5" },
    { px: 34, py: 68, n: "6" },
    { px: 28, py: 78, n: "7" },
    { px: 50, py: 80, n: "8" },
    { px: 64, py: 72, n: "9" },
    { px: 50, py: 88, n: "10" },
  ],

  // ৎ — truncated ত: matra, short center stem, small left foot only
  "ৎ": [
    { px: 26, py: 32, n: "1" },
    { px: 70, py: 32, n: "2" },
    { px: 50, py: 34, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 50, py: 60, n: "5" },
    { px: 36, py: 72, n: "6" },
    { px: 28, py: 78, n: "7" },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  //  Special marks
  // ════════════════════════════════════════════════════════════════════════════

  // ং — anusvara: crescent arc
  "ং": [
    { px: 34, py: 36, n: "1" },
    { px: 52, py: 32, n: "2" },
    { px: 66, py: 36, n: "3" },
    { px: 70, py: 50, n: "4" },
    { px: 60, py: 60, n: "5" },
    { px: 44, py: 64, n: "6" },
    { px: 30, py: 58, n: "7" },
    { px: 28, py: 46, n: "8" },
  ],

  // ঃ — visarga: two small circles, top then bottom
  "ঃ": [
    { px: 44, py: 36, n: "1" },
    { px: 56, py: 36, n: "2" },
    { px: 58, py: 44, n: "3" },
    { px: 50, py: 48, n: "4" },
    { px: 42, py: 44, n: "5" },
    { px: 44, py: 62, n: "6" },
    { px: 56, py: 62, n: "7" },
    { px: 58, py: 70, n: "8" },
    { px: 50, py: 78, n: "9" },
    { px: 42, py: 70, n: "10" },
  ],

  // ঁ — chandrabindu: crescent + dot above
  "ঁ": [
    { px: 28, py: 46, n: "1" },
    { px: 38, py: 36, n: "2" },
    { px: 52, py: 30, n: "3" },
    { px: 66, py: 36, n: "4" },
    { px: 72, py: 46, n: "5" },
    { px: 62, py: 58, n: "6" },
    { px: 48, py: 62, n: "7" },
    { px: 50, py: 32, n: "8" },
  ],
};

// ── Letter join / connection guide ───────────────────────────────────────────
// Shows students how each letter connects with others before they trace.
// `diacritic` = the কার form vowels take when attached to a consonant
// `withKa`    = example: the letter combined with ক
// `rule`      = one-sentence joining rule
type LetterGuide = { diacritic?: string; withKa?: string; rule: string };

const LETTER_GUIDE: Record<string, LetterGuide> = {
  // ── Vowels ──────────────────────────────────────────────────────────────────
  "অ": { rule: "অ is the inherent vowel. Every consonant has অ built in: ক = 'ko'. No diacritic needed when অ follows a consonant naturally." },
  "আ": { diacritic: "া", withKa: "কা", rule: "আ adds the vertical bar (আ-কার: া) to the right of a consonant. কা = 'kaa'." },
  "ই": { diacritic: "ি", withKa: "কি", rule: "ই uses ি (ইকার) which is written BEFORE the consonant it belongs to, even though it is pronounced after. কি = 'ki'." },
  "ঈ": { diacritic: "ী", withKa: "কী", rule: "ঈ adds ী (দীর্ঘ ই-কার) to the right of a consonant. কী = 'kii' (long i sound)." },
  "উ": { diacritic: "ু", withKa: "কু", rule: "উ adds ু (উ-কার) below-right of a consonant. কু = 'ku'." },
  "ঊ": { diacritic: "ূ", withKa: "কূ", rule: "ঊ adds ূ (দীর্ঘ উ-কার) below-right of a consonant. কূ = 'kuu' (long u sound)." },
  "ঋ": { diacritic: "ৃ", withKa: "কৃ", rule: "ঋ adds ৃ (ঋ-কার) curling below a consonant. কৃ = 'kri'." },
  "এ": { diacritic: "ে", withKa: "কে", rule: "এ adds ে (এ-কার) to the LEFT of a consonant. কে = 'ke'. Written before but spoken after." },
  "ঐ": { diacritic: "ৈ", withKa: "কৈ", rule: "ঐ adds ৈ (ঐ-কার) to the left of a consonant. কৈ = 'koi'." },
  "ও": { diacritic: "ো", withKa: "কো", rule: "ও splits into two parts: ে on the left + া on the right of a consonant. কো = 'ko'." },
  "ঔ": { diacritic: "ৌ", withKa: "কৌ", rule: "ঔ splits into ে on the left + ৌ on the right of a consonant. কৌ = 'kou'." },
  // ── Consonants ──────────────────────────────────────────────────────────────
  "ক": { withKa: "কক", rule: "ক connects to the next letter via the মাত্রা (horizontal top bar). In clusters: ক্ক (kk), ক্ষ (ksha)." },
  "খ": { withKa: "খক", rule: "খ joins via মাত্রা. Example cluster: খ্য (khya) in words like মুখ্য." },
  "গ": { withKa: "গক", rule: "গ joins via মাত্রা. Cluster: গ্র (gra) in words like গ্রাম (village)." },
  "ঘ": { withKa: "ঘক", rule: "ঘ joins via মাত্রা. Cluster: ঘ্র (ghra)." },
  "ঙ": { rule: "ঙ is the nasal sound (as in 'ng'). It rarely starts words. Common in: বাংলা, রঙ (color)." },
  "চ": { withKa: "চক", rule: "চ joins via মাত্রা. Cluster: চ্চ (cca), চ্ছ (ccha)." },
  "ছ": { rule: "ছ joins via মাত্রা. Aspirated form of চ." },
  "জ": { withKa: "জক", rule: "জ joins via মাত্রা. Cluster: জ্ঞ (gya/jña) in words like জ্ঞান (knowledge)." },
  "ঝ": { rule: "ঝ joins via মাত্রা. Aspirated form of জ." },
  "ঞ": { rule: "ঞ is a nasal consonant appearing mostly in clusters like জ্ঞ, ঞ্চ." },
  "ট": { withKa: "টক", rule: "ট (retroflex 't') joins via মাত্রা. Cluster: ট্ট (ṭṭa), ষ্ট (shṭa)." },
  "ঠ": { rule: "ঠ joins via মাত্রা. Aspirated retroflex." },
  "ড": { rule: "ড joins via মাত্রা. Cluster: ড্ড (ḍḍa). Modified form: ড় (ra-sound)." },
  "ঢ": { rule: "ঢ joins via মাত্রা. Modified form: ঢ় (sound like 'rha')." },
  "ণ": { rule: "ণ (retroflex n) joins via মাত্রা. Common in clusters: ণ্ড, ষ্ণ." },
  "ত": { withKa: "তক", rule: "ত joins via মাত্রা. Common clusters: ত্ব (tva), ত্র (tra), স্ত (sta)." },
  "থ": { rule: "থ joins via মাত্রা. Aspirated form of ত." },
  "দ": { withKa: "দক", rule: "দ joins via মাত্রা. Clusters: দ্র (dra), ন্দ (nda)." },
  "ধ": { rule: "ধ joins via মাত্রা. Aspirated form of দ. Cluster: ধ্য (dhya)." },
  "ন": { withKa: "নক", rule: "ন joins via মাত্রা. Common clusters: ন্ত (nta), ন্দ (nda), ন্ব (nba)." },
  "প": { withKa: "পক", rule: "প joins via মাত্রা. Cluster: প্র (pra), ষ্প (shpa)." },
  "ফ": { rule: "ফ joins via মাত্রা. Aspirated form of প." },
  "ব": { withKa: "বক", rule: "ব joins via মাত্রা. As a cluster connector: ব (ba-fola) hangs below: ক্ব." },
  "ভ": { rule: "ভ joins via মাত্রা. Aspirated form of ব. Cluster: ভ্র (bhra)." },
  "ম": { withKa: "মক", rule: "ম joins via মাত্রা. As a cluster component: ম (ma-fola) hangs below: ক্ম." },
  "য": { withKa: "যক", rule: "য joins via মাত্রা. য-ফলা: a modified য hangs below or after consonants — ক্য = 'kya'." },
  "র": { withKa: "রক", rule: "র joins via মাত্রা. র-ফলা: a modified র hangs below — ক্র = 'kra'. রেফ: র above — র্ক = 'rka'." },
  "ল": { withKa: "লক", rule: "ল joins via মাত্রা. Cluster: ল্ল (lla), ল্প (lpa)." },
  "শ": { withKa: "শক", rule: "শ joins via মাত্রা. Cluster: শ্র (shra), শ্ব (shba)." },
  "ষ": { withKa: "ষক", rule: "ষ (retroflex sha) joins via মাত্রা. Clusters: ষ্ট (shṭa), ষ্ণ (shna), ষ্ঠ." },
  "স": { withKa: "সক", rule: "স joins via মাত্রা. Clusters: স্ত (sta), স্থ (stha), স্ন (sna), স্প (spa)." },
  "হ": { withKa: "হক", rule: "হ joins via মাত্রা. হসন্ত (্) removes the inherent অ vowel to create a pure consonant cluster." },
  "ড়": { rule: "ড় is a modified ড with a dot (নুক্তা). It makes an 'r' sound. Common in: পড়া (to read), বড় (big)." },
  "ঢ়": { rule: "ঢ় is a modified ঢ with a নুক্তা dot. Used in words like ঢেঁকি." },
  "য়": { rule: "য় (অন্তস্থ য) makes a 'y' sound at the end of words: যাওয়া, খাওয়া." },
  "ৎ": { rule: "ৎ (খণ্ড-ত) is a word-final consonant. It never starts a word. Example: উৎস (source)." },
  "ং": { rule: "ং (অনুস্বার) adds an 'ng' nasal sound after a vowel. Example: বাংলা, রং." },
  "ঃ": { rule: "ঃ (বিসর্গ) adds a soft 'h' echo after a vowel. Used in formal/Sanskrit words: দুঃখ (sorrow)." },
  "ঁ": { rule: "ঁ (চন্দ্রবিন্দু) nasalizes the vowel above which it sits. Example: চাঁদ (moon), মাঁ (mother)." },
};

// ── LetterStudyGuide sub-component ───────────────────────────────────────────
function LetterStudyGuide({ char, guide }: { char: string; guide: LetterGuide }) {
  const [open, setOpen] = useState(true);
  return (
    <View style={sg.wrapper}>
      <TouchableOpacity
        style={sg.header}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.75}
      >
        <View style={sg.headerLeft}>
          <Ionicons name="library-outline" size={14} color={BD_GREEN} />
          <Text style={sg.headerText}>How to use this letter</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color="#9ca3af" />
      </TouchableOpacity>

      {open && (
        <View style={sg.body}>
          {/* Joining example row */}
          {guide.diacritic && (
            <View style={sg.row}>
              <View style={sg.exBox}>
                <Text style={sg.exLabel}>Independent</Text>
                <Text style={sg.exChar}>{char}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9ca3af" style={{ marginTop: 14 }} />
              <View style={sg.exBox}>
                <Text style={sg.exLabel}>As diacritic</Text>
                <Text style={sg.exChar}>{guide.diacritic}</Text>
              </View>
              {guide.withKa && (
                <>
                  <Ionicons name="arrow-forward" size={16} color="#9ca3af" style={{ marginTop: 14 }} />
                  <View style={[sg.exBox, sg.exBoxHighlight]}>
                    <Text style={sg.exLabel}>On ক</Text>
                    <Text style={sg.exChar}>{guide.withKa}</Text>
                  </View>
                </>
              )}
            </View>
          )}
          {!guide.diacritic && guide.withKa && (
            <View style={sg.row}>
              <View style={sg.exBox}>
                <Text style={sg.exLabel}>Alone</Text>
                <Text style={sg.exChar}>{char}</Text>
              </View>
              <Ionicons name="add" size={16} color="#9ca3af" style={{ marginTop: 14 }} />
              <View style={sg.exBox}>
                <Text style={sg.exLabel}>In cluster</Text>
                <Text style={sg.exChar}>{guide.withKa}</Text>
              </View>
            </View>
          )}
          {/* Rule text */}
          <Text style={sg.rule}>{guide.rule}</Text>
        </View>
      )}
    </View>
  );
}

type Props = { exercise: LetterTraceExercise; onComplete: () => void };

export default function LetterTrace({ exercise, onComplete }: Props) {
  const [pathData, setPathData]  = useState("");
  const [hitWps,   setHitWps]    = useState<Set<number>>(new Set());
  const [done,     setDone]      = useState(false);
  const [tries,    setTries]     = useState(0);
  const [canvasW,  setCanvasW]   = useState(300);
  const [canvasH,  setCanvasH]   = useState(260);

  const doneRef       = useRef(false);
  const pathRef       = useRef("");
  const hitRef        = useRef<Set<number>>(new Set());
  const canvasRef     = useRef({ w: 300, h: 260 });
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  const enterAnim    = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const wordFade     = useRef(new Animated.Value(0)).current;
  const wordSlide    = useRef(new Animated.Value(20)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;

  const wps = WAYPOINTS[exercise.character] ?? [];
  const needed = Math.max(2, Math.ceil(wps.length * PASS_RATIO));

  useEffect(() => {
    Animated.spring(enterAnim, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  function checkHits(x: number, y: number) {
    const { w, h } = canvasRef.current;
    let changed = false;
    wps.forEach((wp, i) => {
      if (hitRef.current.has(i)) return;
      const wx = (wp.px / 100) * w;
      const wy = (wp.py / 100) * h;
      if (Math.sqrt((x - wx) ** 2 + (y - wy) ** 2) < HIT_RADIUS) {
        hitRef.current = new Set([...hitRef.current, i]);
        changed = true;
      }
    });
    if (changed) setHitWps(new Set(hitRef.current));
  }

  function resetAttempt() {
    pathRef.current = "";
    hitRef.current  = new Set();
    setPathData("");
    setHitWps(new Set());
  }

  function handleRelease() {
    if (doneRef.current) return;
    if (hitRef.current.size >= needed) {
      doneRef.current = true;
      setDone(true);
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(350),
          Animated.parallel([
            Animated.timing(wordFade,  { toValue: 1, duration: 320, useNativeDriver: true }),
            Animated.spring(wordSlide, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    }
    // NOTE: we do NOT reset hits here — the user can keep going with more strokes
    // A failed lift just means they need to keep tracing; state persists
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => !doneRef.current,
      onMoveShouldSetPanResponderCapture:  () => !doneRef.current,
      onStartShouldSetPanResponder: () => !doneRef.current,
      onMoveShouldSetPanResponder:  () => !doneRef.current,

      onPanResponderGrant: (e) => {
        if (doneRef.current) return;
        const { locationX: x, locationY: y } = e.nativeEvent;
        // Append a new Move command — hits from previous strokes are KEPT
        pathRef.current += (pathRef.current ? " M " : "M ") + `${x.toFixed(1)},${y.toFixed(1)}`;
        setPathData(pathRef.current);
        checkHits(x, y);
      },
      onPanResponderMove: (e) => {
        if (doneRef.current) return;
        const { locationX: x, locationY: y } = e.nativeEvent;
        pathRef.current += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
        setPathData(pathRef.current);
        checkHits(x, y);
      },
      onPanResponderRelease: handleRelease,
      onPanResponderTerminate: handleRelease,
    })
  ).current;

  function handleLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    canvasRef.current = { w: width, h: height };
    setCanvasW(width);
    setCanvasH(height);
  }

  // Dashed guide path between consecutive waypoints
  const guidePath = wps.length >= 2
    ? wps.map((wp, i) =>
        `${i === 0 ? "M" : "L"} ${((wp.px / 100) * canvasW).toFixed(1)},${((wp.py / 100) * canvasH).toFixed(1)}`
      ).join(" ")
    : "";

  const hitCount = hitWps.size;
  const hintText = done
    ? "Brilliant! ✓"
    : hitCount > 0
    ? `${hitCount}/${wps.length} dots hit — keep going!`
    : exercise.strokeHint ?? "Trace through the numbered dots in order";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: enterAnim,
          transform: [{ translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
        },
      ]}
    >
      {/* ── Character header: big character + romanization ─────────────────── */}
      <View style={styles.charHeader}>
        <Text style={styles.charHeaderSymbol}>{exercise.character}</Text>
        <View style={styles.charHeaderRight}>
          <Text style={styles.charHeaderRoman}>/{exercise.romanization}/</Text>
          {exercise.exampleWord && (
            <Text style={styles.charHeaderExample} numberOfLines={1}>{exercise.exampleWord}</Text>
          )}
        </View>
      </View>

      {/* ── Study guide: joining / connection rules ────────────────────────── */}
      {LETTER_GUIDE[exercise.character] && (
        <LetterStudyGuide char={exercise.character} guide={LETTER_GUIDE[exercise.character]} />
      )}

      {/* Hint text */}
      <Text style={[styles.hint, done && styles.hintDone]}>{hintText}</Text>

      {/* ── Drawing canvas ─────────────────────────────────────────────────── */}
      <View style={styles.canvas} onLayout={handleLayout} {...panResponder.panHandlers}>

        {/* Guide letter (faded background) */}
        <Text style={[styles.guideLetter, done && styles.guideLetterDone]}>
          {exercise.character}
        </Text>

        {/* Romanization pill — always visible in top-left while tracing */}
        {!done && (
          <View style={styles.romanPill}>
            <Text style={styles.romanPillText}>/{exercise.romanization}/</Text>
          </View>
        )}

        {/* SVG layer: guide path + user stroke + waypoint circles */}
        <Svg style={StyleSheet.absoluteFill} width={canvasW} height={canvasH}>

          {/* Dashed guide path */}
          {!done && guidePath ? (
            <Path
              d={guidePath}
              stroke="#c7d2fe"
              strokeWidth={3}
              fill="none"
              strokeDasharray="8,6"
              strokeLinecap="round"
            />
          ) : null}

          {/* User's drawn strokes */}
          {pathData ? (
            <Path
              d={pathData}
              stroke={done ? "#4ade80" : BD_GREEN}
              strokeWidth={16}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={done ? 0.9 : 0.85}
            />
          ) : null}

          {/* Waypoint circles */}
          {!done && wps.map((wp, i) => {
            const cx  = (wp.px / 100) * canvasW;
            const cy  = (wp.py / 100) * canvasH;
            const hit = hitWps.has(i);
            const isFirst = i === 0;
            return (
              <Circle
                key={i}
                cx={cx} cy={cy}
                r={isFirst ? 18 : 14}
                fill={hit ? BD_GREEN : isFirst ? "#e0f2fe" : "#fff"}
                stroke={hit ? BD_GREEN : isFirst ? "#0284c7" : "#9ca3af"}
                strokeWidth={hit ? 0 : isFirst ? 3 : 2}
                opacity={0.95}
              />
            );
          })}
        </Svg>

        {/* Number labels on waypoints */}
        {!done && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {wps.map((wp, i) => {
              const hit = hitWps.has(i);
              return (
                <Text
                  key={i}
                  style={[
                    styles.wpNum,
                    {
                      left:  (wp.px / 100) * canvasW - 8,
                      top:   (wp.py / 100) * canvasH - 9,
                      color: hit ? "#fff" : "#374151",
                    },
                  ]}
                >
                  {wp.n}
                </Text>
              );
            })}
          </View>
        )}

        {/* Progress badge */}
        {!done && hitCount > 0 && (
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{hitCount}/{wps.length}</Text>
          </View>
        )}

        {/* Success overlay */}
        {done && (
          <Animated.View style={[styles.successRing, { transform: [{ scale: successScale }] }]}>
            <Ionicons name="checkmark-circle" size={64} color="#4ade80" />
          </Animated.View>
        )}
      </View>

      {/* ── Reset row ─────────────────────────────────────────────────────── */}
      {!done && (
        <View style={styles.resetRow}>
          <TouchableOpacity
            onPress={() => { resetAttempt(); setTries((t) => t + 1); }}
            style={styles.resetBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color="#9ca3af" />
            <Text style={styles.resetBtnText}>Clear & retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stroke guide legend */}
      {!done && tries === 0 && (
        <View style={styles.legendRow}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>
            Start at dot <Text style={{ fontWeight: "800", color: "#0284c7" }}>1</Text>, drag through each numbered circle in order.
            You can lift and re-trace — dots stay hit.
          </Text>
        </View>
      )}

      {/* Word box after success */}
      {done && exercise.exampleWord && (
        <Animated.View style={[styles.wordBox, { opacity: wordFade, transform: [{ translateY: wordSlide }] }]}>
          <View style={styles.wordBoxHeader}>
            <Ionicons name="link-outline" size={15} color={BD_GREEN} />
            <Text style={styles.wordBoxLabel}>Used in a word</Text>
          </View>
          <Text style={styles.wordBoxWord}>{exercise.exampleWord}</Text>
          <Text style={styles.wordBoxHint}>
            The letter <Text style={{ color: BD_GREEN, fontWeight: "800" }}>{exercise.character}</Text> joins
            with other letters using the horizontal line (মাত্রা) at the top.
          </Text>
        </Animated.View>
      )}

      {/* Continue button after success */}
      {done && (
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => onCompleteRef.current()}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: 2 },

  // ── Character header ──────────────────────────────────────────────────────
  charHeader: {
    flexDirection: "row", alignItems: "center", gap: 14,
    width: "100%", marginBottom: 12,
    backgroundColor: "#f0fdf4", borderRadius: 16,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  charHeaderSymbol: {
    fontSize: 54, fontWeight: "900", color: "#1f2937", lineHeight: 62,
  },
  charHeaderRight: { flex: 1 },
  charHeaderRoman: {
    fontSize: 22, fontWeight: "800", color: BD_GREEN, letterSpacing: 0.5,
  },
  charHeaderExample: {
    fontSize: 13, color: "#6b7280", marginTop: 2,
  },

  // ── Romanization pill inside canvas ──────────────────────────────────────
  romanPill: {
    position: "absolute", top: 10, left: 10,
    backgroundColor: "rgba(0,106,78,0.12)",
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1.5, borderColor: "rgba(0,106,78,0.2)",
  },
  romanPillText: {
    fontSize: 13, fontWeight: "800", color: BD_GREEN,
  },

  hint: {
    fontSize: 12, fontWeight: "700", color: "#6366f1",
    letterSpacing: 0.5, marginBottom: 10, textAlign: "center",
  },
  hintDone: { color: "#16a34a" },

  canvas: {
    width: "100%", height: 270,
    backgroundColor: "#fafafa",
    borderRadius: 22, borderWidth: 2, borderColor: "#e0e7ff",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden", position: "relative",
  },
  guideLetter: {
    fontSize: 155, color: "rgba(0,106,78,0.09)", fontWeight: "900",
    textAlign: "center", includeFontPadding: false, position: "absolute",
  },
  guideLetterDone: { color: "rgba(74,222,128,0.16)" },

  wpNum: {
    position: "absolute", fontSize: 11, fontWeight: "900",
    width: 16, textAlign: "center",
  },

  progressBadge: {
    position: "absolute", top: 10, right: 10,
    backgroundColor: BD_GREEN, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  progressBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  successRing: {
    position: "absolute",
    backgroundColor: "rgba(240,253,244,0.95)",
    borderRadius: 56, padding: 16,
  },

  resetRow: {
    width: "100%", alignItems: "flex-end", marginTop: 10, paddingHorizontal: 4,
  },
  resetBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1.5, borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  resetBtnText: { fontSize: 12, color: "#9ca3af", fontWeight: "700" },

  legendRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    marginTop: 10, paddingHorizontal: 4, width: "100%",
  },
  legendDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#0284c7", marginTop: 4, flexShrink: 0,
  },
  legendText: { fontSize: 12, color: "#6b7280", lineHeight: 18, flex: 1, flexWrap: "wrap" },

  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", marginTop: 16,
    backgroundColor: BD_GREEN, borderRadius: 18, paddingVertical: 16,
    shadowColor: "#003d2d", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 5,
  },
  continueBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  wordBox: {
    width: "100%", marginTop: 14,
    backgroundColor: "#f0fdf4", borderRadius: 16, padding: 16,
    borderLeftWidth: 4, borderLeftColor: BD_GREEN,
  },
  wordBoxHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  wordBoxLabel:  { fontSize: 11, fontWeight: "700", color: BD_GREEN, textTransform: "uppercase", letterSpacing: 0.8 },
  wordBoxWord:   { fontSize: 26, fontWeight: "900", color: "#1f2937", marginBottom: 6 },
  wordBoxHint:   { fontSize: 12, color: "#6b7280", lineHeight: 18, flexWrap: "wrap" },
});

// ── Study guide styles ────────────────────────────────────────────────────────
const sg = StyleSheet.create({
  wrapper: {
    width: "100%", marginBottom: 10,
    backgroundColor: "#eff6ff", borderRadius: 14,
    borderWidth: 1.5, borderColor: "#bfdbfe",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  headerText: { fontSize: 12, fontWeight: "800", color: BD_GREEN, letterSpacing: 0.4 },
  body: {
    paddingHorizontal: 14, paddingBottom: 14, gap: 10,
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    flexWrap: "wrap",
  },
  exBox: {
    alignItems: "center", backgroundColor: "#fff",
    borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: "#dbeafe",
    minWidth: 56,
  },
  exBoxHighlight: {
    borderColor: BD_GREEN, backgroundColor: "#f0fdf4",
  },
  exLabel: {
    fontSize: 9, fontWeight: "700", color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2,
  },
  exChar: {
    fontSize: 22, fontWeight: "900", color: "#1f2937",
  },
  rule: {
    fontSize: 12, color: "#374151", lineHeight: 18,
    backgroundColor: "#fff", borderRadius: 10,
    padding: 10, borderLeftWidth: 3, borderLeftColor: BD_GREEN,
  },
});
