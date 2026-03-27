import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path, Circle, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { T } from "@/lib/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export type Division = {
  id: string;
  name: string;       // Bengali
  nameEn: string;
  icon: IoniconsName;
  iconColor: string;
  cx: number;         // center x on the SVG map
  cy: number;         // center y
  unitId?: string;    // linked curriculum unit
  progress?: number;  // 0–100
};

// Bangladesh simplified SVG outline (viewBox 300 × 380)
const BD_PATH =
  "M 55,70 " +
  "L 80,45 L 110,35 L 145,28 L 178,32 L 205,28 " +
  "L 245,38 L 268,55 L 272,85 L 258,115 " +
  "L 268,150 L 270,185 L 262,215 " +
  "L 255,245 L 240,268 L 218,285 " +
  "L 195,310 L 170,328 L 145,335 L 120,330 " +
  "L 88,312 L 62,290 L 42,260 " +
  "L 35,225 L 32,185 L 40,145 L 42,110 L 48,85 Z";

// 8 Bangladesh divisions with cultural icons
export const DIVISIONS: Division[] = [
  { id: "rangpur",    name: "রংপুর",    nameEn: "Rangpur",    icon: "nutrition-outline",   iconColor: "#15803d", cx: 108, cy: 65  },
  { id: "mymensingh", name: "ময়মনসিংহ", nameEn: "Mymensingh", icon: "leaf-outline",         iconColor: "#0369a1", cx: 162, cy: 100 },
  { id: "sylhet",     name: "সিলেট",    nameEn: "Sylhet",     icon: "cafe-outline",         iconColor: "#7c3aed", cx: 235, cy: 80  },
  { id: "rajshahi",   name: "রাজশাহী",  nameEn: "Rajshahi",   icon: "rose-outline",         iconColor: "#b91c1c", cx: 75,  cy: 148 },
  { id: "dhaka",      name: "ঢাকা",     nameEn: "Dhaka",      icon: "bicycle-outline",      iconColor: T.green, cx: 158, cy: 165 },
  { id: "khulna",     name: "খুলনা",    nameEn: "Khulna",     icon: "leaf-outline",         iconColor: "#047857", cx: 72,  cy: 255 },
  { id: "barisal",    name: "বরিশাল",   nameEn: "Barisal",    icon: "boat-outline",         iconColor: "#0ea5e9", cx: 145, cy: 278 },
  { id: "chittagong", name: "চট্টগ্রাম", nameEn: "Chittagong", icon: "navigate-outline",     iconColor: "#d97706", cx: 240, cy: 210 },
];

type Props = {
  divisions: Division[];
  activeDivisionId?: string;
  onPressDivision?: (division: Division) => void;
};

export default function BangladeshMap({ divisions, activeDivisionId, onPressDivision }: Props) {
  const MAP_W = 300;
  const MAP_H = 380;

  return (
    <View style={styles.container}>
      <Svg width="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={styles.svg}>
        {/* Country outline */}
        <Path
          d={BD_PATH}
          fill="#d1fae5"
          stroke={T.green}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* Division markers */}
        {divisions.map((div) => {
          const isActive = div.id === activeDivisionId;
          const hasProgress = (div.progress ?? 0) > 0;
          return (
            <G key={div.id} onPress={() => onPressDivision?.(div)}>
              {/* Outer ring */}
              <Circle
                cx={div.cx}
                cy={div.cy}
                r={isActive ? 22 : 18}
                fill={isActive ? T.green : hasProgress ? "#d1fae5" : "#fff"}
                stroke={isActive ? "#004535" : T.green}
                strokeWidth={isActive ? 3 : 2}
              />
              {/* Progress ring */}
              {hasProgress && !isActive && (
                <Circle
                  cx={div.cx}
                  cy={div.cy}
                  r={18}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth={3}
                  strokeDasharray={`${(div.progress! / 100) * 113} 113`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${div.cx} ${div.cy})`}
                />
              )}
            </G>
          );
        })}
      </Svg>

      {/* Icon overlays (React Native, on top of SVG) */}
      <View style={[StyleSheet.absoluteFill, styles.iconLayer]} pointerEvents="none">
        {divisions.map((div) => {
          const isActive = div.id === activeDivisionId;
          const scaleX = 300; // viewBox width
          const scaleY = 380; // viewBox height
          return (
            <View
              key={div.id}
              style={[
                styles.iconWrap,
                {
                  left: `${(div.cx / scaleX) * 100}%` as any,
                  top: `${(div.cy / scaleY) * 100}%` as any,
                },
              ]}
            >
              <Ionicons
                name={div.icon}
                size={isActive ? 18 : 15}
                color={isActive ? "#fff" : div.iconColor}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", aspectRatio: 300 / 380 },
  svg: { width: "100%", height: "100%" },
  iconLayer: { position: "absolute" },
  iconWrap: {
    position: "absolute",
    transform: [{ translateX: -8 }, { translateY: -8 }],
    alignItems: "center",
    justifyContent: "center",
  },
});
