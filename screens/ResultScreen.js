// screens/ResultScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing, Radius, Shadow } from "../constants/theme";

export default function ResultScreen({ route, navigation }) {
  const { result, imageUri, fromHistory } = route.params;
  const [activeTab, setActiveTab] = useState("organic"); // 'organic' | 'chemical'
  const [expandedSections, setExpandedSections] = useState({ symptoms: true, treatments: true, prevention: false });

  function toggleSection(key) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleShare() {
    if (!result?.identified) return;
    try {
      await Share.share({
        message: `🌿 CropGuard AI Pest Identification\n\nPest: ${result.pestName} (${result.scientificName})\nSeverity: ${result.severity}\nCategory: ${result.category}\n\nFirst treatment: ${result.organicTreatments?.[0]?.name || "See app for treatments"}\n\nScanned with CropGuard AI`,
      });
    } catch {}
  }

  if (!result?.identified) {
    return <UnidentifiedScreen result={result} navigation={navigation} />;
  }

  const severityColor = getSeverityColor(result.severity);
  const severityBg = getSeverityBg(result.severity);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroCard}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
        )}
        <LinearGradient
          colors={["transparent", "rgba(10,30,10,0.9)"]}
          style={styles.heroGradient}
        >
          <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
            <Text style={[styles.severityBadgeText, { color: severityColor }]}>
              {getSeverityIcon(result.severity)} {result.severity} Severity
            </Text>
          </View>
          <Text style={styles.pestName}>{result.pestName}</Text>
          <Text style={styles.scientificName}>{result.scientificName}</Text>
        </LinearGradient>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <QuickStat icon="🎯" label="Confidence" value={`${result.confidence}%`} />
        <QuickStat icon="📂" label="Category" value={result.category?.split(" ")[0]} />
        <QuickStat icon="⚡" label="Spread Risk" value={result.spreadRisk} color={getSpreadColor(result.spreadRisk)} />
      </View>

      {/* Description */}
      <InfoCard icon="📋" title="About This Pest">
        <Text style={styles.descriptionText}>{result.description}</Text>
      </InfoCard>

      {/* Affected Crops */}
      {result.affectedCrops?.length > 0 && (
        <InfoCard icon="🌾" title="Commonly Affected Crops">
          <View style={styles.chipRow}>
            {result.affectedCrops.map((crop, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{crop}</Text>
              </View>
            ))}
          </View>
        </InfoCard>
      )}

      {/* Symptoms */}
      <CollapsibleCard
        icon="🔍"
        title="Symptoms to Look For"
        isOpen={expandedSections.symptoms}
        onToggle={() => toggleSection("symptoms")}
      >
        {result.symptoms?.map((symptom, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{symptom}</Text>
          </View>
        ))}
      </CollapsibleCard>

      {/* Treatments */}
      <CollapsibleCard
        icon="💊"
        title="Treatment Options"
        isOpen={expandedSections.treatments}
        onToggle={() => toggleSection("treatments")}
      >
        {/* Tab selector */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "organic" && styles.tabActive]}
            onPress={() => setActiveTab("organic")}
          >
            <Text style={[styles.tabText, activeTab === "organic" && styles.tabTextActive]}>
              🌱 Organic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "chemical" && styles.tabActive]}
            onPress={() => setActiveTab("chemical")}
          >
            <Text style={[styles.tabText, activeTab === "chemical" && styles.tabTextActive]}>
              ⚗️ Chemical
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "organic" &&
          result.organicTreatments?.map((treatment, i) => (
            <TreatmentCard key={i} treatment={treatment} type="organic" />
          ))}

        {activeTab === "chemical" &&
          result.chemicalTreatments?.map((treatment, i) => (
            <TreatmentCard key={i} treatment={treatment} type="chemical" />
          ))}
      </CollapsibleCard>

      {/* Best Time */}
      {result.bestTimeToTreat && (
        <InfoCard icon="🕐" title="Best Time to Treat">
          <Text style={styles.descriptionText}>{result.bestTimeToTreat}</Text>
        </InfoCard>
      )}

      {/* Prevention */}
      <CollapsibleCard
        icon="🛡️"
        title="Prevention Tips"
        isOpen={expandedSections.prevention}
        onToggle={() => toggleSection("prevention")}
      >
        {result.preventionTips?.map((tip, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>✓</Text>
            <Text style={styles.bulletText}>{tip}</Text>
          </View>
        ))}
      </CollapsibleCard>

      {/* Economic Impact */}
      {result.economicImpact && (
        <View style={styles.impactCard}>
          <Text style={styles.impactIcon}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.impactTitle}>Economic Impact</Text>
            <Text style={styles.impactText}>{result.economicImpact}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤 Share Result</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newScanBtn}
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.newScanBtnGradient}>
            <Text style={styles.newScanBtnText}>🔬 New Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        ⚠️ AI identification is advisory only. Consult a certified agronomist for critical decisions.
        Always follow local pesticide regulations.
      </Text>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function UnidentifiedScreen({ result, navigation }) {
  return (
    <View style={styles.unidentifiedContainer}>
      <View style={styles.unidentifiedCard}>
        <Text style={styles.unidentifiedEmoji}>🔍</Text>
        <Text style={styles.unidentifiedTitle}>Unable to Identify</Text>
        <Text style={styles.unidentifiedMessage}>{result?.message}</Text>
        {result?.suggestions?.map((s, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>→</Text>
            <Text style={styles.bulletText}>{s}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.analyzeBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.analyzeBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function QuickStat({ icon, label, value, color }) {
  return (
    <View style={styles.quickStat}>
      <Text style={styles.quickStatIcon}>{icon}</Text>
      <Text style={[styles.quickStatValue, color && { color }]}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.cardTitle}>
        {icon} {title}
      </Text>
      {children}
    </View>
  );
}

function CollapsibleCard({ icon, title, isOpen, onToggle, children }) {
  return (
    <View style={styles.infoCard}>
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.cardTitle}>
          {icon} {title}
        </Text>
        <Text style={styles.chevron}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
}

function TreatmentCard({ treatment, type }) {
  return (
    <View style={[styles.treatmentCard, type === "chemical" && styles.treatmentCardChem]}>
      <View style={styles.treatmentHeader}>
        <Text style={styles.treatmentName}>{treatment.name}</Text>
        <View style={[styles.effectBadge, { backgroundColor: getEffectBg(treatment.effectiveness) }]}>
          <Text style={[styles.effectText, { color: getEffectColor(treatment.effectiveness) }]}>
            {treatment.effectiveness}
          </Text>
        </View>
      </View>
      {treatment.dosage && (
        <Text style={styles.treatmentDosage}>📏 Dosage: {treatment.dosage}</Text>
      )}
      <Text style={styles.treatmentInstructions}>{treatment.instructions}</Text>
      {treatment.waitingPeriod && (
        <View style={styles.waitingPeriodRow}>
          <Text style={styles.waitingIcon}>⏱️</Text>
          <Text style={styles.waitingText}>Harvest waiting period: {treatment.waitingPeriod}</Text>
        </View>
      )}
    </View>
  );
}

// Helpers
function getSeverityColor(s) {
  return { Low: Colors.severityLow, Moderate: Colors.severityModerate, High: Colors.severityHigh, Critical: Colors.severityCritical }[s] || Colors.textMuted;
}
function getSeverityBg(s) {
  return { Low: Colors.successBg, Moderate: Colors.warningBg, High: Colors.dangerBg, Critical: Colors.criticalBg }[s] || Colors.sand;
}
function getSeverityIcon(s) {
  return { Low: "🟢", Moderate: "🟡", High: "🔴", Critical: "🟣" }[s] || "⚪";
}
function getSpreadColor(s) {
  return { Low: Colors.severityLow, Moderate: Colors.severityModerate, High: Colors.severityHigh }[s] || Colors.textMuted;
}
function getEffectColor(e) {
  return { High: Colors.severityLow, Moderate: Colors.severityModerate, Low: Colors.severityHigh }[e] || Colors.textMuted;
}
function getEffectBg(e) {
  return { High: Colors.successBg, Moderate: Colors.warningBg, Low: Colors.dangerBg }[e] || Colors.sand;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scrollContent: { paddingBottom: 24 },

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
    marginBottom: Spacing.sm,
  },
  severityBadgeText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  pestName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
  },
  scientificName: { fontSize: Typography.sizes.sm, color: "rgba(255,255,255,0.7)", fontStyle: "italic" },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickStat: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickStatIcon: { fontSize: 18, marginBottom: 4 },
  quickStatValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  quickStatLabel: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },

  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cardBody: { marginTop: Spacing.md },
  chevron: { fontSize: 12, color: Colors.textMuted },

  descriptionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: Typography.weights.medium },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bulletDot: { fontSize: Typography.sizes.md, color: Colors.primary, marginTop: 1 },
  bulletText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.sand,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: "center", borderRadius: Radius.sm - 2 },
  tabActive: { backgroundColor: Colors.white, ...Shadow.sm },
  tabText: { fontSize: Typography.sizes.sm, color: Colors.textMuted, fontWeight: Typography.weights.medium },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.weights.bold },

  treatmentCard: {
    backgroundColor: Colors.successBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  treatmentCardChem: {
    backgroundColor: Colors.warningBg,
    borderColor: "#ffe0b2",
  },
  treatmentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  treatmentName: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.textPrimary, flex: 1 },
  effectBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.round },
  effectText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },
  treatmentDosage: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  treatmentInstructions: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  waitingPeriodRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.08)" },
  waitingIcon: { fontSize: 14 },
  waitingText: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontStyle: "italic" },

  impactCard: {
    flexDirection: "row",
    backgroundColor: Colors.accentMuted,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#fce4b8",
  },
  impactIcon: { fontSize: 24 },
  impactTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: 4 },
  impactText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  actionRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  shareBtnText: { fontSize: Typography.sizes.md, color: Colors.textSecondary, fontWeight: Typography.weights.medium },
  newScanBtn: { flex: 1, borderRadius: Radius.lg, overflow: "hidden", ...Shadow.md },
  newScanBtnGradient: { paddingVertical: Spacing.md, alignItems: "center" },
  newScanBtnText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.white },

  disclaimer: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.xl,
    lineHeight: 18,
  },

  unidentifiedContainer: { flex: 1, backgroundColor: Colors.cream, justifyContent: "center", padding: Spacing.xxl },
  unidentifiedCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: "center", ...Shadow.lg },
  unidentifiedEmoji: { fontSize: 56, marginBottom: Spacing.lg },
  unidentifiedTitle: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  unidentifiedMessage: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, textAlign: "center", marginBottom: Spacing.xl, lineHeight: 22 },
  analyzeBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, marginTop: Spacing.lg },
  analyzeBtnText: { color: Colors.white, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.md },
});
