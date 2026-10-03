import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
  Linking,
  Alert,
  Modal,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemeColors } from "@/theme/colors";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/lib/language-context";
import ThemeOptions from "@/components/ThemeOptions";
import Constants from "expo-constants";

import { go } from "@/lib/navigation";
import {
  isMorningNightSparkEnabled,
  setMorningNightSparkEnabled,
} from "@/lib/spark-storage";

const PRIVACY_POLICY_URL =
  "https://mtcorestudio.github.io/daily-spark-privacy/";
const SUPPORT_EMAIL = "mtcorestudio@gmail.com";
const FACEBOOK_PAGE_URL = "https://www.facebook.com/share/1f1yRqVNzi/";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = makeStyles(c);
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const { language, setLanguage, languages } = useLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [morningNight, setMorningNight] = useState(true);

  useEffect(() => {
    isMorningNightSparkEnabled()
      .then(setMorningNight)
      .catch(() => {});
  }, []);

  const currentLang =
    languages.find((l) => l.code === language) ?? languages[0];

  const touch = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const openPrivacy = async () => {
    touch();
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      Alert.alert("Unable to open", "Could not open the privacy policy link.");
    }
  };

  const shareApp = async () => {
    touch();
    try {
      await Share.share({
        message:
          "Daily Spark – Inspirational quotes & daily motivation to keep you going. Install it here!",
      });
    } catch {
      // no-op when dismissed
    }
  };

  const openFacebook = async () => {
    touch();
    try {
      await Linking.openURL(FACEBOOK_PAGE_URL);
    } catch {
      Alert.alert("Unable to open", "Could not open the Facebook page.");
    }
  };

  const showAbout = () => {
    touch();
    Alert.alert(
      "Daily Spark",
      `Motivational quotes to spark your day.\n\nVersion ${Constants.expoConfig?.version ?? "1.0.0"}\nDeveloper: MT Core Studio\nMade with ❤️`
    );
  };

  const contactSupport = async () => {
    touch();
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Daily Spark Support`);
    } catch {}
  };

  const openMoreApps = async () => {
    touch();
    try {
      await Linking.openURL(
        "https://play.google.com/store/apps/details?id=com.dailyspark.quotes"
      );
    } catch {}
  };

  const menuItems = [
    {
      icon: "happy-outline" as const,
      title: "Mood",
      subtitle: "Find a spark for how you feel",
      onPress: () => {
        touch();
        go("/mood");
      },
    },
    {
      icon: "albums-outline" as const,
      title: "Spark Feed",
      subtitle: "Swipe through quotes",
      onPress: () => {
        touch();
        go("/feed");
      },
    },
    {
      icon: "calendar-outline" as const,
      title: "Spark History",
      subtitle: "Every day's Spark, saved on device",
      onPress: () => {
        touch();
        go("/history");
      },
    },
    {
      icon: "grid-outline" as const,
      title: "Widget Studio",
      subtitle: "Design a home-screen widget",
      onPress: () => {
        touch();
        go("/widgets");
      },
    },
    {
      icon: "eye-off-outline" as const,
      title: "Hidden Quotes",
      subtitle: "Restore quotes hidden from your feed",
      onPress: () => {
        touch();
        go("/hidden");
      },
    },
    {
      icon: "logo-facebook" as const,
      title: "Follow MT Core Studio",
      subtitle: "Daily Spark updates & behind the scenes",
      onPress: openFacebook,
    },
    {
      icon: "apps-outline" as const,
      title: "More Apps",
      subtitle: "Daily Spark on Google Play",
      onPress: openMoreApps,
    },
    {
      icon: "language-outline" as const,
      title: "Language",
      subtitle: `${currentLang.flag}  ${currentLang.label} · ${currentLang.country}`,
      onPress: () => {
        touch();
        setLanguageOpen((open) => !open);
      },
    },
    {
      icon: "share-social-outline" as const,
      title: "Share Daily Spark",
      subtitle: "Tell a friend about this app",
      onPress: shareApp,
    },
    {
      icon: "shield-checkmark-outline" as const,
      title: "Privacy Policy",
      subtitle: "How we handle your data",
      onPress: openPrivacy,
    },
    {
      icon: "mail-outline" as const,
      title: "Contact Support",
      subtitle: SUPPORT_EMAIL,
      onPress: contactSupport,
    },
    {
      icon: "information-circle-outline" as const,
      title: "About",
      subtitle: "Version and app info",
      onPress: showAbout,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 16 }]}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <ThemeOptions />

        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="partly-sunny-outline" size={22} color={c.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Morning & Night Spark</Text>
              <Text style={styles.menuSubtitle}>
                Show a time-of-day spark card on Home
              </Text>
            </View>
            <Switch
              value={morningNight}
              onValueChange={(v) => {
                touch();
                setMorningNight(v);
                void setMorningNightSparkEnabled(v);
              }}
              trackColor={{ true: c.accent, false: c.border }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Morning and Night Spark"
            />
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.title}
              style={({ pressed }) => [
                styles.menuItem,
                index === menuItems.length - 1 && { borderBottomWidth: 0 },
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={22} color={c.accent} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={c.textTertiary}
              />
            </Pressable>
          ))}
        </View>

        <Modal
          visible={languageOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setLanguageOpen(false)}
        >
          <Pressable
            style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}
            onPress={() => setLanguageOpen(false)}
          >
            <View
              style={{
                backgroundColor: c.surface,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                padding: 20,
                paddingBottom: 44,
              }}
            >
              <Text style={[styles.languageTitle, { color: c.textSecondary }]}>
                Choose your language
              </Text>
              {languages.map((lang) => {
                const active = lang.code === language;
                return (
                  <Pressable
                    key={lang.code}
                    style={({ pressed }) => [
                      styles.languageRow,
                      { borderTopColor: c.border, opacity: pressed ? 0.6 : 1 },
                    ]}
                    onPress={() => {
                      touch();
                      setLanguage(lang.code);
                      setLanguageOpen(false);
                    }}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.languageLabel, { color: c.textPrimary }]}>
                        {lang.label}
                      </Text>
                      <Text style={[styles.languageCountry, { color: c.textTertiary }]}>
                        {lang.country} · {lang.nativeName}
                      </Text>
                    </View>
                    {active && (
                      <Ionicons name="checkmark-circle" size={20} color={c.success} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>

        <Text style={styles.footer}>
          Daily Spark is free and supported by ads.
          {"\n"}Get inspired. Keep going.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  menuContainer: {
    backgroundColor: c.surface,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: c.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: "DMSans_600SemiBold",
    color: c.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: c.textSecondary,
  },
  footer: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: c.textTertiary,
    textAlign: "center",
    marginTop: 28,
    lineHeight: 20,
  },
  languageContainer: {
    backgroundColor: c.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
    paddingVertical: 6,
  },
  languageTitle: {
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
    color: c.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  languageFlag: {
    fontSize: 18,
    marginRight: 12,
  },
  languageLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    color: c.textPrimary,
  },
  languageCountry: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
});
