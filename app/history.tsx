import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import {
  DailySparkEntry,
  getSparkHistory,
  getMonthSparkSummaries,
  getSparkForDate,
} from "@/lib/spark-storage";
import { Quote } from "@/data/quotes";
import { go } from "@/lib/navigation";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [history, setHistory] = useState<DailySparkEntry[]>([]);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [h, s] = await Promise.all([
        getSparkHistory(),
        getMonthSparkSummaries(year, month),
      ]);
      if (cancelled) return;
      setHistory(h);
      setSummaries(s);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = first.getDay();
    const arr: (string | null)[] = [];
    for (let i = 0; i < offset; i += 1) arr.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      arr.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return arr;
  }, [year, month]);

  const monthLabel = useMemo(
    () =>
      new Date(year, month, 1).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [year, month]
  );

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const openDay = async (date: string) => {
    const quote = await getSparkForDate(date);
    if (!quote) return;
    setSelectedDate(date);
    setSelectedQuote(quote);
  };

  const prettyDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
<View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: c.textPrimary }]}>Spark History</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Every day's Spark, saved on this device.
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={c.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.calendarCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.monthRow}>
              <Pressable
                onPress={() => changeMonth(-1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                style={styles.monthNav}
              >
                <Ionicons name="chevron-back" size={20} color={c.textSecondary} />
              </Pressable>
              <Text style={[styles.monthLabel, { color: c.textPrimary }]}>{monthLabel}</Text>
              <Pressable
                onPress={() => changeMonth(1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                style={styles.monthNav}
              >
                <Ionicons name="chevron-forward" size={20} color={c.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((w, i) => (
                <Text key={`${w}-${i}`} style={[styles.weekday, { color: c.textTertiary }]}>
                  {w}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {cells.map((date, i) =>
                date ? (
                  <Pressable
                    key={date}
                    onPress={() => openDay(date)}
                    disabled={!summaries[date]}
                    style={({ pressed }) => [
                      styles.dayCell,
                      { borderColor: c.border, opacity: pressed ? 0.6 : 1 },
                      summaries[date] && { backgroundColor: c.accentSoft },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${prettyDate(date)}${summaries[date] ? `, ${summaries[date]}` : ", no spark"}`}
                    accessibilityState={{ disabled: !summaries[date] }}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        { color: summaries[date] ? c.accent : c.textSecondary },
                      ]}
                    >
                      {Number(date.slice(-2))}
                    </Text>
                    {summaries[date] ? <View style={[styles.dot, { backgroundColor: c.accent }]} /> : null}
                  </Pressable>
                ) : (
                  <View key={`empty-${i}`} style={styles.dayCell} />
                )
              )}
            </View>
          </View>

          <Text style={[styles.listLabel, { color: c.textTertiary }]}>Recently saved</Text>
          {history.length === 0 ? (
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Open the app each day and your Spark will be saved here automatically.
            </Text>
          ) : (
            history.slice(0, 30).map((entry) => (
              <Pressable
                key={entry.date}
                onPress={() => openDay(entry.date)}
                style={({ pressed }) => [
                  styles.entry,
                  { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Open spark from ${prettyDate(entry.date)}`}
              >
                <Text style={[styles.entryDate, { color: c.textSecondary }]}>
                  {prettyDate(entry.date)}
                </Text>
                <Text style={[styles.entryText, { color: c.textPrimary }]} numberOfLines={2}>
                  "{entry.quote.text}"
                </Text>
                <Text style={[styles.entryAuthor, { color: c.textTertiary }]}>
                  {entry.quote.author} · {entry.quote.category}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
<Modal
        visible={!!selectedQuote}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedQuote(null)}
      >
        <View style={styles.backdrop}>
          <View style={[styles.dayModal, { backgroundColor: c.surface, borderColor: c.border }]}>
            {selectedQuote ? (
              <>
                <LinearGradient
                  colors={["#0F1A2E", "#1E2D47", "#2B3E5F"]}
                  style={styles.dayModalCard}
                >
                  <Text style={styles.dayModalDate}>
                    {selectedDate ? prettyDate(selectedDate) : ""}
                  </Text>
                  <Text style={styles.dayModalCategory}>{selectedQuote.category}</Text>
                  <Text style={styles.dayModalQuote}>“{selectedQuote.text}”</Text>
                  <Text style={styles.dayModalAuthor}>— {selectedQuote.author}</Text>
                </LinearGradient>
                <Pressable
                  onPress={() => {
                    const qid = String(selectedQuote.id);
                    setSelectedQuote(null);
                    go(`/quote/${encodeURIComponent(qid)}`);
                  }}
                  style={({ pressed }) => [styles.openButton, { opacity: pressed ? 0.85 : 1, backgroundColor: c.accent }]}
                  accessibilityRole="button"
                  accessibilityLabel="Open this quote"
                >
                  <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.openButtonText}>Open quote</Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedQuote(null)}
                  hitSlop={10}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text style={[styles.closeButtonText, { color: c.textSecondary }]}>Close</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "DMSans_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "DMSans_400Regular" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  calendarCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  monthNav: { padding: 6 },
  monthLabel: { fontSize: 16, fontFamily: "DMSans_700Bold" },
  weekRow: { flexDirection: "row", marginBottom: 8 },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  dayNumber: { fontSize: 14, fontFamily: "DMSans_500Medium" },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  listLabel: {
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  emptyText: {
    marginHorizontal: 20,
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },
  entry: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  entryDate: { fontSize: 12, fontFamily: "DMSans_600SemiBold", marginBottom: 6 },
  entryText: { fontSize: 15, fontFamily: "DMSans_500Medium", lineHeight: 22 },
  entryAuthor: { fontSize: 12, fontFamily: "DMSans_400Regular", marginTop: 6 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dayModal: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  dayModalCard: { padding: 22, paddingTop: 18 },
  dayModalDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  dayModalCategory: {
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
    marginBottom: 14,
  },
  dayModalQuote: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 28,
    fontFamily: "DMSans_500Medium",
    marginBottom: 10,
  },
  dayModalAuthor: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  openButtonText: { color: "#FFFFFF", fontSize: 15, fontFamily: "DMSans_700Bold" },
  closeButton: { alignItems: "center", paddingVertical: 12 },
  closeButtonText: { fontSize: 14, fontFamily: "DMSans_500Medium" },
});