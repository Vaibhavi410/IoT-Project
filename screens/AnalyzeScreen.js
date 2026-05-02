// screens/AnalyzeScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { analyzePestImage } from "../services/pestAnalysis";
import { saveScanResult, saveScanResultRemote } from "../services/historyStorage";
import { Colors, Typography, Spacing, Radius, Shadow } from "../constants/theme";

const LOADING_MESSAGES = [
  "Examining crop image...",
  "Identifying pest characteristics...",
  "Cross-referencing pest database...",
  "Analyzing damage patterns...",
  "Generating treatment plan...",
];

export default function AnalyzeScreen({ route, navigation }) {
  const { imageAsset } = route.params;
  const [context, setContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadingInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (loadingInterval.current) clearInterval(loadingInterval.current);
    };
  }, []);

  function startPulse() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }

  function stopPulse() {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }

  async function handleAnalyze() {
    setError(null);
    setIsAnalyzing(true);
    setLoadingMsgIndex(0);
    startPulse();

    // Cycle through loading messages
    loadingInterval.current = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageAsset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mimeType = imageAsset.mimeType || "image/jpeg";
      const result = await analyzePestImage(base64, mimeType, context.trim());

      // Save to history (local) and try remote save in background
      await saveScanResult(imageAsset.uri, result);
      saveScanResultRemote(imageAsset.uri, result).catch(() => {});

      // Navigate to result
      navigation.replace("Result", {
        result,
        imageUri: imageAsset.uri,
        fromHistory: false,
      });
    } catch (err) {
      stopPulse();
      setIsAnalyzing(false);

      if (err.message === "API_KEY_MISSING") {
        setError(
          "API key not configured. Please add your Anthropic API key in services/pestAnalysis.js"
        );
      } else {
        setError(err.message || "Analysis failed. Please try again.");
      }
    } finally {
      if (loadingInterval.current) {
        clearInterval(loadingInterval.current);
        loadingInterval.current = null;
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Preview */}
        <Animated.View
          style={[styles.imageContainer, { transform: [{ scale: pulseAnim }] }]}
        >
          <Image source={{ uri: imageAsset.uri }} style={styles.image} resizeMode="cover" />
          {isAnalyzing && (
            <View style={styles.scanOverlay}>
              <LinearGradient
                colors={["transparent", "rgba(26,58,26,0.7)"]}
                style={styles.scanGradient}
              >
                <Text style={styles.scanOverlayText}>🔍 Analyzing...</Text>
              </LinearGradient>
            </View>
          )}
        </Animated.View>

        {/* Loading State */}
        {isAnalyzing && (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingMessage}>{LOADING_MESSAGES[loadingMsgIndex]}</Text>
            <View style={styles.loadingDots}>
              <LoadingDot delay={0} />
              <LoadingDot delay={200} />
              <LoadingDot delay={400} />
            </View>
            <Text style={styles.loadingHint}>
              Pestify AI is examining your crop image for pest identification
            </Text>
          </View>
        )}

        {/* Context Input */}
        {!isAnalyzing && (
          <>
            <View style={styles.contextSection}>
              <Text style={styles.contextLabel}>Additional Context (Optional)</Text>
              <TextInput
                style={styles.contextInput}
                placeholder="e.g., Rice crop in Maharashtra, monsoon season, 3 weeks old infestation..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                value={context}
                onChangeText={setContext}
                textAlignVertical="top"
              />
              <Text style={styles.contextHint}>
                Providing crop type and location improves accuracy
              </Text>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorCard}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Analyze Button */}
            <TouchableOpacity
              style={styles.analyzeBtn}
              onPress={handleAnalyze}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.analyzeBtnGradient}
              >
                <Text style={styles.analyzeBtnText}>🔬 Identify Pest</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retakeBtnText}>↩ Use Different Image</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LoadingDot({ delay }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }] }]}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scrollContent: { padding: Spacing.xl },

  imageContainer: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
    ...Shadow.lg,
  },
  image: {
    width: "100%",
    height: 280,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  scanGradient: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  scanOverlayText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },

  loadingCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: "center",
    ...Shadow.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
  },
  loadingMessage: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  loadingDots: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  loadingHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },

  contextSection: { marginBottom: Spacing.xl },
  contextLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  contextInput: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    minHeight: 80,
    ...Shadow.sm,
  },
  contextHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.dangerBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorIcon: { fontSize: 18 },
  errorText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.danger,
    lineHeight: 20,
  },

  analyzeBtn: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  analyzeBtnGradient: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  analyzeBtnText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },

  retakeBtn: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  retakeBtnText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
});
