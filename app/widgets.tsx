import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import {
  WidgetConfig,
  WidgetSize,
  WidgetTextSize,
  WidgetAlignment,
  WidgetMode,
  getWidgetConfig,
  setWidgetConfig,
  DEFAULT_WIDGET_CONFIG,
} from "@/lib/spark-storage";

const WIDGET_BACKGROUNDS = {
  minimal: { colors: ["#F6F5F2", "#EDEBE6"], text: "#1A1C20", soft: "#5F6572", accent: "#8A6B2F" },
  dark: { colors: ["#0C1017", "#1D2532"], text: "#F2F4F8", soft: "#AAB3C2", accent: "#D4A54A" },
  light: { colors: ["#FFFFFF", "#F0EEE9"], text: "#1A1C20", soft: "#5F6572", accent: "#B8860B" },
  gradient: { colors: ["#0F1A2E", "#2B3E5F"], text: "#FFFFFF", soft: "rgba(255,255,255,0.75)", accent: "#D4A54A" },
  aurora: { colors: ["#0F1022", "#312E81"], text: "#FFFFFF", soft: "rgba(255,255,255,0.8)", accent: "#C7D2FE" },
  sunset: { colors: ["#B45309", "#F59E0B"], text: "#FFFFFF", soft: "rgba(255,255,255,0.9)", accent: "#FFE2C0" },
  ocean: { colors: ["#164E63", "#0E7490"], text: "#FFFFFF", soft: "rgba(255,255,255,0.82)", accent: "#CFFAFE" },
  forest: { colors: ["#14532D", "#2F9E63"], text: "#FFFFFF", soft: "rgba(255,255,255,0.85)", accent: "#DFF5E7" },
  elegant: { colors: ["#2B2B24", "#5C5C50"], text: "#FFFDF5", soft: "rgba(255,253,245,0.72)", accent: "#E4C482" },
} as const;

export type WidgetBackground = keyof typeof WIDGET_BACKGROUNDS;

const SIZES: { key: WidgetSize; label: string }[] = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];
const TEXT_SIZES: { key: WidgetTextSize; label: string }[] = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];
const ALIGNMENTS: { key: WidgetAlignment; label: string }[] = [
  { key: "left", label: "Left" },
  { key: "center", label: "Center" },
  { key: "right", label: "Right" },
];
const MODES: { key: WidgetMode; label: string }[] = [
  { key: "daily", label: "Today's Spark" },
  { key: "random", label: "Random Spark" },
  { key: "favorite", label: "Favorite Spark" },
  { key: "category", label: "Selected Category" },
  { key: "quote", label: "Selected Quote" },
];
const REFRESHES: { key: 1 | 3 | 6 | 12 | 24; label: string }[] = [
  { key: 1, label: "1 hour" },
  { key: 3, label: "3 hours" },
  { key: 6, label: "6 hours" },
  { key: 12, label: "12 hours" },
  { key: 24, label: "Daily" },
];

export default function WidgetStudioScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const { quoteId } = useLocalSearchParams<{ quoteId?: string }>();
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [loaded, setLoaded] = useState(false);

  const update = (patch: Partial<WidgetConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    let cancelled = false;
    getWidgetConfig()
      .then((saved) => {
        if (cancelled) return;
        let next: WidgetConfig = saved;
        // Arrived via "Add to Widget" on a quote → pin this quote as the source.
        if (quoteId) {
          next = { ...saved, mode: "quote", quoteId: String(quoteId) };
        }
        setConfig(next);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  const save = async () => {
    await setWidgetConfig(config);
    Alert.alert(
      "Widget Studio saved",
      "Your design is saved. To place it on your Home screen you need a development build with the widget module enabled (Settings → Widgets → Info)."
    );
  };

  const bg = WIDGET_BACKGROUNDS[config.background];
  const isSmall = config.size === "small";
  const previewHeight = config.size === "small" ? 96 : config.size === "medium" ? 132 : 196;
  const previewWidth = 300;
  const fontScale = config.textSize === "small" ? 11 : config.textSize === "medium" ? 13 : 16;

  function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.chip, { borderColor: c.border }, active && { backgroundColor: c.accentSoft, borderColor: c.accent }]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
      >
        <Text style={[styles.chipText, { color: c.textPrimary }]}>{label}</Text>
      </Pressable>
    );
  }

  return (
<View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: c.textPrimary }]}>Widget Studio</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Design your Daily Spark home-screen widget.
          </Text>
        </View>

        <View style={styles.previewWrap}>
          <LinearGradient colors={bg.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.preview, { width: previewWidth, height: previewHeight }]}>
            {config.showCategory ? (
              <Text style={[styles.prevCategory, { color: bg.accent }]}>Motivation</Text>
            ) : null}
            <Text
              numberOfLines={isSmall ? 2 : 3}
              style={[
                styles.prevQuote,
                {
                  color: bg.text,
                  fontSize: fontScale * (isSmall ? 0.85 : 1),
                  lineHeight: fontScale * 1.25,
                  textAlign: config.alignment,
                },
              ]}
            >
              "Small steps every day lead to big changes."
            </Text>
            {config.showAuthor ? (
              <Text style={[styles.prevAuthor, { color: bg.soft, fontSize: fontScale * 0.8, textAlign: config.alignment }]}>
                — Unknown
              </Text>
            ) : null}
            {config.showCountdown && !isSmall ? (
              <Text style={[styles.prevCountdown, { color: bg.accent }]}>New Spark in 6h 12m</Text>
            ) : null}
            {config.showBranding ? (
              <Text style={[styles.prevBrand, { color: bg.soft, opacity: 0.9 }]}>✨ Daily Spark</Text>
            ) : null}
          </LinearGradient>
          <Text style={[styles.previewHint, { color: c.textTertiary }]}>
            {config.size === "small" ? "Small" : config.size === "medium" ? "Medium" : "Large"} preview
          </Text>
        </View>

        <GroupLabel label="Size" color={c.textTertiary} />
        <View style={styles.row}>
          {SIZES.map((s) => (
            <Chip key={s.key} label={s.label} active={config.size === s.key} onPress={() => update({ size: s.key })} />
          ))}
        </View>

        <GroupLabel label="Background" color={c.textTertiary} />
        <View style={styles.wrapRow}>
          {(Object.keys(WIDGET_BACKGROUNDS) as WidgetBackground[]).map((b) => (
            <Pressable
              key={b}
              onPress={() => update({ background: b })}
              style={[styles.bgSwatch, { borderColor: config.background === b ? c.accent : c.border }]}
              accessibilityRole="button"
              accessibilityLabel={`Background ${b}`}
              accessibilityState={{ selected: config.background === b }}
            >
              <LinearGradient colors={WIDGET_BACKGROUNDS[b].colors} style={styles.bgSwatchInner} />
            </Pressable>
          ))}
        </View>

        <GroupLabel label="Text size" color={c.textTertiary} />
        <View style={styles.row}>
          {TEXT_SIZES.map((s) => (
            <Chip key={s.key} label={s.label} active={config.textSize === s.key} onPress={() => update({ textSize: s.key })} />
          ))}
        </View>

        <GroupLabel label="Alignment" color={c.textTertiary} />
        <View style={styles.row}>
          {ALIGNMENTS.map((a) => (
            <Chip key={a.key} label={a.label} active={config.alignment === a.key} onPress={() => update({ alignment: a.key })} />
          ))}
        </View>
<GroupLabel label="Content" color={c.textTertiary} />
        <View style={styles.wrapRow}>
          <Chip label={config.showCategory ? "Category ON" : "Category OFF"} active={config.showCategory} onPress={() => update({ showCategory: !config.showCategory })} />
          <Chip label={config.showAuthor ? "Author ON" : "Author OFF"} active={config.showAuthor} onPress={() => update({ showAuthor: !config.showAuthor })} />
          <Chip label={config.showBranding ? "Branding ON" : "Branding OFF"} active={config.showBranding} onPress={() => update({ showBranding: !config.showBranding })} />
          <Chip label={config.showCountdown ? "Countdown ON" : "Countdown OFF"} active={config.showCountdown} onPress={() => update({ showCountdown: !config.showCountdown })} />
        </View>

        <GroupLabel label="Quote source" color={c.textTertiary} />
        <View style={styles.wrapRow}>
          {MODES.map((m) => (
            <Chip key={m.key} label={m.label} active={config.mode === m.key} onPress={() => update({ mode: m.key })} />
          ))}
        </View>

        <GroupLabel label="Refresh" color={c.textTertiary} />
        <View style={styles.wrapRow}>
          {REFRESHES.map((r) => (
            <Chip key={r.key} label={r.label} active={config.refreshHours === r.key} onPress={() => update({ refreshHours: r.key })} />
          ))}
        </View>
        <Text style={[styles.note, { color: c.textTertiary }]}>
          Android controls widget refresh timing — your interval is a best-effort hint; the system may relax it.
        </Text>

        <Pressable
          onPress={save}
          disabled={!loaded}
          style={({ pressed }) => [styles.saveBtn, { opacity: pressed || !loaded ? 0.85 : 1, backgroundColor: c.accent }]}
          accessibilityRole="button"
          accessibilityLabel="Save widget design"
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Widget Design</Text>
        </Pressable>

        <View style={[styles.infoRow, { borderColor: c.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={c.accent} />
          <Text style={[styles.infoText, { color: c.textSecondary }]}>
            Widgets need a development build with the Android widget module enabled. The design above is saved locally and never affects ads.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function GroupLabel({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.groupLabel, { color }]}>{label}</Text>;
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontFamily: "DMSans_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "DMSans_400Regular" },
  previewWrap: { alignItems: "center", paddingVertical: 16 },
  preview: { borderRadius: 18, padding: 12, overflow: "hidden", justifyContent: "center" },
  prevCategory: { fontSize: 9, fontFamily: "DMSans_700Bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  prevQuote: { fontFamily: "DMSans_500Medium", marginBottom: 4 },
  prevAuthor: { fontFamily: "DMSans_500Medium", marginBottom: 4 },
  prevCountdown: { fontSize: 9, fontFamily: "DMSans_600SemiBold", marginTop: 4 },
  prevBrand: { fontSize: 9, fontFamily: "DMSans_600SemiBold", marginTop: 4 },
  previewHint: { marginTop: 8, fontSize: 12, fontFamily: "DMSans_400Regular" },
  groupLabel: {
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontFamily: "DMSans_500Medium" },
  bgSwatch: { width: 42, height: 42, borderRadius: 10, borderWidth: 2, overflow: "hidden" },
  bgSwatchInner: { flex: 1 },
  note: { paddingHorizontal: 20, marginTop: 10, fontSize: 12, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 14,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "DMSans_700Bold" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "DMSans_400Regular", lineHeight: 19 },
});