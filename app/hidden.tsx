import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import {
  getHiddenQuoteIds,
  unhideQuote,
  clearHiddenQuotes,
} from "@/lib/quote-storage";
import EmptyState from "@/components/EmptyState";

export default function HiddenQuotesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [hidden, setHidden] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getHiddenQuoteIds()
      .then((ids) => {
        if (cancelled) return;
        setHidden(ids);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const clearAll = () => {
    Alert.alert(
      "Restore hidden quotes?",
      `This restores ${hidden.length} quote${hidden.length !== 1 ? "s" : ""} to your feed. Quotes are never deleted from the library.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore all",
          style: "destructive",
          onPress: async () => {
            try {
              await clearHiddenQuotes();
            } finally {
              setHidden([]);
            }
          },
        },
      ]
    );
  };

  const restore = async (id: string) => {
    try {
      await unhideQuote(id);
    } finally {
      setHidden((prev) => prev.filter((h) => h !== id));
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>Hidden Quotes</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Hidden quotes are removed from your feed only — they stay in the library for everyone else.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        {hidden.length === 0 ? (
          <EmptyState
            icon="eye-outline"
            title="Nothing hidden"
            message="When you hide a quote from your feed it will appear here so you can restore it anytime."
          />
        ) : (
          <View style={styles.list}>
            {hidden.map((id) => (
              <View key={id} style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Ionicons name="eye-off-outline" size={20} color={c.textTertiary} />
                <Text style={[styles.rowId, { color: c.textPrimary }]} numberOfLines={2}>
                  {id}
                </Text>
                <Pressable
                  onPress={() => restore(id)}
                  style={({ pressed }) => [styles.restoreBtn, { borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Restore hidden quote ${id}`}
                >
                  <Text style={[styles.restoreText, { color: c.accent }]}>Restore</Text>
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={clearAll}
              style={({ pressed }) => [styles.clearAll, { borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Restore all hidden quotes"
            >
              <Ionicons name="refresh" size={16} color={c.error} />
              <Text style={[styles.clearAllText, { color: c.error }]}>
                Restore all ({hidden.length})
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "DMSans_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 13, fontFamily: "DMSans_400Regular", lineHeight: 19 },
  list: { paddingHorizontal: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowId: { flex: 1, fontSize: 13, fontFamily: "DMSans_500Medium" },
  restoreBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  restoreText: { fontSize: 13, fontFamily: "DMSans_600SemiBold" },
  clearAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  clearAllText: { fontSize: 14, fontFamily: "DMSans_600SemiBold" },
});