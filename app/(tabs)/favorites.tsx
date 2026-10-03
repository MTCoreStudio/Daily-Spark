import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/theme/colors";
import { useTheme } from "@/hooks/useTheme";
import { getFavorites, toggleLike } from "@/lib/quote-storage";
import QuoteCard from "@/components/QuoteCard";
import AdBanner from "@/components/AdBanner";
import SearchBar from "@/components/SearchBar";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = makeStyles(c);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  const filters = useMemo(() => {
    const cats = Array.from(new Set(favorites.map((f) => f.category).filter(Boolean)));
    return ["All", ...cats.sort()];
  }, [favorites]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return favorites.filter((f) => {
      if (filter !== "All" && f.category !== filter) return false;
      if (!term) return true;
      return (
        (f.text || "").toLowerCase().includes(term) ||
        (f.author || "").toLowerCase().includes(term) ||
        (f.category || "").toLowerCase().includes(term)
      );
    });
  }, [favorites, query, filter]);

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    setRefreshing(false);
  }, [queryClient]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 16 }]}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} saved quote{favorites.length !== 1 ? "s" : ""}
        </Text>
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search saved sparks..."
          />
        </View>
        {filters.length > 1 ? (
          <FlatList
            data={filters}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setFilter(item)}
                style={[styles.chip, filter === item && styles.chipActive]}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${item}`}
                accessibilityState={{ selected: filter === item }}
              >
                <Text style={[styles.chipText, { color: filter === item ? "#FFFFFF" : c.textSecondary }]}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        ) : null}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <QuoteCard
            quote={item}
            index={index}
            onToggleLike={(id) => likeMutation.mutate(id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="heart-outline"
              size={48}
              color={c.textTertiary}
            />
            <Text style={styles.emptyTitle}>
              {favorites.length === 0 ? "No favorites yet" : "No matches"}
            </Text>
            <Text style={styles.emptyText}>
              {favorites.length === 0
                ? "Tap the heart on any quote to save it here."
                : "Try a different word or clear the filters."}
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "DMSans_700Bold",
    color: c.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: c.textSecondary,
  },
  searchWrap: { marginTop: 12 },
  chipRow: { gap: 8, paddingVertical: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  chipActive: { backgroundColor: "#0F1A2E", borderColor: "#0F1A2E" },
  chipText: { fontSize: 12, fontFamily: "DMSans_600SemiBold" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
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
});
