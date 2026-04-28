// screens/HistoryScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getScanHistory, deleteScanResult, clearHistory, formatTimestamp } from "../services/historyStorage";
import { Colors, Typography, Spacing, Radius, Shadow } from "../constants/theme";

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    setLoading(true);
    const data = await getScanHistory();
    setHistory(data);
    setLoading(false);
  }

  async function handleDelete(id) {
    Alert.alert("Delete Scan", "Remove this scan from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteScanResult(id);
          loadHistory();
        },
      },
    ]);
  }

  async function handleClearAll() {
    if (history.length === 0) return;
    Alert.alert("Clear All History", "This will permanently delete all scan records.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          await clearHistory();
          setHistory([]);
        },
      },
    ]);
  }

  function renderItem({ item }) {
    const { result, imageUri, timestamp, id } = item;
    const isIdentified = result?.identified;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("Result", {
            result,
            imageUri,
            fromHistory: true,
          })
        }
        onLongPress={() => handleDelete(id)}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={{ fontSize: 24 }}>🌿</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={1}>
            {isIdentified ? result.pestName : "Unidentified Pest"}
          </Text>
          {isIdentified && (
            <Text style={styles.cardScientific} numberOfLines={1}>
              {result.scientificName}
            </Text>
          )}
          <View style={styles.cardMeta}>
            {isIdentified && (
              <View style={[styles.badge, { backgroundColor: getSeverityBg(result.severity) }]}>
                <Text style={[styles.badgeText, { color: getSeverityColor(result.severity) }]}>
                  {result.severity}
                </Text>
              </View>
            )}
            {isIdentified && (
              <View style={[styles.badge, { backgroundColor: Colors.primaryMuted }]}>
                <Text style={[styles.badgeText, { color: Colors.primary }]}>
                  {result.category?.split(" ")[0]}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTime}>{formatTimestamp(timestamp)}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {history.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={styles.countText}>{history.length} scan{history.length !== 1 ? "s" : ""}</Text>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={history.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.emptyText}>Loading history...</Text>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No Scans Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your pest identification history will appear here after your first scan.
              </Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.startBtnText}>Start Scanning →</Text>
              </TouchableOpacity>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function getSeverityColor(s) {
  return { Low: Colors.severityLow, Moderate: Colors.severityModerate, High: Colors.severityHigh, Critical: Colors.severityCritical }[s] || Colors.textMuted;
}
function getSeverityBg(s) {
  return { Low: Colors.successBg, Moderate: Colors.warningBg, High: Colors.dangerBg, Critical: Colors.criticalBg }[s] || Colors.sand;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  countText: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  clearAll: { fontSize: Typography.sizes.sm, color: Colors.danger, fontWeight: Typography.weights.semibold },

  listContent: { padding: Spacing.xl, gap: Spacing.sm },

  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    gap: Spacing.md,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryMuted,
  },
  cardImagePlaceholder: { alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1 },
  cardName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  cardScientific: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontStyle: "italic",
    marginTop: 2,
  },
  cardMeta: { flexDirection: "row", gap: Spacing.xs, marginTop: 6, flexWrap: "wrap" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  badgeText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  cardTime: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 4 },
  deleteBtn: { padding: Spacing.xs },
  deleteBtnText: { fontSize: 18 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxl,
    minHeight: 400,
  },
  emptyCard: { alignItems: "center", gap: Spacing.md },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyText: { textAlign: "center", color: Colors.textMuted, marginTop: 40 },
  startBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  startBtnText: { color: Colors.white, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.md },
});
