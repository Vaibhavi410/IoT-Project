import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { analyzePest } from "../services/pestAnalysis";
import { Colors, Radius, Shadow, Spacing, Typography } from "../constants/theme";

export default function AnalyzeScreen({ navigation }) {
  const [asset, setAsset] = useState(null); // { uri, base64 }
  const [cropType, setCropType] = useState("");
  const [location, setLocation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const imageUri = asset?.uri || null;
  const imageBase64 = asset?.base64 || null;

  const canAnalyze = useMemo(() => {
    return !!imageBase64 && cropType.trim().length > 0 && location.trim().length > 0 && !isAnalyzing;
  }, [imageBase64, cropType, location, isAnalyzing]);

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Camera permission required", "Please allow camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAsset({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
    }
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Gallery permission required", "Please allow gallery access to upload an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAsset({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
    }
  }

  async function handleAnalyze() {
    if (!imageBase64) {
      Alert.alert("Upload image", "Please upload a clear crop image first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzePest(imageBase64, cropType.trim(), location.trim());
      if (!result || result.error) {
        Alert.alert("Error", "Analysis failed. Please try again.");
        return;
      }
      navigation.navigate("Result", {
        result,
        imageUri,
        fromHistory: false,
      });
    } catch (e) {
      Alert.alert("Error", "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
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
        <View style={styles.card}>
          <Text style={styles.title}>Crop Image</Text>

          <View style={styles.previewFrame}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewPlaceholderText}>No image selected</Text>
              </View>
            )}
          </View>

          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={pickFromCamera} disabled={isAnalyzing}>
              <Text style={styles.pickBtnText}>📷 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={pickFromGallery} disabled={isAnalyzing}>
              <Text style={styles.pickBtnText}>🖼️ Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Crop Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Crop type (e.g., Tomato)"
            placeholderTextColor={Colors.textMuted}
            value={cropType}
            onChangeText={setCropType}
            editable={!isAnalyzing}
          />
          <TextInput
            style={[styles.input, { marginTop: Spacing.md }]}
            placeholder="Location (e.g., Pune, Maharashtra)"
            placeholderTextColor={Colors.textMuted}
            value={location}
            onChangeText={setLocation}
            editable={!isAnalyzing}
          />
        </View>

        {isAnalyzing && (
          <View style={[styles.card, styles.loadingCard]}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>AI analyzing your crop...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={!canAnalyze}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            style={styles.analyzeBtnGradient}
          >
            <Text style={styles.analyzeBtnText}>🔬 Analyze Pest</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scrollContent: { padding: Spacing.xl, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadow.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  previewFrame: {
    height: 260,
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewImage: { width: "100%", height: "100%" },
  previewPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewPlaceholderText: { color: Colors.textMuted, fontWeight: Typography.weights.semibold },

  pickRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg },
  pickBtn: {
    flex: 1,
    backgroundColor: Colors.sand,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickBtnText: { fontWeight: Typography.weights.bold, color: Colors.textSecondary },

  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
  },

  loadingCard: { alignItems: "center" },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },

  analyzeBtn: { borderRadius: Radius.lg, overflow: "hidden", ...Shadow.md },
  analyzeBtnDisabled: { opacity: 0.55 },
  analyzeBtnGradient: { paddingVertical: Spacing.lg, alignItems: "center" },
  analyzeBtnText: { color: Colors.white, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
});
