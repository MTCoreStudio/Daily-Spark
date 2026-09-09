import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { go } from "@/lib/navigation";
import { copyText } from "@/lib/clipboard";
import { useTheme } from "@/hooks/useTheme";
import { useFavorites } from "@/hooks/useFavorites";
import FavoriteButton from "@/components/FavoriteButton";
import QuoteShareModal from "@/components/QuoteShareModal";
import EmptyState from "@/components/EmptyState";
import { getQuoteById, getQuotesByCategory } from "@/lib/quote-service";
import { trackQuoteViewed } from "@/services/analytics";
import { trackInterstitialCheckpoint } from "@/lib/ads";
import AdBanner from "@/components/AdBanner";

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const c = theme.colors;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const quoteQuery = useQuery({
    queryKey: ["quote", id],
    queryFn: () => getQuoteById(String(id)),
    enabled: !!id,
  });
  const quote = quoteQuery.data;
  const relatedQuery = useQuery({
    queryKey: ["related", quote?.category],
    queryFn: () => getQuotesByCategory(quote?.category ?? ""),
    enabled: !!quote?.category,
  });

  useEffect(() => {
    if (!quote) return;
    trackQuoteViewed(String(quote.id));
    // Natural ad checkpoint: opening a quote counts toward the (frequency
    // capped) interstitial. Slight delay so the quote is readable first.
    const t = setTimeout(() => trackInterstitialCheckpoint(), 1200);
    return () => clearTimeout(t);
  }, [quote]);

  const copyQuote = async () => {
    if (!quote) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await copyText(`"${quote.text}" — ${quote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (quoteQuery.isLoading) {
    return <View style={[styles.center, { backgroundColor: c.background }]}><ActivityIndicator color={c.accent} /></View>;
  }
  if (!quote) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <EmptyState title="Quote not found" message="This quote may have been removed." />
      </View>
    );
  }

  const related = (relatedQuery.data ?? []).filter((q) => String(q.id) !== String(quote.id));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="sparkles" size={22} color={c.accent} style={styles.spark} />
          <Pressable onPress={() => go(`/category/${encodeURIComponent(quote.category)}`)}>
            <Text style={[styles.category, { color: c.accent }]}>{quote.category}</Text>
          </Pressable>
          <Text style={[styles.quote, { color: c.textPrimary }]}>“{quote.text}”</Text>
          <Pressable onPress={() => go(`/author/${encodeURIComponent(quote.author)}`)}>
            <Text style={[styles.author, { color: c.textSecondary }]}>— {quote.author}</Text>
          </Pressable>
          {quote.country || quote.original_language ? (
            <Text style={[styles.origin, { color: c.textTertiary }]}>
              {quote.country}
              {quote.original_language ? ` · ${quote.original_language}` : ""}
              {quote.is_original === false ? " · translated" : " · original"}
            </Text>
          ) : null}
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <View style={styles.actions}>
            <FavoriteButton active={isFavorite(String(quote.id))} onPress={(i) => toggleFavorite(i)} quoteId={String(quote.id)} size={26} haptic />
            <Pressable onPress={() => setShareVisible(true)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Share">
              <Ionicons name="share-social-outline" size={24} color={c.textTertiary} />
            </Pressable>
            <Pressable onPress={copyQuote} hitSlop={12} accessibilityRole="button" accessibilityLabel="Copy">
              <Ionicons name={copied ? "checkmark" : "copy-outline"} size={24} color={copied ? c.success : c.textTertiary} />
            </Pressable>
          </View>
          {copied ? <Text style={[styles.copied, { color: c.success }]}>Copied!</Text> : null}
        </View>

        {related.length > 0 ? (
          <>
            <Text style={[styles.related, { color: c.textTertiary }]}>More in {quote.category}</Text>
            {related.slice(0, 8).map((r) => (
              <Pressable key={String(r.id)} onPress={() => go(`/quote/${encodeURIComponent(r.id)}`)} style={[styles.relCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[styles.relText, { color: c.textPrimary }]} numberOfLines={2}>{r.text}</Text>
                <Text style={[styles.relAuthor, { color: c.textSecondary }]}>— {r.author}</Text>
              </Pressable>
            ))}
          </>
        ) : null}
      </ScrollView>

      <QuoteShareModal visible={shareVisible} quote={quote} onClose={() => setShareVisible(false)} />
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 60 },
  card: { borderRadius: 22, borderWidth: 1, padding: 24, paddingTop: 28 },
  spark: { position: "absolute", top: 20, right: 20 },
  category: { fontSize: 12, fontFamily: "DMSans_700Bold", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14, alignSelf: "flex-start" },
  quote: { fontSize: 22, lineHeight: 34, fontFamily: "DMSans_500Medium", marginBottom: 14 },
  author: { fontSize: 15, fontFamily: "DMSans_500Medium", marginBottom: 18 },
  origin: { fontSize: 12, fontFamily: "DMSans_400Regular", marginBottom: 18, marginTop: -12 },
  divider: { height: 1, marginBottom: 16 },
  actions: { flexDirection: "row", gap: 26, alignItems: "center" },
  copied: { marginTop: 12, fontSize: 13, fontFamily: "DMSans_600SemiBold" },
  related: { marginTop: 26, marginBottom: 12, fontSize: 12, fontFamily: "DMSans_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  relCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  relText: { fontSize: 15, fontFamily: "DMSans_500Medium", lineHeight: 22 },
  relAuthor: { fontSize: 13, fontFamily: "DMSans_400Regular", marginTop: 6 },
});