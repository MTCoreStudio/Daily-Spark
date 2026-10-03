import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/theme/colors";
import { useTheme } from "@/hooks/useTheme";
import { getQuotes, getCategories, toggleLike, hideQuote } from "@/lib/quote-storage";
import QuoteCard from "@/components/QuoteCard";
import QuoteShareModal from "@/components/QuoteShareModal";
import AdBanner from "@/components/AdBanner";
import StreakCalendar from "@/components/StreakCalendar";
import { trackInterstitialCheckpoint } from "@/lib/ads";
import { useNextSparkCountdown } from "@/hooks/useNextSparkCountdown";
import { useLanguage } from "@/lib/language-context";
import { LANGUAGES } from "@/lib/languages";
import { go } from "@/lib/navigation";
import { HOME_MOODS } from "@/data/moods";
import {
  getDayPart,
  getGreeting,
  isMorningNightSparkEnabled,
  recordSpark,
} from "@/lib/spark-storage";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = makeStyles(c);
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [shareQotd, setShareQotd] = useState(false);
  const [morningNightEnabled, setMorningNightEnabled] = useState(true);
  const [morningNightDismissed, setMorningNightDismissed] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  // The selected language maps 1:1 to its home country. We load native quotes
  // for that language/country — never machine-translated English quotes.
  const selectedCountry = LANGUAGES.find((l) => l.code === language)?.country;

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes", language, selectedCountry],
    queryFn: () =>
      getQuotes({
        language: language || undefined,
        country: selectedCountry,
        limit: 200,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  // Hides a quote from THIS user's feed only. It remains in the database for
  // every other user.
  const hideMutation = useMutation({
    mutationFn: hideQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });

  const filteredQuotes =
    selectedCategory === "All"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["quotes"] });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    setRefreshing(false);
  }, [queryClient]);

  const allCategories = useMemo(() => ["All", ...categories], [categories]);

  const quoteOfTheDay = useMemo(() => {
    if (quotes.length === 0) return null;

    // Seeded by the *local* date so the daily quote switches at local midnight —
    // exactly when the "New Spark" countdown reaches zero (and consistent with
    // `getDailyQuote()` used by the daily notification).
    const today = new Date();
    const seed = Number(
      `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`
    );

    return quotes[seed % quotes.length];
  }, [quotes]);

  const handleShareQuoteOfTheDay = useCallback(() => {
    if (!quoteOfTheDay) return;
    setShareQotd(true);
  }, [quoteOfTheDay]);

  const handleSurpriseMe = useCallback(() => {
    // Natural ad checkpoint preserved; the action now opens the branded
    // "Spark of the Moment" experience.
    trackInterstitialCheckpoint();
    go("/surprise");
  }, []);

  // Load the Morning/Night Spark preference once at mount.
  useEffect(() => {
    isMorningNightSparkEnabled()
      .then(setMorningNightEnabled)
      .catch(() => {});
  }, []);

  // Persist today's Spark in Spark History so the calendar screen has data.
  useEffect(() => {
    if (quoteOfTheDay) {
      void recordSpark(quoteOfTheDay);
    }
  }, [quoteOfTheDay]);

  // Live "New Spark in Xh Ym" label; auto-reveals today's quote at midnight.
  const sparkCountdown = useNextSparkCountdown();

  const greeting = getGreeting();
  const dayPart = getDayPart();

  // Deterministic, time-appropriate quote for the Morning/Night Spark card.
  const morningNightQuote = useMemo(() => {
    if (!morningNightEnabled || dayPart === "afternoon" || dayPart === "evening")
      return null;
    const isMorning = dayPart === "morning";
    const words = isMorning
      ? ["Morning", "Good Morning Love", "Motivation", "Success", "Focus"]
      : ["Night Thoughts", "Late Night Thoughts", "Good Night Love", "Peace", "Calm", "Healing"];
    const pool = quotes.filter((q) =>
      words.some((w) => (q.category || "").toLowerCase() === w.toLowerCase())
    );
    if (pool.length === 0) return null;
    const now = new Date();
    const seed = Number(`${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`);
    return pool[seed % pool.length];
  }, [quotes, dayPart, morningNightEnabled]);

  const openStudioForRandom = useCallback(() => {
    const pool = filteredQuotes.length ? filteredQuotes : quotes;
    if (!pool.length) return;
    trackInterstitialCheckpoint();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    go(`/studio/${encodeURIComponent(String(pick.id))}`);
  }, [filteredQuotes, quotes]);

  const nextSpark = useCallback(() => {
    const pool = allCategories.filter(Boolean);
    if (!pool.length) return;
    const idx = Math.max(0, pool.indexOf(selectedCategory));
    const next = pool[(idx + 1) % pool.length];
    setSelectedCategory(next);
    trackInterstitialCheckpoint();
  }, [allCategories, selectedCategory]);

  const renderHeader = () => (
    <View>
      <LinearGradient
        colors={["#0F1A2E", "#1E2D47", "transparent"]}
        style={[styles.heroGradient, { paddingTop: insets.top + webTopInset + 16 }]}
      >
        <Text style={styles.heroGreeting}>{greeting}</Text>
        <Text style={styles.heroTitle}>Daily Spark</Text>
        <Text style={styles.heroSubtitle}>
          One thought can change your day
        </Text>
      </LinearGradient>

      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [styles.quickAction, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
          onPress={handleSurpriseMe}
          accessibilityRole="button"
          accessibilityLabel="Surprise me with a random spark"
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FBE9D6" }]}>
            <Ionicons name="sparkles" size={20} color="#E8590C" />
          </View>
          <Text style={[styles.quickLabel, { color: c.textPrimary }]}>Surprise Me</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickAction, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => go("/favorites")}
          accessibilityRole="button"
          accessibilityLabel="Open favorites"
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FBE6EB" }]}>
            <Ionicons name="heart" size={20} color="#E0536F" />
          </View>
          <Text style={[styles.quickLabel, { color: c.textPrimary }]}>Favorites</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickAction, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => go("/explore")}
          accessibilityRole="button"
          accessibilityLabel="Open explore"
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E1EEFB" }]}>
            <Ionicons name="compass" size={20} color="#1D7FD4" />
          </View>
          <Text style={[styles.quickLabel, { color: c.textPrimary }]}>Explore</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickAction, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
          onPress={openStudioForRandom}
          accessibilityRole="button"
          accessibilityLabel="Create a spark image"
        >
          <View style={[styles.quickIcon, { backgroundColor: "#EDE7FC" }]}>
            <Ionicons name="color-wand" size={20} color="#7C3AED" />
          </View>
          <Text style={[styles.quickLabel, { color: c.textPrimary }]}>Create Spark</Text>
        </Pressable>
      </View>

      {morningNightQuote && !morningNightDismissed ? (
        <Pressable
          onPress={() => go(`/quote/${encodeURIComponent(String(morningNightQuote.id))}`)}
          style={[styles.morningCard, { borderColor: c.border }]}
          accessibilityRole="button"
          accessibilityLabel={dayPart === "morning" ? "Open your morning spark" : "Open your night spark"}
        >
          <LinearGradient
            colors={dayPart === "morning" ? ["#B45309", "#F59E0B", "#FCD34D"] : ["#1E1B4B", "#312E81", "#4338CA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.morningCardGradient}
          >
            <View style={styles.morningCardHeader}>
              <Text style={styles.morningCardTitle}>
                {dayPart === "morning" ? "☀️ Morning Spark" : "🌙 Night Spark"}
              </Text>
              <Pressable
                onPress={() => setMorningNightDismissed(true)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Dismiss this spark"
              >
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.9)" />
              </Pressable>
            </View>
            <Text style={styles.morningCardQuote} numberOfLines={3}>
              "{morningNightQuote.text}"
            </Text>
            <Text style={styles.morningCardAuthor}>— {morningNightQuote.author}</Text>
          </LinearGradient>
        </Pressable>
      ) : null}

      {quoteOfTheDay && (
        <View style={styles.dailyCard}>
          <View style={styles.dailyHeader}>
            <Text style={styles.dailyLabel}>Quote of the Day</Text>
            <Pressable style={styles.dailyShare} onPress={handleShareQuoteOfTheDay}>
              <Ionicons name="share-social-outline" size={16} color={c.textSecondary} />
              <Text style={styles.dailyShareText}>Share</Text>
            </Pressable>
          </View>
          <Text style={styles.dailyText} numberOfLines={3}>
            &quot;{quoteOfTheDay.text}&quot;
          </Text>
          <Text style={styles.dailyAuthor}>- {quoteOfTheDay.author}</Text>
          <View style={styles.dailyCountdown}>
            <Ionicons name="hourglass-outline" size={14} color={c.accent} />
            <Text style={styles.dailyCountdownText}>
              New Spark in {sparkCountdown}
            </Text>
          </View>
        </View>
      )}

      {quoteOfTheDay && (
        <Pressable style={styles.nextSpark} onPress={nextSpark}>
          <Text style={styles.nextSparkText}>NEXT SPARK</Text>
        </Pressable>
      )}

      <StreakCalendar />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <Text style={styles.sectionCount}>Find your spark</Text>
      </View>
      <FlatList
        data={HOME_MOODS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(m) => m.key}
        contentContainerStyle={styles.moodList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => go(`/mood/${item.key}`)}
            accessibilityRole="button"
            accessibilityLabel={`Browse quotes for the mood ${item.title}`}
            style={({ pressed }) => [styles.moodChip, { borderColor: c.border, opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={item.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.moodChipGradient}
            >
              <Text style={styles.moodChipEmoji}>{item.emoji}</Text>
              <Text style={styles.moodChipText}>{item.title}</Text>
            </LinearGradient>
          </Pressable>
        )}
      />

      <FlatList
        data={allCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setSelectedCategory(item);
              trackInterstitialCheckpoint();
            }}
            style={[
              styles.categoryChip,
              selectedCategory === item && styles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === item && styles.categoryChipTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "All" ? "All Quotes" : selectedCategory}
        </Text>
        <Text style={styles.sectionCount}>{filteredQuotes.length} quotes</Text>
      </View>

      </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <QuoteCard
            quote={item}
            index={index}
            onToggleLike={(id) => likeMutation.mutate(id)}
            onHide={(id) => hideMutation.mutate(id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={c.textTertiary} />
            <Text style={styles.emptyTitle}>No quotes found</Text>
            <Text style={styles.emptyText}>
              Try selecting a different category
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      <AdBanner />
      <QuoteShareModal
        visible={shareQotd}
        quote={quoteOfTheDay}
        onClose={() => setShareQotd(false)}
      />
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: "DMSans_700Bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  heroGreeting: {
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 8,
  },
  nextSpark: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 4,
    marginBottom: 14,
    backgroundColor: "#0F1A2E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  nextSparkText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.6,
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  dailyCard: {
    marginHorizontal: 20,
    marginTop: 2,
    borderRadius: 14,
    padding: 14,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  dailyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dailyLabel: {
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
    color: c.accent,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dailyShare: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dailyShareText: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: c.textSecondary,
  },
  dailyText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "DMSans_400Regular",
    color: c.textPrimary,
  },
  dailyAuthor: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: c.textSecondary,
  },
  dailyCountdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  dailyCountdownText: {
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
    color: c.accent,
    letterSpacing: 0.3,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: c.surfaceSecondary,
    borderWidth: 1,
    borderColor: c.border,
  },
  categoryChipActive: {
    backgroundColor: "#0F1A2E",
    borderColor: "#0F1A2E",
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: c.textSecondary,
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "DMSans_700Bold",
    color: c.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: c.textTertiary,
  },
  surpriseButton: {
    marginHorizontal: 20,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.surface,
    paddingVertical: 10,
  },
  surpriseButtonText: {
    fontSize: 13,
    fontFamily: "DMSans_600SemiBold",
    color: c.accent,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "DMSans_600SemiBold",
    color: c.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: c.textSecondary,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 2,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
  },
  morningCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
  },
  morningCardGradient: {
    padding: 18,
  },
  morningCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  morningCardTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  morningCardQuote: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 26,
    fontFamily: "DMSans_500Medium",
    marginBottom: 6,
  },
  morningCardAuthor: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
  },
  moodList: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 8,
  },
  moodChip: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  moodChipGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  moodChipEmoji: {
    fontSize: 16,
  },
  moodChipText: {
    fontSize: 13,
    fontFamily: "DMSans_600SemiBold",
    color: "#FFFFFF",
  },
});
