import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  StudioTemplate,
  StudioFontKey,
  fontFamilyFor,
} from "@/theme/studio-themes";

const LOGO = require("../assets/images/splash-icon.png");

export interface ArtQuote {
  text: string;
  author: string;
  category: string;
}

interface Props {
  quote: ArtQuote;
  template: StudioTemplate;
  fontKey: StudioFontKey;
  /** Relative quote size, e.g. 0.8 – 1.4. */
  fontSize: number;
  alignment: "left" | "center" | "right";
  aspect: number;
  showBranding: boolean;
  showCategory: boolean;
  showAuthor: boolean;
}

function overlayFor(template: StudioTemplate) {
  switch (template.overlay) {
    case "orbs":
      return (
        <>
          <View style={[styles.orb, { top: "-12%", right: "-18%", backgroundColor: "rgba(255,255,255,0.08)" }]} />
          <View style={[styles.orb, { bottom: "-20%", left: "-14%", backgroundColor: "rgba(255,255,255,0.06)" }]} />
        </>
      );
    case "rays":
      return (
        <>
          <View style={[styles.ray, { top: "8%", left: "12%", width: "70%", backgroundColor: "rgba(255,255,255,0.07)" }]} />
          <View style={[styles.ray, { top: "22%", left: "-6%", width: "48%", backgroundColor: "rgba(255,255,255,0.05)" }]} />
          <View style={[styles.ray, { top: "36%", right: "-4%", width: "38%", backgroundColor: "rgba(255,255,255,0.05)" }]} />
        </>
      );
    case "aurora":
      return (
        <>
          <View style={[styles.aurora, { top: "-25%", right: "-25%", backgroundColor: "rgba(255,255,255,0.10)" }]} />
          <View style={[styles.aurora, { bottom: "-30%", left: "-22%", backgroundColor: "rgba(255,255,255,0.07)" }]} />
        </>
      );
    default:
      return null;
  }
}

export default function SparkArtCard({
  quote,
  template,
  fontKey,
  fontSize,
  alignment,
  aspect,
  showBranding,
  showCategory,
  showAuthor,
}: Props) {
  const alignStyle =
    alignment === "center"
      ? { alignItems: "center" as const }
      : alignment === "right"
        ? { alignItems: "flex-end" as const }
        : { alignItems: "flex-start" as const };

  return (
    <LinearGradient
      colors={template.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { aspectRatio: aspect }]}
    >
      {overlayFor(template)}

      <View style={[styles.inner, alignStyle, { paddingTop: 26 }]}>
        <Ionicons name="sparkles" size={24} color={template.accent} style={styles.spark} />

        {showCategory ? (
          <View style={[styles.categoryChip, template.light ? styles.chipLight : styles.chipDark]}>
            <Text style={[styles.categoryText, { color: template.accent }]}>{quote.category}</Text>
          </View>
        ) : null}

        <Text
          style={[
            styles.quote,
            {
              color: template.text,
              fontFamily: fontFamilyFor(fontKey),
              fontSize: 17 * fontSize,
              lineHeight: 26 * fontSize,
              textAlign: alignment,
            },
          ]}
        >
          "{quote.text}"
        </Text>

        {showAuthor ? (
          <Text style={[styles.author, { color: template.softText }]}>— {quote.author}</Text>
        ) : null}

        <View style={styles.spacer} />

        {showBranding ? (
          <View style={styles.brandRow}>
            <Image source={LOGO} style={styles.logo} contentFit="contain" />
            <View>
              <Text style={[styles.brandName, { color: template.text }]}>Daily Spark</Text>
              <Text style={[styles.brandTag, { color: template.softText }]}>
                Quotes & daily inspiration
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  inner: { flex: 1, padding: 22, justifyContent: "center" },
  spark: { position: "absolute", top: 20, right: 20 },
  orb: { position: "absolute", width: 260, height: 260, borderRadius: 130 },
  aurora: { position: "absolute", width: 320, height: 320, borderRadius: 160 },
  ray: { position: "absolute", height: 1, transform: [{ rotate: "-14deg" }] },
  categoryChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  chipDark: { backgroundColor: "rgba(255,255,255,0.10)" },
  chipLight: { backgroundColor: "rgba(0,0,0,0.05)" },
  categoryText: {
    fontSize: 11,
    fontFamily: "DMSans_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  quote: { marginBottom: 14, maxWidth: "96%" },
  author: { fontSize: 14, fontFamily: "DMSans_500Medium" },
  spacer: { flex: 1 },
  brandRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  logo: { width: 34, height: 34, marginRight: 10 },
  brandName: { fontSize: 14, fontFamily: "DMSans_700Bold" },
  brandTag: { fontSize: 11, fontFamily: "DMSans_400Regular" },
});