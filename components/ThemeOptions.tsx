import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { ACCENT_THEMES, AccentTheme } from "@/theme/colors";

const SCHEMES: { key: "light" | "dark" | "system"; label: string; icon: "sunny-outline" | "moon-outline" | "phone-portrait-outline" }[] = [
  { key: "light", label: "Light", icon: "sunny-outline" },
  { key: "dark", label: "Dark", icon: "moon-outline" },
  { key: "system", label: "System", icon: "phone-portrait-outline" },
];

const ACCENT_DOT: Record<AccentTheme, string> = {
  default: "#8A6B2F",
  gold: "#B8860B",
  violet: "#7C3AED",
  teal: "#0E9F8B",
  rose: "#E0536F",
  ocean: "#1D7FD4",
  midnight: "#7C8FE0",
  calm: "#4F8F7B",
  romantic: "#C2476B",
};

export default function ThemeOptions() {
  const { theme, scheme, setScheme, accent, setAccent } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.block, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[styles.heading, { color: c.textPrimary }]}>Appearance</Text>

      <View style={styles.row}>
        {SCHEMES.map((s) => {
          const active = scheme === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => setScheme(s.key)}
              accessibilityRole="button"
              accessibilityLabel={`${s.label} mode`}
              style={[styles.choice, { borderColor: active ? c.accent : c.border, backgroundColor: active ? c.accentSoft : c.surface }]}
            >
              <Text style={{ color: c.textPrimary, fontFamily: "DMSans_500Medium", fontSize: 14 }}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.subheading, { color: c.textSecondary }]}>Accent color</Text>
      <View style={styles.row}>
        {ACCENT_THEMES.map((a) => {
          const active = accent === a.key;
          return (
            <Pressable
              key={a.key}
              onPress={() => setAccent(a.key as AccentTheme)}
              accessibilityRole="button"
              accessibilityLabel={`${a.label} accent`}
              style={[styles.swatch, { borderColor: active ? c.textPrimary : c.border }]}
            >
              <View style={[styles.dot, { backgroundColor: ACCENT_DOT[a.key] }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginHorizontal: 20, marginTop: 24, borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  heading: { fontSize: 16, fontFamily: "DMSans_700Bold" },
  subheading: { fontSize: 13, fontFamily: "DMSans_500Medium" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  choice: { flexGrow: 1, minWidth: 90, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  dot: { width: 22, height: 22, borderRadius: 11 },
});