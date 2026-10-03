import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { getMood, MOODS, Mood } from "@/data/moods";
import { getQuotes, toggleLike, hideQuote } from "@/lib/quote-storage";
import QuoteCard from "@/components/QuoteCard";
import EmptyState from "@/components/EmptyState";
import AdBanner from "@/components/AdBanner";
import { go } from "@/lib/navigation";
import { trackInterstitialCheckpoint } from "@/lib/ads";
import { useLanguage } from "@/lib/language-context";
import { LANGUAGES } from "@/lib/languages";

export default function MoodDetailScreen() {
  const { mood: moodKey } = useLocalSearchParams<{ mood: string }>();
  const { theme } = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const selectedCountry = LANGUAGES.find((l) => l.code === language)?.country;

  // "all" is a synthetic mood that shows every online Spark.
  const isAll = String(moodKey) === "all";
  const mood = isAll ? null : getMood(moodKey);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes", language, selectedCountry],
    queryFn: () =>
      getQuotes({
        language: language || undefined,
        country: selectedCountry,
        limit: 300,
      }),
  });

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const hideMutation = useMutation({
    mutationFn: hideQuote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes"] }),
  });

  const moodQuotes = useMemo(() => {
    if (isAll) return quotes;
    if (!mood) return [];
    const norm = (s: string) => (s || "").trim().toLowerCase();
    return quotes.filter((q) =>
      mood.categories.some((cat) => norm(cat) === norm(q.category))
    );
  }, [quotes, mood, isAll]);

  const relatedMoods = useMemo(
    () =>
      isAll
        ? []
        : (mood?.related ?? [])
            .map((key) => MOODS.find((m) => m.key === key))
            .filter((m): m is Mood => Boolean(m)),
    [mood, isAll]
  );

  if (!mood && !isAll) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <EmptyState title="Mood not found" message="This mood may have moved." />
      </View>
    );
  }

  const heroMood = {
    emoji: isAll ? "✨" : mood?.emoji ?? "",
    title: isAll ? "All Quotes" : mood?.title ?? "",
    description: isAll
      ? "Every Spark in the library, ready for you."
      : mood?.description ?? "",
    colors: isAll ? (["#0F1A2E", "#2B3E5F"] as const) : mood?.colors ?? (["#0F1A2E", "#2B3E5F"] as const),
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <LinearGradient
        colors={heroMood.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.heroEmoji}>{heroMood.emoji}</Text>
        <Text style={styles.heroTitle}>{heroMood.title}</Text>
        <Text style={styles.heroDesc}>{heroMood.description}</Text>
        <Text style={styles.heroCount}>
          {moodQuotes.length} quote{moodQuotes.length !== 1 ? "s" : ""}
        </Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : (
        <FlatList
          data={moodQuotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <QuoteCard
              quote={item}
              index={index}
              onToggleLike={(id) => likeMutation.mutate(id)}
              onHide={(id) => hideMutation.mutate(id)}
            />
          )}
          ListHeaderComponent={
            relatedMoods.length ? (
              <View style={styles.relatedWrap}>
                <Text style={[styles.relatedLabel, { color: c.textTertiary }]}>
                  You might also feel…
                </Text>
                <View style={styles.relatedRow}>
                  {relatedMoods.map((m) => (
                    <Pressable
                      key={m.key}
                      onPress={() => {
                        trackInterstitialCheckpoint();
                        go(`/mood/${m.key}`);
                      }}
                      style={({ pressed }) => [
                        styles.relatedChip,
                        { borderColor: c.border, opacity: pressed ? 0.8 : 1 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Browse the mood ${m.title}`}
                    >
                      <Text style={[styles.relatedChipText, { color: c.textPrimary }]}>
                        {m.emoji} {m.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="rainy-outline"
              title="No quotes here yet"
              message="Quotes appear as soon as the category is added to the library."
            />
          }

          contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroEmoji: { fontSize: 34, marginBottom: 6 },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "DMSans_700Bold",
    marginBottom: 4,
  },
  heroDesc: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },
  heroCount: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "DMSans_600SemiBold",
    marginTop: 8,
  },
  relatedWrap: { paddingHorizontal: 20, paddingVertical: 14 },
  relatedLabel: {
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  relatedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  relatedChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  relatedChipText: { fontSize: 13, fontFamily: "DMSans_500Medium" },
});
