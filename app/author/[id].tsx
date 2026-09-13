import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { go } from "@/lib/navigation";
import { useTheme } from "@/hooks/useTheme";
import EmptyState from "@/components/EmptyState";
import FavoriteButton from "@/components/FavoriteButton";
import { Quote } from "@/data/quotes";
import { useFavorites } from "@/hooks/useFavorites";
import { getQuotesByAuthor } from "@/lib/quote-service";
import { trackInterstitialCheckpoint } from "@/lib/ads";
import AdBanner from "@/components/AdBanner";

export default function AuthorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const author = decodeURIComponent(String(id));
  const { theme } = useTheme();
  const c = theme.colors;
  const { isFavorite, toggleFavorite } = useFavorites();

  const query = useQuery({
    queryKey: ["author", author],
    queryFn: () => getQuotesByAuthor(author),
    enabled: !!author,
  });
  const items = query.data ?? [];

  // Natural ad checkpoint: opening an author counts toward the (frequency
  // capped) interstitial.
  useEffect(() => {
    trackInterstitialCheckpoint();
  }, [author]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>{author}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {items.length} quote{items.length === 1 ? "" : "s"}
        </Text>
      </View>

      {query.isLoading ? (
        <View style={styles.center}><ActivityIndicator color={c.accent} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(q) => String(q.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          renderItem={({ item }: { item: Quote }) => (
            <Pressable
              onPress={() => go(`/quote/${encodeURIComponent(item.id)}`)}
              style={({ pressed }) => [styles.card, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.text, { color: c.textPrimary }]} numberOfLines={3}>{item.text}</Text>
                <Text style={[styles.cat, { color: c.accent }]}>{item.category}</Text>
              </View>
              <FavoriteButton active={isFavorite(String(item.id))} onPress={(i) => toggleFavorite(i)} quoteId={String(item.id)} haptic />
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState title="No quotes found" message={`No quotes are attributed to ${author} yet.`} />}
        />
      )}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: "DMSans_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "DMSans_400Regular", marginTop: 4 },
  card: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  text: { fontSize: 15, fontFamily: "DMSans_500Medium", lineHeight: 22 },
  cat: { fontSize: 12, fontFamily: "DMSans_600SemiBold", marginTop: 6 },
});