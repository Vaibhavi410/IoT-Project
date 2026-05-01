// screens/SplashScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Check if user already signed in
    setTimeout(async () => {
  try {
    // TEMP: force onboarding for testing
    await AsyncStorage.clear();
    navigation.replace("Onboarding");
  } catch {
    navigation.replace("Onboarding");
  }
}, 2500);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.appName}>Pestify</Text>
        <Text style={styles.tagline}>Smart Crop & Soil Health Assistant</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B5E20",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
