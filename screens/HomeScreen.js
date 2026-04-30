// screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { getScanHistory, formatTimestamp } from "../services/historyStorage";
import { Colors, Typography, Spacing, Radius, Shadow } from "../constants/theme";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../context/LanguageContext";

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();
  const [recentScans, setRecentScans] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [langOpen, setLangOpen] = useState(false);

  const tips = useMemo(
    () => [t("tip_0"), t("tip_1"), t("tip_2"), t("tip_3"), t("tip_4")],
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  useEffect(() => {
    if (!tips.length) return undefined;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tips.length]);

  async function loadHistory() {
    const history = await getScanHistory();
    setRecentScans(history.slice(0, 4));
  }

  function handleComingSoon() {
    Alert.alert(t("coming_soon"));
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
          <View style={styles.headerTitleBlock}>
            <Text style={styles.appName}>{t("app_name")}</Text>
            <Text style={styles.tagline}>{t("scan_tagline")}</Text>
          </View>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLangOpen(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Language"
          >
            <Text style={styles.langBtnText}>🌐</Text>
          </TouchableOpacity>
          <View style={styles.leafBadge}>
            <Text style={styles.leafEmoji}>🌿</Text>
          </View>
        </View>

        {/* Tip carousel */}
        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>{tips[tipIndex]}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: AI Features */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI Features</Text>

          <TouchableOpacity
            style={styles.treatmentBtn}
            onPress={() => navigation.navigate("PestIdentification")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>📷</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>📷 Pest Identification</Text>
              <Text style={styles.treatmentBtnSub}>Take photo or upload to identify pests</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.treatmentBtn, { marginTop: Spacing.md }]}
            onPress={() => navigation.navigate("SoilAnalysis")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>🪱</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>🪱 Soil Analysis</Text>
              <Text style={styles.treatmentBtnSub}>Manual entry or IoT sensor readings</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="🔍"
            label={t("total_scans")}
            value={recentScans.length > 0 ? t("active") : "0"}
          />
          <StatCard icon="🌾" label={t("crops_protected")} value="∞" />
          <StatCard icon="⚡" label={t("ai_speed")} value="~5s" />
        </View>

        {/* Section 2: Treatment & Protocol */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Treatment & Protocol</Text>

          <TouchableOpacity
            style={styles.treatmentBtn}
            onPress={() => navigation.navigate("Treatment")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>💊</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>💊 Treatment Plan</Text>
              <Text style={styles.treatmentBtnSub}>{t("treatment_sub")}</Text>
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
              <Text style={styles.treatmentBtnTitle}>🌾 Crop Protocol</Text>
              <Text style={styles.treatmentBtnSub}>Stages, risks, and prevention schedule</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Monitoring */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Monitoring</Text>

          <TouchableOpacity
            style={styles.treatmentBtn}
            onPress={() => navigation.navigate("PestTimeline")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>📅</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>📅 Pest Timeline</Text>
              <Text style={styles.treatmentBtnSub}>Track pest activity on your farm over time</Text>
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
              <Text style={styles.treatmentBtnTitle}>🌦️ Weather Advisory</Text>
              <Text style={styles.treatmentBtnSub}>Pest risk forecast and spraying guidance</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section 4: Reports & Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reports & Tools</Text>

          <TouchableOpacity
            style={styles.treatmentBtn}
            onPress={() => navigation.navigate("PDFReport")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>📄</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>📄 PDF Reports</Text>
              <Text style={styles.treatmentBtnSub}>Auto-generate pest analysis PDF report</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.treatmentBtn, { marginTop: Spacing.md }]}
            onPress={() => navigation.navigate("Language")}
            activeOpacity={0.8}
          >
            <View style={styles.treatmentIconBox}>
              <Text style={{ fontSize: 24 }}>🌐</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>🌐 Language Support</Text>
              <Text style={styles.treatmentBtnSub}>Switch app language</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.treatmentBtn, { marginTop: Spacing.md }]}
            onPress={() => navigation.navigate("VoiceAssistant")}
            activeOpacity={0.8}
          >
            <View style={[styles.treatmentIconBox, { backgroundColor: Colors.successBg }]}>
              <Text style={{ fontSize: 24 }}>🎤</Text>
            </View>
            <View style={styles.treatmentBtnInfo}>
              <Text style={styles.treatmentBtnTitle}>🎤 Voice Assistant</Text>
              <Text style={styles.treatmentBtnSub}>{t("voice_assistant_sub")}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>{t("recent_scans")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text style={styles.seeAll}>{t("see_all")}</Text>
              </TouchableOpacity>
            </View>

            {recentScans.map((scan) => (
              <RecentScanCard
                key={scan.id}
                scan={scan}
                t={t}
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
          <Text style={styles.infoTitle}>🧑‍🌾 {t("how_it_works")}</Text>
          <InfoStep number="1" text={t("how_step_1")} />
          <InfoStep number="2" text={t("how_step_2")} />
          <InfoStep number="3" text={t("how_step_3")} />
          <InfoStep number="4" text={t("how_step_4")} />
        </View>

        <View style={{ height: 88 }} />
      </ScrollView>

      <LanguageSelector visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
}

/** Map API severity strings to translated labels. */
function severityLabel(sev, t) {
  if (!sev) return sev;
  const map = { Low: "low", Moderate: "moderate", High: "high", Critical: "critical" };
  const key = map[sev];
  return key ? t(key) : sev;
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

function RecentScanCard({ scan, onPress, t }) {
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
          {isIdentified ? result.pestName : t("unidentified")}
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
                {severityLabel(result.severity, t)}
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
  headerTitleBlock: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  langBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  langBtnText: {
    fontSize: 22,
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
  voiceFab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Platform.OS === "ios" ? 96 : 80,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.md,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  voiceFabEmoji: {
    fontSize: 28,
  },
});
