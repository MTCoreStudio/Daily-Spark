import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import {
  QuoteCollection,
  getCollections,
  createCollection,
  deleteCollection,
  addQuoteToCollection,
  removeQuoteFromCollection,
  collectionIdsContainingQuote,
} from "@/lib/collections";

interface Props {
  visible: boolean;
  quoteId: string;
  onClose: () => void;
}

const EMOJIS = ["❤️", "🔥", "🌙", "📚", "💔", "⭐", "💜", "🌱"];

export default function CollectionsModal({ visible, quoteId, onClose }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [collections, setCollections] = useState<QuoteCollection[]>([]);
  const [containing, setContaining] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [emojiIdx, setEmojiIdx] = useState(0);

  const refresh = useCallback(async () => {
    const [cols, inCols] = await Promise.all([
      getCollections(),
      collectionIdsContainingQuote(quoteId),
    ]);
    setCollections(cols);
    setContaining(inCols);
    setCreating(false);
    setName("");
  }, [quoteId]);

  useEffect(() => {
    if (visible) void refresh();
  }, [visible, refresh]);

  const toggle = async (collection: QuoteCollection) => {
    const isIn = containing.includes(collection.id);
    if (isIn) {
      await removeQuoteFromCollection(collection.id, quoteId);
    } else {
      await addQuoteToCollection(collection.id, quoteId);
    }
    void refresh();
  };

  const createAndAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Collection name", "Give your collection a name first.");
      return;
    }
    const col = await createCollection(trimmed, EMOJIS[emojiIdx % EMOJIS.length]);
    await addQuoteToCollection(col.id, quoteId);
    void refresh();
  };

  const removeCollection = async (id: string) => {
    Alert.alert("Delete collection?", "Quotes inside it stay in your favorites.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCollection(id);
          void refresh();
        },
      },
    ]);
  };

  return (
// __JSX__
<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.textPrimary }]}>Add to collection</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close collections">
              <Ionicons name="close" size={22} color={c.textSecondary} />
            </Pressable>
          </View>

          {collections.length === 0 && !creating ? (
            <Text style={[styles.empty, { color: c.textSecondary }]}>
              No collections yet. Create your first saved-quote collection below.
            </Text>
          ) : null}

          <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
            {collections.map((col) => {
              const active = containing.includes(col.id);
              return (
                <View key={col.id} style={[styles.row, { borderBottomColor: c.border }]}>
                  <Pressable
                    onPress={() => toggle(col)}
                    style={styles.colMain}
                    accessibilityRole="button"
                    accessibilityLabel={`${col.name}, ${active ? "in collection" : "not in collection"}`}
                  >
                    <Text style={styles.colEmoji}>{col.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.colName, { color: c.textPrimary }]}>{col.name}</Text>
                      <Text style={[styles.colCount, { color: c.textTertiary }]}>
                        {col.quoteIds.length} quote{col.quoteIds.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <Ionicons
                      name={active ? "checkmark-circle" : "ellipse-outline"}
                      size={22}
                      color={active ? c.accent : c.textTertiary}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => removeCollection(col.id)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete collection ${col.name}`}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={c.error} />
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          {creating ? (
            <View style={[styles.createBox, { borderColor: c.border }]}>
              <View style={styles.emojiRow}>
                {EMOJIS.map((e, i) => (
                  <Pressable
                    key={e}
                    onPress={() => setEmojiIdx(i)}
                    style={[styles.emojiPick, emojiIdx === i && { borderColor: c.accent, backgroundColor: c.accentSoft }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Emoji ${e}`}
                    accessibilityState={{ selected: emojiIdx === i }}
                  >
                    <Text style={{ fontSize: 18 }}>{e}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Collection name (e.g. Love, Late Night)"
                placeholderTextColor={c.textTertiary}
                style={[styles.input, { color: c.textPrimary, borderColor: c.border }]}
                autoFocus
                accessibilityLabel="Collection name"
              />
              <View style={styles.createActions}>
                <Pressable
                  onPress={createAndAdd}
                  style={({ pressed }) => [styles.createBtn, { opacity: pressed ? 0.85 : 1, backgroundColor: c.accent }]}
                  accessibilityRole="button"
                  accessibilityLabel="Create collection and add quote"
                >
                  <Text style={styles.createBtnText}>Create & Add</Text>
                </Pressable>
                <Pressable
                  onPress={() => setCreating(false)}
                  style={{ padding: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel creating collection"
                >
                  <Text style={[styles.cancelText, { color: c.textSecondary }]}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setCreating(true)}
              style={({ pressed }) => [styles.newBtn, { borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Create a new collection"
            >
              <Ionicons name="add-circle-outline" size={18} color={c.accent} />
              <Text style={[styles.newBtnText, { color: c.accent }]}>New collection</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 30,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 18, fontFamily: "DMSans_700Bold" },
  empty: { fontSize: 13, fontFamily: "DMSans_400Regular", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, paddingVertical: 4 },
  colMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  colEmoji: { fontSize: 20 },
  colName: { fontSize: 15, fontFamily: "DMSans_600SemiBold" },
  colCount: { fontSize: 12, fontFamily: "DMSans_400Regular", marginTop: 1 },
  deleteBtn: { paddingLeft: 8, paddingVertical: 8 },
  createBox: { marginTop: 12, borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 },
  emojiRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  emojiPick: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
  },
  createActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  createBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  createBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: "DMSans_700Bold" },
  cancelText: { fontSize: 14, fontFamily: "DMSans_500Medium" },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  newBtnText: { fontSize: 14, fontFamily: "DMSans_600SemiBold" },
});