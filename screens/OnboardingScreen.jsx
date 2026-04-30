import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeMode } from '../context/ThemeModeContext';
import { useThemeMode } from "../context/ThemeModeContext";

const SLIDES = [
  {
    emoji: "🌾",
    title: "Welcome to Pestify",
    subtitle:
      "AI-powered pest detection to protect\nyour crops and maximize yield",
  },
  {
    emoji: "📷",
    title: "Scan & Identify Pests",
    subtitle:
      "Just take a photo of your crop.\nOur AI identifies pests in seconds",
  },
  {
    emoji: "💊",
    title: "Get Treatment Plans",
    subtitle:
      "Receive organic to chemical treatment\nrecommendations tailored to your crop",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { isDarkMode } = useThemeMode();
  const isLast = activeIndex === SLIDES.length - 1;
  const slide = SLIDES[activeIndex];

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.replace("SignIn");
  };

  const handleNext = () => {
    if (isLast) {
      finishOnboarding();
      return;
    }
    setActiveIndex((current) => current + 1);
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#0B1A0B", "#163D18", "#1F5123"] : ["#1B5E20", COLORS.primary, "#4CAF50"]}
      style={styles.container}
    >`r`n      <View style={styles.content}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.dotsRow}>
          {SLIDES.map((item, index) => (
            <View
              key={item.title}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={finishOnboarding} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextText}>{isLast ? "Get Started" : "Next"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 26,
  },
  emoji: {
    fontSize: 86,
    marginBottom: 18,
  },
  title: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
    marginTop: 14,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 22,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  skipText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "700",
  },
  nextButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  nextText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
  },
});

