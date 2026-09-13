import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { go } from "@/lib/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import SearchBar from "@/components/SearchBar";
import CategoryChip from "@/components/CategoryChip";
import EmptyState from "@/components/EmptyState";
import FavoriteButton from "@/components/FavoriteButton";
import { Quote } from "@/data/quotes";
import { useFavorites } from "@/hooks/useFavorites";
import { getCategories, searchQuotes, getQuotes } from "@/lib/quote-service";
import { useLanguage } from "@/lib/language-context";
import { LANGUAGES } from "@/lib/languages";
import { trackSearch, trackCategoryOpened } from "@/services/analytics";
import { trackInterstitialCheckpoint } from "@/lib/ads";
import AdBanner from "@/components/AdBanner";

export default function ExploreScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 280);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language } = useLanguage();
  // Respect the selected language/country: native quotes only, never a
  // machine-translated English quote.
  const selectedCountry = LANGUAGES.find((l) => l.code === language)?.country;

  // Natural ad checkpoint: opening Explore counts toward the (frequency capped)
  // interstitial.
  useEffect(() => {
    trackInterstitialCheckpoint();
  }, []);

  const catsQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const searchQuery = useQuery({
    queryKey: ["search", debounced, language, selectedCountry],
    queryFn: () => searchQuotes(debounced, language, selectedCountry),
    enabled: debounced.trim().length > 1,
  });
  const allQuery = useQuery({
    queryKey: ["explore-quotes", language, selectedCountry],
    queryFn: () => getQuotes(language, selectedCountry),
    enabled: debounced.trim().length <= 1,
  });

  const searching = debounced.trim().length > 1;
  const results = searching ? searchQuery.data ?? [] : allQuery.data ?? [];

  const onSearchChange = (t: string) => {
    setQuery(t);
    if (t.trim().length > 1) trackSearch(t);
  };

  const openCategory = (name: string) => {
    trackCategoryOpened(name);
    go(`/category/${encodeURIComponent(name)}`);
  };

  const renderRow = ({ item }: { item: Quote }) => (
    <Pressable
      onPress={() => go(`/quote/${encodeURIComponent(item.id)}`)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={[styles.rowText, { color: c.textPrimary }]} numberOfLines={2}>
          {item.text}
        </Text>
        <View style={styles.rowMeta}>
          <Text style={[styles.rowAuthor, { color: c.textSecondary }]}>— {item.author}</Text>
          <Text style={[styles.rowCat, { color: c.accent }]}>{item.category}</Text>
        </View>
      </View>
      <FavoriteButton
        active={isFavorite(item.id)}
        onPress={(id) => toggleFavorite(id)}
        quoteId={item.id}
        haptic
      />
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>Explore</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Find the spark you need
        </Text>
        <SearchBar value={query} onChangeText={onSearchChange} />
      </View>

      {!searching ? (
        <>
          <View style={styles.topicsHeader}>
            <Text style={[styles.section, { color: c.textTertiary }]}>Browse topics</Text>
          </View>
          <View style={styles.chipWrap}>
            {catsQuery.data?.map((cat) => (
              <CategoryChip key={cat} label={cat} onPress={() => openCategory(cat)} />
            ))}
          </View>
        </>
      ) : null}

      {(searchQuery.isLoading || allQuery.isLoading) && searching ? (
        <View style={styles.center}>
          <ActivityIndicator color={c.accent} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRow}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searching ? (
              <EmptyState
                icon="search-outline"
                title="No results found"
                message="Try a different word, author or topic."
              />
            ) : null
          }
        />
      )}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  title: { fontSize: 28, fontFamily: "DMSans_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "DMSans_400Regular", marginBottom: 8 },
  chips: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  topicsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  section: { fontSize: 12, fontFamily: "DMSans_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowText: { fontSize: 15, fontFamily: "DMSans_500Medium", lineHeight: 22 },
  rowMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  rowAuthor: { fontSize: 13, fontFamily: "DMSans_400Regular" },
  rowCat: { fontSize: 12, fontFamily: "DMSans_600SemiBold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});