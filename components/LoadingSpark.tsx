import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";

/**
 * Branded loading experience used while online quotes are being fetched.
 * Shows the Daily Spark mark with a soft pulse, a short status line and
 * skeleton quote cards — no fake quote text is ever displayed.
 */
export default function LoadingSpark({ message = "Gathering your Sparks…" }: { message?: string }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const pulse = useRef(new Animated.Value(0.35)).current;
  const bars = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    const barLoops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 0.7,
            duration: 700 + i * 120,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.3,
            duration: 700 + i * 120,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
    );
    barLoops.forEach((l) => l.start());
    return () => {
      loop.stop();
      barLoops.forEach((l) => l.stop());
    };
  }, [pulse, bars]);

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <Animated.View style={[styles.mark, { opacity: pulse, transform: [{ scale: pulse }] }]}>
        <View style={[styles.markCircle, { backgroundColor: c.accentSoft }]}>
          <Ionicons name="sparkles" size={34} color={c.accent} />
        </View>
      </Animated.View>

      <Text style={[styles.title, { color: c.textPrimary }]}>Daily Spark</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>{message}</Text>

      <View style={styles.skeletons}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.skeletonCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Animated.View style={[styles.skeletonBar, { backgroundColor: c.surfaceSecondary, opacity: bars[i] }]} />
            <Animated.View
              style={[
                styles.skeletonBar,
                { backgroundColor: c.surfaceSecondary, opacity: bars[i], width: "52%", marginTop: 8 },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  mark: { marginBottom: 14 },
  markCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontFamily: "DMSans_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "DMSans_400Regular", marginTop: 4, marginBottom: 30 },
  skeletons: { alignSelf: "stretch", gap: 12 },
  skeletonCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  skeletonBar: { height: 12, borderRadius: 6, width: "88%" },
});