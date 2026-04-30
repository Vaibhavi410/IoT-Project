import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />

      {/* Keep these routes available but hidden from the tab bar */}
      <Tabs.Screen name="TreatmentScreen" options={{ title: 'Treatment', href: null }} />
      <Tabs.Screen name="CropProtocolScreen" options={{ title: 'Crop Protocol', href: null }} />
      <Tabs.Screen
        name="WeatherAdvisoryScreen"
        options={{ title: 'Weather Advisory', href: null }}
      />
      <Tabs.Screen name="PestTimelineScreen" options={{ title: 'Pest Timeline', href: null }} />
      <Tabs.Screen name="PDFReportScreen" options={{ title: 'PDF Reports', href: null }} />
      <Tabs.Screen name="LanguageScreen" options={{ title: 'Language', href: null }} />
      <Tabs.Screen name="VoiceAssistantScreen" options={{ title: 'Voice', href: null }} />
      <Tabs.Screen
        name="PestIdentificationScreen"
        options={{ title: 'Pest Identification', href: null }}
      />
    </Tabs>
  );
}
