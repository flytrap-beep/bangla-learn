import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { T, FONT } from "@/lib/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const TABS: {
  name: string;
  title: string;
  icon: IoniconsName;
  iconActive: IoniconsName;
}[] = [
  { name: "index",       title: "Map",      icon: "map-outline",        iconActive: "map"          },
  { name: "dialects",    title: "Dialects", icon: "globe-outline",      iconActive: "globe"        },
  { name: "leaderboard", title: "Ranks",    icon: "trophy-outline",     iconActive: "trophy"       },
  { name: "profile",     title: "Dossier",  icon: "person-outline",     iconActive: "person"       },
  { name: "bazaar",      title: "Bazaar",   icon: "storefront-outline", iconActive: "storefront"   },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   T.red,
        tabBarInactiveTintColor: T.green + "55",
        tabBarStyle: {
          borderTopWidth:    3,
          borderTopColor:    T.green,
          backgroundColor:   T.bg,
          paddingBottom:     8,
          paddingTop:        6,
          height:            68,
        },
        tabBarLabelStyle: {
          fontSize:      9,
          fontFamily:    FONT.bold,
          textTransform: "uppercase",
          letterSpacing: 1,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
