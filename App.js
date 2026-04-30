// App.js
import React from "react";
import { Platform, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./screens/HomeScreen";
import AnalyzeScreen from "./screens/AnalyzeScreen";
import ResultScreen from "./screens/ResultScreen";
import HistoryScreen from "./screens/HistoryScreen";
import TreatmentScreen from "./screens/TreatmentScreen";
 feature/WeatherAdvisory
import CropProtocolScreen from "./app/(tabs)/CropProtocolScreen.jsx";
import WeatherAdvisoryScreen from "./app/(tabs)/WeatherAdvisoryScreen.jsx";

 feature/VoiceAssistant
import LanguageScreen from "./app/(tabs)/LanguageScreen.jsx";
import VoiceAssistantScreen from "./app/(tabs)/VoiceAssistantScreen.jsx";
import { LanguageProvider } from "./context/LanguageContext";

 feature/PDFReports
import PestTimelineScreen from "./app/(tabs)/PestTimelineScreen.jsx";
import PDFReportScreen from "./app/(tabs)/PDFReportScreen.jsx";
import CropProtocolScreen from "./app/(tabs)/CropProtocolScreen.jsx";
 main
main
 main
import { Colors, Typography, Spacing, Shadow } from "./constants/theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigation (Home + History)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
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

// Root Stack (includes modal screens)
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: styles.header,
              headerTintColor: Colors.white,
              headerTitleStyle: styles.headerTitle,
              headerBackTitleVisible: false,
              headerShadowVisible: false,
            }}
          >
            {/* Main Tab Navigator */}
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />

            {/* Analyze Screen */}
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

            {/* Result Screen */}
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
                    <Text style={styles.backBtnText}>‹ {route.params?.fromHistory ? "Back" : "Home"}</Text>
                  </TouchableOpacity>
                ),
                headerRight: () => null,
              })}
            />

            {/* Treatment: title + back use t() via screen useLayoutEffect */}
            <Stack.Screen name="Treatment" component={TreatmentScreen} />

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
 feature/PDFReports
              name="PestTimeline"
              component={PestTimelineScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="PDFReport"
              component={PDFReportScreen}

              name="CropProtocol"
              component={CropProtocolScreen}
 main
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
          </Stack.Navigator>
        </NavigationContainer>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
});
