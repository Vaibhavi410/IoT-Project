// App.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./screens/HomeScreen";
import AnalyzeScreen from "./screens/AnalyzeScreen";
import ResultScreen from "./screens/ResultScreen";
import HistoryScreen from "./screens/HistoryScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import SignInScreen from "./screens/SignInScreen";
import TreatmentScreen from "./screens/TreatmentScreen";
import CropProtocolScreen from "./app/(tabs)/CropProtocolScreen.jsx";
import WeatherAdvisoryScreen from "./app/(tabs)/WeatherAdvisoryScreen.jsx";
import LanguageScreen from "./app/(tabs)/LanguageScreen.jsx";
import VoiceAssistantScreen from "./app/(tabs)/VoiceAssistantScreen.jsx";
import PestTimelineScreen from "./app/(tabs)/PestTimelineScreen.jsx";
import PDFReportScreen from "./app/(tabs)/PDFReportScreen.jsx";
import PestIdentificationScreen from "./app/(tabs)/PestIdentificationScreen.jsx";
import SoilAnalysisScreen from "./app/(tabs)/SoilAnalysisScreen.jsx";
import KnowledgeFeedScreen from "./app/(tabs)/KnowledgeFeedScreen.jsx";
import LowBandwidthScreen from "./app/(tabs)/LowBandwidthScreen.jsx";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useThemeMode } from "./context/ThemeModeContext";
import { Colors, Typography, Spacing, Shadow } from "./constants/theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { COLORS: modeColors } = useThemeMode();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: modeColors.tabBar }],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Scan",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔬" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={KnowledgeFeedScreen}
        options={{
          tabBarLabel: "Feed",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={"\uD83D\uDCF0"} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ emoji, focused }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </View>
  );
}

function AppContainer() {
  const { isDarkMode, toggleTheme, COLORS, themeReady } = useTheme();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    async function bootstrapApp() {
      setInitialRoute("Onboarding");
    }

    bootstrapApp();
  }, []);

  if (!initialRoute || !themeReady) {
    return (
      <GestureHandlerRootView style={[styles.root, isDarkMode && styles.rootDark]}>
        <SafeAreaProvider>
          <View style={styles.bootContainer}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.root, isDarkMode && styles.rootDark]}>
      <SafeAreaProvider>
        <LanguageProvider>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          <View style={styles.navWrap}>
            <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
              <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                  headerStyle: styles.header,
                  headerTintColor: Colors.white,
                  headerTitleStyle: styles.headerTitle,
                  headerBackTitleVisible: false,
                  headerShadowVisible: false,
                  cardStyle: { backgroundColor: isDarkMode ? "#0E1510" : Colors.cream },
                }}
              >
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Analyze"
                component={AnalyzeScreen}
                options={({ navigation }) => ({
                  title: "Analyze Image",
                  headerLeft: () => (
                    <TouchableOpacity
                      onPress={() => navigation.goBack()}
                      style={styles.backBtn}
                    >
                      <Text style={styles.backBtnText}>‹ Back</Text>
                    </TouchableOpacity>
                  ),
                })}
              />

              <Stack.Screen
                name="Result"
                component={ResultScreen}
                options={({ navigation, route }) => ({
                  title: "Pest Identified",
                  headerLeft: () => (
                    <TouchableOpacity
                      onPress={() => {
                        if (route.params?.fromHistory) {
                          navigation.goBack();
                        } else {
                          navigation.navigate("Main");
                        }
                      }}
                      style={styles.backBtn}
                    >
                      <Text style={styles.backBtnText}>
                        ‹ {route.params?.fromHistory ? "Back" : "Home"}
                      </Text>
                    </TouchableOpacity>
                  ),
                })}
              />

              <Stack.Screen name="Treatment" component={TreatmentScreen} />

              <Stack.Screen
                name="PestIdentification"
                component={PestIdentificationScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="SoilAnalysis"
                component={SoilAnalysisScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="VoiceAssistant"
                component={VoiceAssistantScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Language"
                component={LanguageScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="PestTimeline"
                component={PestTimelineScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="PDFReport"
                component={PDFReportScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="CropProtocol"
                component={CropProtocolScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="WeatherAdvisory"
                component={WeatherAdvisoryScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="KnowledgeFeed"
                component={KnowledgeFeedScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="LowBandwidth"
                component={LowBandwidthScreen}
                options={{ headerShown: false }}
              />
              </Stack.Navigator>
            </NavigationContainer>

            <TouchableOpacity
              style={styles.themeToggle}
              onPress={toggleTheme}
              activeOpacity={0.9}
            >
              <Text style={styles.themeToggleText}>{isDarkMode ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>
          </View>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <ThemeProvider>
        <AppContainer />
      </ThemeProvider>
    </ThemeModeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  rootDark: {
    backgroundColor: "#0E1510",
  },
  navWrap: {
    flex: 1,
  },
  bootContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cream,
  },
  header: {
    backgroundColor: Colors.primaryDark,
    elevation: 0,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  backBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtnText: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
    ...Shadow.sm,
  },
  tabLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabIconActive: {
    backgroundColor: Colors.primaryMuted,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 16,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(46,125,50,0.9)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 8,
  },
  themeToggleText: {
    fontSize: 20,
  },
});
