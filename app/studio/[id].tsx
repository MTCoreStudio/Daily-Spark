import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useTheme } from "@/hooks/useTheme";
import { getQuoteById } from "@/lib/quote-service";
import { requestShareUnlock } from "@/lib/ads-rewards";
import EmptyState from "@/components/EmptyState";
import SparkArtCard from "@/components/SparkArtCard";
import {
  STUDIO_TEMPLATES,
  STUDIO_FONTS,
  STUDIO_ASPECTS,
  StudioTemplateKey,
  StudioFontKey,
  StudioAspectKey,
  getStudioTemplate,
  fontFamilyFor,
  aspectRatio,
} from "@/theme/studio-themes";

// Lazy, guarded media library (native module — absent in Expo Go / web).
function getMediaLibrary() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("expo-media-library");
  } catch {
    return null;
  }
}

export default function SparkStudioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const artRef = useRef<View>(null);

  const [templateKey, setTemplateKey] = useState<StudioTemplateKey>("classic");
  const [fontKey, setFontKey] = useState<StudioFontKey>("medium");
  const [fontSize, setFontSize] = useState(1);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center");
  const [aspectKey, setAspectKey] = useState<StudioAspectKey>("post");
  const [showBranding, setShowBranding] = useState(true);
  const [showCategory, setShowCategory] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [busy, setBusy] = useState(false);

  const quoteQuery = useQuery({
    queryKey: ["quote", id],
    queryFn: () => getQuoteById(String(id)),
    enabled: !!id,
  });
  const quote = quoteQuery.data;

  const template = getStudioTemplate(templateKey);

  if (quoteQuery.isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }
  if (!quote) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <EmptyState title="Quote not found" message="This quote may have been removed." />
      </View>
    );
  }

  const touch = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const capture = async () => {
    try {
      return await captureRef(artRef, { result: "tmpfile", format: "png", quality: 1 });
    } catch {
      return null;
    }
  };

  // Save/Share are NOT hard-gated today (ads may not be filling). A user can
  // SKIP the optional rewarded-ad prompt and proceed directly, or watch a
  // short sponsored video to earn the unlock.
  const performSave = async () => {
    setBusy(true);
    try {
      if (Platform.OS === "web") {
        await Share.share({ message: `"${quote.text}" — ${quote.author}` });
        return;
      }
      const ML = getMediaLibrary();
      if (!ML) {
        Alert.alert("Not available", "Saving images needs a development build.");
        return;
      }
      const uri = await capture();
      if (!uri) throw new Error("capture failed");
      const perm = await ML.requestPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Permission needed", "Allow photo access to save your Spark image.");
        return;
      }
      await ML.saveToLibraryAsync(uri);
      Alert.alert("Saved", "Your Spark image was saved to your photos.");
    } catch {
      Alert.alert("Could not save", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const performShare = async () => {
    setBusy(true);
    try {
      if (Platform.OS === "web") {
        await Share.share({ message: `"${quote.text}" — ${quote.author}\n\nvia Daily Spark` });
        return;
      }
      const uri = await capture();
      if (!uri) throw new Error("capture failed");
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your Spark" });
      } else {
        await Share.share({ message: `"${quote.text}" — ${quote.author}` });
      }
    } catch {
      // dismissed or unavailable
    } finally {
      setBusy(false);
    }
  };

  const saveToPhotos = () => {
    touch();
    void requestShareUnlock(performSave);
  };

  const shareImage = () => {
    touch();
    void requestShareUnlock(performShare);
  };

  return (
<View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.previewWrap, { paddingTop: insets.top + 8 }]}>
          <View ref={artRef} collapsable={false} style={[styles.previewCard, { maxWidth: 380 }]}>
            <SparkArtCard
              quote={quote}
              template={template}
              fontKey={fontKey}
              fontSize={fontSize}
              alignment={alignment}
              aspect={aspectRatio(aspectKey)}
              showBranding={showBranding}
              showCategory={showCategory}
              showAuthor={showAuthor}
            />
          </View>
        </View>

        <ControlRow label="Template">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {STUDIO_TEMPLATES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => { touch(); setTemplateKey(t.key); }}
                style={[styles.chip, { borderColor: c.border }, templateKey === t.key && { backgroundColor: c.accentSoft, borderColor: c.accent }]}
                accessibilityRole="button"
                accessibilityLabel={`Template ${t.label}`}
                accessibilityState={{ selected: templateKey === t.key }}
              >
                <Text style={[styles.chipText, { color: c.textPrimary }]}>
                  {t.emoji} {t.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </ControlRow>

        <ControlRow label="Font">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {STUDIO_FONTS.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => { touch(); setFontKey(f.key); }}
                style={[styles.chip, { borderColor: c.border }, fontKey === f.key && { backgroundColor: c.accentSoft, borderColor: c.accent }]}
                accessibilityRole="button"
                accessibilityLabel={`Font ${f.label}`}
                accessibilityState={{ selected: fontKey === f.key }}
              >
                <Text style={[styles.chipText, { color: c.textPrimary, fontFamily: fontFamilyFor(f.key) }]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </ControlRow>

        <ControlRow label="Text size">
          <View style={styles.sizeRow}>
            <Pressable
              onPress={() => setFontSize((s) => Math.max(0.7, +(s - 0.1).toFixed(1)))}
              style={[styles.sizeBtn, { borderColor: c.border }]}
              accessibilityRole="button"
              accessibilityLabel="Smaller text"
              hitSlop={8}
            >
              <Text style={[styles.sizeBtnText, { color: c.textPrimary }]}>A−</Text>
            </Pressable>
            <Text style={[styles.sizeValue, { color: c.textSecondary }]}>
              {Math.round(fontSize * 100)}%
            </Text>
            <Pressable
              onPress={() => setFontSize((s) => Math.min(1.5, +(s + 0.1).toFixed(1)))}
              style={[styles.sizeBtn, { borderColor: c.border }]}
              accessibilityRole="button"
              accessibilityLabel="Larger text"
              hitSlop={8}
            >
              <Text style={[styles.sizeBtnText, { color: c.textPrimary }]}>A+</Text>
            </Pressable>
          </View>
        </ControlRow>
<ControlRow label="Alignment">
          <View style={styles.sizeRow}>
            {(["left", "center", "right"] as const).map((a) => (
              <Pressable
                key={a}
                onPress={() => { touch(); setAlignment(a); }}
                style={[styles.chip, { borderColor: c.border }, alignment === a && { backgroundColor: c.accentSoft, borderColor: c.accent }]}
                accessibilityRole="button"
                accessibilityLabel={`Align ${a}`}
                accessibilityState={{ selected: alignment === a }}
              >
                <Ionicons name={a === "left" ? "arrow-back" : a === "right" ? "arrow-forward" : "swap-horizontal"} size={14} color={c.textPrimary} />
                <Text style={[styles.chipText, { color: c.textPrimary }]}>{a}</Text>
              </Pressable>
            ))}
          </View>
        </ControlRow>

        <ControlRow label="Output size">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {STUDIO_ASPECTS.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => { touch(); setAspectKey(a.key); }}
                style={[styles.chip, { borderColor: c.border }, aspectKey === a.key && { backgroundColor: c.accentSoft, borderColor: c.accent }]}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                accessibilityState={{ selected: aspectKey === a.key }}
              >
                <Text style={[styles.chipText, { color: c.textPrimary }]}>{a.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </ControlRow>

        <ControlRow label="Show on card">
          <View style={styles.toggleRow}>
            <ToggleChip label="Category" active={showCategory} onPress={() => { touch(); setShowCategory((v) => !v); }} />
            <ToggleChip label="Author" active={showAuthor} onPress={() => { touch(); setShowAuthor((v) => !v); }} />
            <ToggleChip label="Branding" active={showBranding} onPress={() => { touch(); setShowBranding((v) => !v); }} />
          </View>
        </ControlRow>

        <View style={styles.actionRow}>
          <Pressable
            onPress={saveToPhotos}
            disabled={busy}
            style={({ pressed }) => [styles.actionPrimary, { opacity: pressed || busy ? 0.8 : 1, backgroundColor: c.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Save image to photos"
          >
            <Ionicons name="download-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionPrimaryText}>{busy ? "Working…" : "Save Image"}</Text>
          </Pressable>
          <Pressable
            onPress={shareImage}
            disabled={busy}
            style={({ pressed }) => [styles.actionSecondary, { opacity: pressed || busy ? 0.8 : 1, borderColor: c.border }]}
            accessibilityRole="button"
            accessibilityLabel="Share image"
          >
            <Ionicons name="share-social-outline" size={18} color={c.accent} />
            <Text style={[styles.actionSecondaryText, { color: c.accent }]}>Share</Text>
          </Pressable>
        </View>
        <Text style={[styles.hint, { color: c.textTertiary }]}>
          Save/Share exports the card at screen resolution. Wallpaper mode uses a tall
          9:19.5 frame — set it as wallpaper from your photos app.
        </Text>
      </ScrollView>
    </View>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.controlRow}>
      <Text style={[styles.controlLabel, { color: c.textTertiary }]}>{label}</Text>
      {children}
    </View>
  );
}

function ToggleChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { borderColor: c.border }, active && { backgroundColor: c.accentSoft, borderColor: c.accent }]}
      accessibilityRole="button"
      accessibilityLabel={`Toggle ${label}`}
      accessibilityState={{ selected: active }}
    >
      <Ionicons name={active ? "checkmark-circle" : "ellipse-outline"} size={14} color={active ? c.accent : c.textTertiary} />
      <Text style={[styles.chipText, { color: c.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  previewCard: { width: "100%", alignSelf: "center" },
  controlRow: { paddingHorizontal: 20, marginTop: 14 },
  controlLabel: {
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipRow: { gap: 8, paddingRight: 20 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontFamily: "DMSans_500Medium" },
  sizeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sizeBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  sizeBtnText: { fontSize: 13, fontFamily: "DMSans_700Bold" },
  sizeValue: { fontSize: 13, fontFamily: "DMSans_600SemiBold", minWidth: 44, textAlign: "center" },
  toggleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginTop: 22 },
  actionPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionPrimaryText: { color: "#FFFFFF", fontSize: 15, fontFamily: "DMSans_700Bold" },
  actionSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionSecondaryText: { fontSize: 14, fontFamily: "DMSans_700Bold" },
  hint: { paddingHorizontal: 20, marginTop: 12, fontSize: 12, fontFamily: "DMSans_400Regular", lineHeight: 18 },
});