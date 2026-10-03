import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { isAdsAvailable, getAdsModule, getAdRequestOptions } from "@/lib/ads";
import { getNativeAdUnitId } from "@/lib/ads-config";

/**
 * Native Advanced ad card for quote discovery feeds.
 *
 * Renders Google's official NativeAdView (media, CTA and click handling are
 * provided by AdMob) inside a Daily Spark themed card shell:
 *    [ AD · Sponsored ]  ← always visible badge
 *    <NativeAdView />
 * Nothing is faked: if the native module is absent, the ad fails to load, or
 * there is no fill, the card renders nothing and the feed flows past it.
 */
export default function NativeAdCard() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [renderer, setRenderer] = useState<((props: any) => React.JSX.Element) | null>(null);
  const [ad, setAd] = useState<any>(null);
  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web" || !isAdsAvailable()) {
      setInactive(true);
      return;
    }
    const mod = getAdsModule();
    if (!mod?.NativeAd || !mod?.NativeAdView) {
      setInactive(true);
      return;
    }
    let cancelled = false;
    void mod.NativeAd
      .createForAdRequest(getNativeAdUnitId(), getAdRequestOptions())
      .then((instance: any) => {
        if (cancelled) return;
        setRenderer(() => mod.NativeAdView);
        setAd(instance);
      })
      .catch(() => {
        if (!cancelled) setInactive(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (inactive || !ad || !renderer) return null;
  const NativeAdView = renderer;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.headRow}>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: c.textTertiary }]}>AD</Text>
        </View>
        <Text style={[styles.sponsored, { color: c.textTertiary }]}>Sponsored</Text>
      </View>
      <View style={styles.body}>
        <NativeAdView nativeAd={ad} style={styles.nativeView} />
      </View>
      <Text style={[styles.disclosure, { color: c.textTertiary }]}>
        About Google ads
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badge: {
    backgroundColor: "#E7E5EC",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: { fontSize: 10, fontFamily: "DMSans_700Bold", letterSpacing: 0.4 },
  sponsored: { fontSize: 11, fontFamily: "DMSans_400Regular" },
  body: { paddingHorizontal: 12 },
  nativeView: { width: "100%" },
  disclosure: { fontSize: 10, fontFamily: "DMSans_400Regular", paddingHorizontal: 12, paddingTop: 6 },
});