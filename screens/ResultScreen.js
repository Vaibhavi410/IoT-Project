// screens/ResultScreen.js
import React, { useMemo, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing, Radius, Shadow } from "../constants/theme";
import { saveScanResult } from "../services/historyStorage";

export default function ResultScreen({ route, navigation }) {
  const { result, imageUri } = route.params || {};
  const [saved, setSaved] = useState(false);

  async function handleShare() {
    try {
      if (!result) return;
      await Share.share({
        message: `🌿 Pestify - Crop Scan Result\n\nPest: ${result.pestName}\nConfidence: ${result.confidence}%\nSeverity: ${result.severityLevel}\nCrop: ${result.cropAffected}\nLocation: ${result.location}\n\nOrganic: ${result.treatment?.organic || "-"}\nChemical: ${result.treatment?.chemical || "-"}\nPrevention: ${result.treatment?.prevention || "-"}\n\nScan date: ${result.scanDate}`,
      });
    } catch {}
  }

  const confidence = Number(result?.confidence ?? 0);
  const severity = String(result?.severityLevel || "");

  const confidenceColor = useMemo(() => {
    if (confidence > 80) return Colors.severityLow;
    if (confidence >= 60) return Colors.severityModerate;
    return Colors.severityHigh;
  }, [confidence]);

  const severityBadge = useMemo(() => {
    if (severity === "Severe") return { bg: Colors.dangerBg, fg: Colors.danger };
    if (severity === "Moderate") return { bg: Colors.warningBg, fg: Colors.warning };
    return { bg: Colors.successBg, fg: Colors.success };
  }, [severity]);

  async function handleSave() {
    try {
      if (!result) return;
      await saveScanResult(imageUri || "", result);
      setSaved(true);
      Alert.alert("Saved", "Scan saved to History.");
    } catch {
      Alert.alert("Error", "Could not save scan.");
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" /> : null}
        <LinearGradient colors={["transparent", "rgba(10,30,10,0.9)"]} style={styles.heroGradient}>
          <Text style={styles.pestName}>{result?.pestName || "Unknown"}</Text>
          <View style={[styles.severityBadge, { backgroundColor: severityBadge.bg }]}>
            <Text style={[styles.severityBadgeText, { color: severityBadge.fg }]}>
              {severity || "Mild"}
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidence</Text>
        <View style={styles.confBarTrack}>
          <View style={[styles.confBarFill, { width: `${Math.max(0, Math.min(100, confidence))}%`, backgroundColor: confidenceColor }]} />
        </View>
        <Text style={styles.confValue}>{confidence}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crop Affected</Text>
        <Text style={styles.valueText}>{result?.cropAffected || "-"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 3 Predictions</Text>
        {(result?.top3Predictions || []).map((p, idx) => (
          <View key={`${p.name}-${idx}`} style={styles.predRow}>
            <Text style={styles.predName}>{idx + 1}. {p.name}</Text>
            <Text style={styles.predConf}>{p.confidence}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Treatment Plan</Text>
        <TreatmentCard title="Organic" colorBg={Colors.successBg} colorBorder={"#c8e6c9"} emoji="🌱" text={result?.treatment?.organic} />
        <TreatmentCard title="Chemical" colorBg={Colors.warningBg} colorBorder={"#ffe0b2"} emoji="⚗️" text={result?.treatment?.chemical} />
        <TreatmentCard title="Prevention" colorBg={"#E3F2FD"} colorBorder={"#C9E0F8"} emoji="🛡️" text={result?.treatment?.prevention} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scan Date</Text>
        <Text style={styles.valueText}>{result?.scanDate ? new Date(result.scanDate).toLocaleString() : "-"}</Text>
      </View>

      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={[styles.primaryBtn, saved && { opacity: 0.75 }]}
          onPress={handleSave}
          disabled={saved}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.primaryBtnGradient}>
            <Text style={styles.primaryBtnText}>💾 Save to History</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>📤 Share Result</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function TreatmentCard({ title, emoji, text, colorBg, colorBorder }) {
  return (
    <View style={[styles.treatCard, { backgroundColor: colorBg, borderColor: colorBorder }]}>
      <Text style={styles.treatTitle}>{emoji} {title}</Text>
      <Text style={styles.treatText}>{text || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scrollContent: { paddingBottom: 28 },

  heroCard: {
    height: 260,
    backgroundColor: Colors.primaryDark,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: Spacing.xl,
  },
  severityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.round,
    marginTop: Spacing.sm,
  },
  severityBadgeText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  pestName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
  },

  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  valueText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  confBarTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.sand,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  confBarFill: { height: "100%", borderRadius: 6 },
  confValue: { marginTop: Spacing.sm, fontWeight: Typography.weights.bold, color: Colors.textSecondary },

  predRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  predName: { flex: 1, color: Colors.textSecondary, fontSize: Typography.sizes.sm, paddingRight: 8 },
  predConf: { color: Colors.textPrimary, fontWeight: Typography.weights.bold },

  treatCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  treatTitle: { fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: 6 },
  treatText: { color: Colors.textSecondary, lineHeight: 20 },

  actionColumn: { paddingHorizontal: Spacing.xl, marginTop: Spacing.md, gap: Spacing.md, paddingBottom: 24 },
  primaryBtn: { borderRadius: Radius.lg, overflow: "hidden", ...Shadow.md },
  primaryBtnGradient: { paddingVertical: Spacing.lg, alignItems: "center" },
  primaryBtnText: { color: Colors.white, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.md },
  secondaryBtn: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  secondaryBtnText: { color: Colors.textSecondary, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.md },
});
