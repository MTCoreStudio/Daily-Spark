import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { MOODS, Mood } from "@/data/moods";
import { go } from "@/lib/navigation";
import * as Haptics from "expo-haptics";

const CARD_ASPECT = 1.55;

export default function MoodIndexScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const { theme } = useTheme();
  const c = theme.colors;

  const renderMood = ({ item, index }: { item: Mood; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 60, 500)).springify().damping(16)}
      style={styles.cardWrap}
    >
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          go(`/mood/${item.key}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} — ${item.description}`}
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      >
        <LinearGradient
          colors={item.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.cardArrow}>
            <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.9)" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 16 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: c.textPrimary }]}>
              How are you feeling?
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              Find a spark for the way you feel right now.
            </Text>
          </View>
          <Pressable
            onPress={() => go("/feed")}
            hitSlop={10}
            style={({ pressed }) => [
              styles.feedButton,
              { borderColor: c.border, opacity: pressed ? 0.8 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open the spark feed"
          >
            <Ionicons name="albums-outline" size={20} color={c.accent} />
            <Text style={[styles.feedButtonText, { color: c.accent }]}>Feed</Text>
          </Pressable>
        </View>
        <Text style={[styles.note, { color: c.textTertiary }]}>
          Moods are for discovering quotes, not a health diagnosis.
        </Text>
      </View>

      <FlatList
        data={MOODS}
        keyExtractor={(m) => m.key}
        renderItem={renderMood}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 26, fontFamily: "DMSans_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "DMSans_400Regular" },
  note: { fontSize: 12, fontFamily: "DMSans_400Regular", marginTop: 10 },
  feedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  feedButtonText: { fontSize: 13, fontFamily: "DMSans_600SemiBold" },
  row: { paddingHorizontal: 16, gap: 12 },
  cardWrap: { flex: 1, marginBottom: 12 },
  card: {
    aspectRatio: CARD_ASPECT,
    borderRadius: 20,
    padding: 16,
    justifyContent: "flex-end",
  },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "DMSans_700Bold",
    marginBottom: 3,
  },
  cardDesc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    lineHeight: 17,
  },
  cardArrow: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});