import React, { useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Platform,
  Alert,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { isAdsAvailable } from "@/lib/ads";
import {
  unlockWithRewardedAd,
  rewardOutcomeMessage,
} from "@/lib/ads-rewards";

const LOGO = require("../assets/images/splash-icon.png");

interface Props {
  visible: boolean;
  quote: { text: string; author: string; category: string } | null;
  onClose: () => void;
}

/**
 * Shows a styled, shareable quote postcard (with the Daily Spark logo + name)
 * and lets the user share it as a PNG image.
 */
export default function QuoteShareModal({ visible, quote, onClose }: Props) {
  const cardRef = useRef<View>(null);

  const doShare = async () => {
    if (!quote) return;
    if (Platform.OS === "web") {
      try {
        await Share.share({
          message: `"${quote.text}" - ${quote.author}\n\nShared via Daily Spark`,
        });
      } catch {}
      onClose();
      return;
    }
    // Image export is a rewarded action on native builds: it only unlocks
    // after Google reports the reward was earned (never from showing the ad).
    if (isAdsAvailable()) {
      const reward = await unlockWithRewardedAd();
      if (!reward.unlocked) {
        Alert.alert("Watch a short video", rewardOutcomeMessage(reward.outcome));
        onClose();
        return;
      }
    }
    try {
      const uri = await captureRef(cardRef, {
        result: "tmpfile",
        format: "png",
        quality: 1,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share this quote as an image",
        });
      } else {
        await Share.share({
          message: `"${quote.text}" - ${quote.author}\n\nShared via Daily Spark`,
        });
      }
    } catch {
      // captured view unavailable or share dismissed
    } finally {
      onClose();
    }
  };

  if (!quote) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          ref={cardRef}
          collapsable={false}
          style={styles.cardWrap}
        >
          <LinearGradient
            colors={["#0F1A2E", "#1E2D47", "#2B3E5F"]}
            style={styles.card}
          >
            <Ionicons
              name="sparkles"
              size={22}
              color="rgba(212,165,74,0.9)"
              style={styles.spark}
            />
            <Text style={styles.category}>{quote.category}</Text>
            <Text style={styles.quoteText}>“{quote.text}”</Text>
            <Text style={styles.author}>— {quote.author}</Text>

            <View style={styles.divider} />

            <View style={styles.brandRow}>
              <Image source={LOGO} style={styles.brandLogo} contentFit="contain" />
              <View style={styles.brandText}>
                <Text style={styles.brandName}>Daily Spark</Text>
                <Text style={styles.brandTag}>
                  Quotes & daily inspiration
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionPrimary,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={doShare}
          >
            <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionPrimaryText}>Share as Image</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionSecondary,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.actionSecondaryText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  card: {
    padding: 24,
    paddingTop: 28,
  },
  spark: {
    position: "absolute",
    top: 20,
    right: 20,
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
  quoteText: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 32,
    fontFamily: "DMSans_500Medium",
    marginBottom: 12,
  },
  author: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 38,
    height: 38,
    marginRight: 12,
  },
  brandText: {
    flex: 1,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "DMSans_700Bold",
  },
  brandTag: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
  },
  actions: {
    marginTop: 20,
    width: "100%",
    maxWidth: 360,
  },
  actionPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D4A54A",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  actionPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
  },
  actionSecondary: {
    alignItems: "center",
    paddingVertical: 12,
  },
  actionSecondaryText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
  },
});