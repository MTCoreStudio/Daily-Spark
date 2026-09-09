import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { isAdsAvailable, getAdsModule, getAdRequestOptions, ADS_BANNER_UNIT_ID } from "@/lib/ads";

/**
 * A small, non-intrusive adaptive banner shown at the bottom of the feed.
 * Renders nothing on web / Expo Go (where the native module is absent).
 */
export default function AdBanner() {
  const [banner, setBanner] = useState<{
    Component: any;
    unitId: string;
    size: any;
  } | null>(null);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isAdsAvailable() || Platform.OS === "web") return;
    const mod = getAdsModule();
    if (!mod) return;

    const size =
      mod.BannerAdSize?.ANCHORED_ADAPTIVE_BANNER ?? mod.BannerAdSize?.BANNER;
    const unitId = ADS_BANNER_UNIT_ID;

    setBanner({ Component: mod.BannerAd, unitId, size });
  }, []);

  if (!banner || failed) return null;

  return (
    <View style={styles.container}>
      <banner.Component
        unitId={banner.unitId}
        size={banner.size}
        requestOptions={getAdRequestOptions()}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
