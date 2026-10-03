import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, ZoomIn, SlideInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { getQuotes } from "@/lib/quote-storage";
import QuoteShareModal from "@/components/QuoteShareModal";
import { useFavorites } from "@/hooks/useFavorites";
import { go } from "@/lib/navigation";
import { copyText } from "@/lib/clipboard";
import { trackInterstitialCheckpoint } from "@/lib/ads";
import { useLanguage } from "@/lib/language-context";
import { LANGUAGES } from "@/lib/languages";

/** Precomputed spark particle trajectories (immutable → deterministic animations). */
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  tx: -160 + ((i * 23) % 320),
  ty: -130 + ((i * 17) % 260),
  size: 6 + (i % 3) * 4,
  delay: (i % 5) * 45,
}));

type LightQuote = { id: string; text: string; author: string; category: string };

export default function SurpriseScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const { language } = useLanguage();
  const selectedCountry = LANGUAGES.find((l) => l.code === language)?.country;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [current, setCurrent] = useState<LightQuote | null>(null);
  const [burst, setBurst] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["surprise-quotes", language, selectedCountry],
    queryFn: () =>
      getQuotes({ language: language || undefined, country: selectedCountry, limit: 500 }),
  });

  const pool = useMemo(() => quotes, [quotes]);

  const give = useCallback(() => {
    if (pool.length === 0) return;
    trackInterstitialCheckpoint();
    if (typeof Haptics?.impactAsync === "function") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setBurst((n) => n + 1);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setTimeout(() => setCurrent(pick), 320);
  }, [pool]);

  const copyQuote = async () => {
    if (!current) return;
    if (typeof Haptics?.impactAsync === "function") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    await copyText(`"${current.text}" — ${current.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
// __JSX__
<View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>Spark of the Moment</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Take a breath, then ask for a spark.
        </Text>
      </View>
      <View style={styles.content}>
        {!current ? (
          <View style={styles.idleWrap}>
            {burst > 0 ? (
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                {PARTICLES.map((p) => (
                  <Animated.View
                    key={`${burst}-${p.id}`}
                    entering={FadeIn.duration(500).delay(p.delay)}
                    style={[
                      styles.particle,
                      {
                        left: "50%",
                        top: "50%",
                        width: p.size,
                        height: p.size,
                        borderRadius: p.size / 2,
                        backgroundColor: c.accent,
                        transform: [{ translateX: p.tx }, { translateY: p.ty }, { scale: 0.4 }],
                      },
                    ]}
                  />
                ))}
              </View>
            ) : null}
            <Pressable
              onPress={give}
              disabled={pool.length === 0}
              style={({ pressed }) => [styles.giveButton, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Give me a spark"
            >
              <LinearGradient colors={["#D4A54A", "#8A6B2F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.giveButtonGradient}>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.giveButtonText}>Give Me a Spark</Text>
              </LinearGradient>
            </Pressable>
            <Text style={[styles.hint, { color: c.textTertiary }]}>
              {isLoading ? "Loading sparks…" : `${pool.length} sparks in the library`}
            </Text>
          </View>
        ) : (
          <Animated.View entering={ZoomIn.springify().damping(15)} style={styles.reveal}>
            <LinearGradient colors={["#0F1A2E", "#1E2D47", "#2B3E5F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.revealCard}>
              <Ionicons name="sparkles" size={22} color="rgba(212,165,74,0.9)" style={styles.revealSpark} />
              <Text style={styles.revealCategory}>{current.category}</Text>
              <Text style={styles.revealQuote}>“{current.text}”</Text>
              <Text style={styles.revealAuthor}>— {current.author}</Text>
              <View style={styles.revealActions}>
                <Pressable
                  onPress={() => toggleFavorite(String(current.id))}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={isFavorite(String(current.id)) ? "Remove from favorites" : "Add to favorites"}
                  style={styles.revealAction}
                >
                  <Ionicons name={isFavorite(String(current.id)) ? "heart" : "heart-outline"} size={22} color={isFavorite(String(current.id)) ? "#F06B6B" : "rgba(255,255,255,0.85)"} />
                </Pressable>
                <Pressable onPress={() => setShareVisible(true)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Share this spark" style={styles.revealAction}>
                  <Ionicons name="share-social-outline" size={22} color="rgba(255,255,255,0.85)" />
                </Pressable>
                <Pressable onPress={copyQuote} hitSlop={12} accessibilityRole="button" accessibilityLabel="Copy this spark" style={styles.revealAction}>
                  <Ionicons name={copied ? "checkmark" : "copy-outline"} size={22} color={copied ? "#45C477" : "rgba(255,255,255,0.85)"} />
                </Pressable>
                <Pressable onPress={() => go(`/studio/${encodeURIComponent(String(current.id))}`)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Create an image from this spark" style={styles.revealAction}>
                  <Ionicons name="color-wand-outline" size={22} color="rgba(255,255,255,0.85)" />
                </Pressable>
                <Pressable onPress={() => go(`/quote/${encodeURIComponent(String(current.id))}`)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Open this spark in the reader" style={styles.revealAction}>
                  <Ionicons name="open-outline" size={22} color="rgba(255,255,255,0.85)" />
                </Pressable>
              </View>
            </LinearGradient>
            <Animated.View entering={SlideInDown.springify().damping(16)}>
              <Pressable
                onPress={give}
                style={({ pressed }) => [styles.againButton, { borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Give me another spark"
              >
                <Ionicons name="shuffle" size={16} color={c.accent} />
                <Text style={[styles.againButtonText, { color: c.accent }]}>Another Spark</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}
      </View>
      <QuoteShareModal visible={shareVisible} quote={current} onClose={() => setShareVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontFamily: "DMSans_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "DMSans_400Regular" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  idleWrap: { alignItems: "center", justifyContent: "center", flex: 1, alignSelf: "stretch" },
  particle: { position: "absolute" },
  giveButton: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 4,
  },
  giveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  giveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "DMSans_700Bold",
  },
  hint: {
    marginTop: 14,
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  reveal: { alignSelf: "stretch", alignItems: "center", gap: 18 },
  revealCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    paddingTop: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  revealSpark: { position: "absolute", top: 20, right: 20 },
  revealCategory: {
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
  revealQuote: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 32,
    fontFamily: "DMSans_500Medium",
    marginBottom: 12,
  },
  revealAuthor: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    marginBottom: 20,
  },
  revealActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    paddingTop: 16,
  },
  revealAction: { paddingHorizontal: 6, paddingVertical: 2 },
  againButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  againButtonText: { fontSize: 14, fontFamily: "DMSans_600SemiBold" },
});