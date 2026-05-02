// screens/SplashScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

const pestifyLogo = require("../assets/images/pestify-logo-mark.png");

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
        <Image source={pestifyLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>Pestify</Text>
        <Text style={styles.tagline}>Smart Crop & Soil Health Assistant</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 132,
    height: 148,
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#1B5E20",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: "#4A7C4A",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
