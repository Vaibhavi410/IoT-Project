// screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { getScanHistory, formatTimestamp } from "../services/historyStorage";
import { Colors, Typography, Spacing, Radius, Shadow } from "../constants/theme";

const TIPS = [
  "Take photos in daylight for better accuracy",
  "Focus on the pest or damaged leaf area",
  "Include both healthy and affected plant parts",
  "Capture multiple angles if possible",
  "Early detection saves up to 30% crop yield",
];

export default function HomeScreen({ navigation }) {
  const [recentScans, setRecentScans] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  async function loadHistory() {
    const history = await getScanHistory();
    setRecentScans(history.slice(0, 4));
  }

  async function handleCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission",
        "Pestify needs camera access to photograph pests. Please enable it in your device settings.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.[0]) {
      navigation.navigate("Analyze", { imageAsset: result.assets[0] });
    }
  }

  async function handleGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Photo Access",
        "Pestify needs access to your photos to analyze pest images.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.[0]) {
      navigation.navigate("Analyze", { imageAsset: result.assets[0] });
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.appName}>Pestify</Text>
            <Text style={styles.tagline}>Protect your harvest with AI</Text>
          </View>
          <View style={styles.leafBadge}>
            <Text style={styles.leafEmoji}>🌿</Text>
          </View>
        </View>

        {/* Tip carousel */}
        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scan Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>IDENTIFY A PEST</Text>
          <View style={styles.scanButtons}>
            <TouchableOpacity
              style={[styles.scanBtn, styles.scanBtnPrimary]}
              onPress={handleCamera}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.scanBtnGradient}
              >
                <Text style={styles.scanBtnIcon}>📷</Text>
                <Text style={styles.scanBtnTitle}>Take Photo</Text>
                <Text style={styles.scanBtnSub}>Use camera</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scanBtn, styles.scanBtnSecondary]}
              onPress={handleGallery}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.accent, Colors.accentLight]}
                style={styles.scanBtnGradient}
              >
                <Text style={styles.scanBtnIcon}>🖼️</Text>
                <Text style={styles.scanBtnTitle}>From Gallery</Text>
                <Text style={styles.scanBtnSub}>Pick image</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard icon="🔍" label="Total Scans" value={recentScans.length > 0 ? "Active" : "0"} />
          <StatCard icon="🌾" label="Crops Protected" value="∞" />
          <StatCard icon="⚡" label="AI Speed" value="~5s" />
        </View>

        {/* Treatment Plan Feature */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.treatmentBtn}
            onPress={() => navigation.navigate("Treatment")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>💊</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>View Treatment Plan</Text>
              <Text style={styles.treatmentBtnSub}>Tiered organic to chemical treatments</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.treatmentBtn, { marginTop: Spacing.md }]}
            onPress={() => navigation.navigate("CropProtocol")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>🌾</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>Crop Protocol</Text>
              <Text style={styles.treatmentBtnSub}>Stages, risks, and prevention schedule</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.treatmentBtn, { marginTop: Spacing.md }]}
            onPress={() => navigation.navigate("WeatherAdvisory")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>🌦️</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>Weather Advisory</Text>
              <Text style={styles.treatmentBtnSub}>Pest risk forecast and spraying guidance</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>RECENT SCANS</Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            {recentScans.map((scan) => (
              <RecentScanCard
                key={scan.id}
                scan={scan}
                onPress={() =>
                  navigation.navigate("Result", {
                    result: scan.result,
                    imageUri: scan.imageUri,
                    fromHistory: true,
                  })
                }
              />
            ))}
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🧑‍🌾 How It Works</Text>
          <InfoStep number="1" text="Photograph the pest or damaged crop area" />
          <InfoStep number="2" text="AI analyzes the image in seconds" />
          <InfoStep number="3" text="Get pest ID, severity level, and treatment plans" />
          <InfoStep number="4" text="Apply organic or chemical treatments as needed" />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RecentScanCard({ scan, onPress }) {
  const { result, imageUri, timestamp } = scan;
  const isIdentified = result?.identified;

  return (
    <TouchableOpacity style={styles.recentCard} onPress={onPress} activeOpacity={0.8}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.recentImage} />
      ) : (
        <View style={[styles.recentImage, styles.recentImagePlaceholder]}>
          <Text style={{ fontSize: 24 }}>🌿</Text>
        </View>
      )}
      <View style={styles.recentInfo}>
        <Text style={styles.recentName} numberOfLines={1}>
          {isIdentified ? result.pestName : "Unidentified"}
        </Text>
        {isIdentified && (
          <Text style={styles.recentScientific} numberOfLines={1}>
            {result.scientificName}
          </Text>
        )}
        <View style={styles.recentMeta}>
          {isIdentified && (
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityBg(result.severity) },
              ]}
            >
              <Text style={[styles.severityText, { color: getSeverityColor(result.severity) }]}>
                {result.severity}
              </Text>
            </View>
          )}
          <Text style={styles.recentTime}>{formatTimestamp(timestamp)}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function InfoStep({ number, text }) {
  return (
    <View style={styles.infoStep}>
      <View style={styles.infoStepNum}>
        <Text style={styles.infoStepNumText}>{number}</Text>
      </View>
      <Text style={styles.infoStepText}>{text}</Text>
    </View>
  );
}

function getSeverityColor(severity) {
  const map = {
    Low: Colors.severityLow,
    Moderate: Colors.severityModerate,
    High: Colors.severityHigh,
    Critical: Colors.severityCritical,
  };
  return map[severity] || Colors.textMuted;
}

function getSeverityBg(severity) {
  const map = {
    Low: Colors.successBg,
    Moderate: Colors.warningBg,
    High: Colors.dangerBg,
    Critical: Colors.criticalBg,
  };
  return map[severity] || Colors.sand;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 24,
    paddingHorizontal: Spacing.xl,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.sizes.sm,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  leafBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  leafEmoji: { fontSize: 26 },

  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tipIcon: { fontSize: 14 },
  tipText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },

  section: { marginBottom: Spacing.xxl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },

  scanButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  scanBtn: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadow.md,
  },
  scanBtnGradient: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
    gap: Spacing.xs,
  },
  scanBtnIcon: { fontSize: 32 },
  scanBtnTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  scanBtnSub: {
    fontSize: Typography.sizes.xs,
    color: "rgba(255,255,255,0.75)",
  },

  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },

  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  recentImage: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryMuted,
  },
  recentImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  recentInfo: { flex: 1 },
  recentName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  recentScientific: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontStyle: "italic",
    marginTop: 1,
  },
  recentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  severityText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  recentTime: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  chevron: { fontSize: 20, color: Colors.textMuted },

  infoCard: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  infoTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  infoStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  infoStepNumText: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  infoStepText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  treatmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.md,
  },
  treatmentIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.severityLow + "1A", // transparent green
    alignItems: "center",
    justifyContent: "center",
  },
  treatmentBtnInfo: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
  treatmentBtnTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  treatmentBtnSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
