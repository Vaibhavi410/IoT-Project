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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="TreatmentScreen"
        options={{
          title: 'Treatment',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cross.fill" color={color} />,
        }}
      />
      <Tabs.Screen
feature/WeatherAdvisory
        name="CropProtocolScreen"
        options={{
          title: 'Crop Protocol',

 feature/VoiceAssistant
        name="LanguageScreen"
        options={{
          title: 'Language',

 feature/PDFReports
        name="PestTimelineScreen"
        options={{
          title: 'Pest Timeline',
 main
 main
          href: null,
        }}
      />
      <Tabs.Screen
feature/WeatherAdvisory
        name="WeatherAdvisoryScreen"
        options={{
          title: 'Weather Advisory',

 feature/VoiceAssistant
        name="VoiceAssistantScreen"
        options={{
          title: 'Voice',

        name="PDFReportScreen"
        options={{
          title: 'PDF Reports',

        name="CropProtocolScreen"
        options={{
          title: 'Crop Protocol',
 main
 main
 main
          href: null,
        }}
      />
    </Tabs>
  );
}
