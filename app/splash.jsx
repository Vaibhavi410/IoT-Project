import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

/**
 * Splash Screen
 * - Dark green background
 * - Leaf logo emoji, app name, tagline
 * - Fade in on load
 * - Auto-navigate to onboarding after 2.5s
 */
export default function Splash() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const t = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(t);
  }, [fade, router]);

  return (
    <View style={styles.root}>
      <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.title}>Pestify</Text>
        <Text style={styles.tagline}>Smart Crop & Soil Health Assistant</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 72,
    marginBottom: 14,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

