import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, useWindowDimensions, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { getQuotes, toggleLike } from "@/lib/quote-storage";
import QuoteShareModal from "@/components/QuoteShareModal";
import { useFavorites } from "@/hooks/useFavorites";
import { go } from "@/lib/navigation";
import { copyText } from "@/lib/clipboard";
import { useLanguage } from "@/lib/language-context";
import { LANGUAGES } from "@/lib/languages";

export default function SparkFeedScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { theme } = useTheme();
  const c = theme.colors;
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const selectedCountry = LANGUAGES.find((l) => l.code === language)?.country;
  const { isFavorite, toggleFavorite } = useFavorites();

  const [shareFor, setShareFor] = useState<{ id: string; text: string; author: string; category: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: quotes = [] } = useQuery({
    queryKey: ["feed-quotes", language, selectedCountry],
    queryFn: () =>
      getQuotes({ language: language || undefined, country: selectedCountry, limit: 400 }),
  });

  const items = useMemo(() => quotes.filter((q) => q.text && q.author), [quotes]);

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const pageHeight = height; // each card fills one viewport

  const copyQuote = async (id: string, text: string, author: string) => {
    await copyText(`"${text}" — ${author}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1400);
  };

  return (
<View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.topBarTitle, { color: c.textPrimary }]}>Spark Feed</Text>
        <Text style={[styles.topBarHint, { color: c.textSecondary }]}>Swipe to discover</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Animated.View entering={FadeIn.duration(280)} style={{ height: pageHeight - 70 }}>
            <LinearGradient
              colors={["#0F1A2E", "#1E2D47", "#141A24"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.page, { paddingTop: 20 }]}
            >
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.quote} numberOfLines={9}>
                “{item.text}”
              </Text>
              <Text style={styles.author}>— {item.author}</Text>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => likeMutation.mutate(String(item.id))}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={isFavorite(String(item.id)) ? "Remove from favorites" : "Add to favorites"}
                  style={styles.action}
                >
                  <Ionicons
                    name={isFavorite(String(item.id)) ? "heart" : "heart-outline"}
                    size={26}
                    color={isFavorite(String(item.id)) ? "#F06B6B" : "#FFFFFF"}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setShareFor({ id: String(item.id), text: item.text, author: item.author, category: item.category })}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Share this quote"
                  style={styles.action}
                >
                  <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  onPress={() => copyQuote(String(item.id), item.text, item.author)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Copy this quote"
                  style={styles.action}
                >
                  <Ionicons
                    name={copiedId === String(item.id) ? "checkmark" : "copy-outline"}
                    size={24}
                    color={copiedId === String(item.id) ? "#45C477" : "#FFFFFF"}
                  />
                </Pressable>
                <Pressable
                  onPress={() => go(`/studio/${encodeURIComponent(String(item.id))}`)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Create an image from this quote"
                  style={styles.action}
                >
                  <Ionicons name="color-wand-outline" size={24} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  onPress={() => go(`/quote/${encodeURIComponent(String(item.id))}`)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Open this quote"
                  style={styles.action}
                >
                  <Ionicons name="open-outline" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
        pagingEnabled={false}
        snapToInterval={pageHeight - 70}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      />

      <QuoteShareModal visible={!!shareFor} quote={shareFor} onClose={() => setShareFor(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingBottom: 6 },
  topBarTitle: { fontSize: 24, fontFamily: "DMSans_700Bold" },
  topBarHint: { fontSize: 13, fontFamily: "DMSans_400Regular", marginTop: 2 },
  page: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 26,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: "center",
  },
  category: {
    alignSelf: "flex-start",
    color: "#F3D294",
    fontSize: 11,
    fontFamily: "DMSans_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    backgroundColor: "rgba(212,165,74,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 18,
  },
  quote: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 40,
    fontFamily: "DMSans_500Medium",
    marginBottom: 16,
  },
  author: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
  },
  actions: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    paddingTop: 18,
  },
  action: { paddingHorizontal: 10 },
});