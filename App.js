// App.js
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import CropProtocolScreen from "./app/(tabs)/CropProtocolScreen.jsx";
import KnowledgeFeedScreen from "./app/(tabs)/KnowledgeFeedScreen.jsx";
import LanguageScreen from "./app/(tabs)/LanguageScreen.jsx";
import LowBandwidthScreen from "./app/(tabs)/LowBandwidthScreen.jsx";
import PDFReportScreen from "./app/(tabs)/PDFReportScreen.jsx";
import PestIdentificationScreen from "./app/(tabs)/PestIdentificationScreen.jsx";
import PestTimelineScreen from "./app/(tabs)/PestTimelineScreen.jsx";
import SoilAnalysisScreen from "./app/(tabs)/SoilAnalysisScreen.jsx";
import VoiceAssistantScreen from "./app/(tabs)/VoiceAssistantScreen.jsx";
import WeatherAdvisoryScreen from "./app/(tabs)/WeatherAdvisoryScreen.jsx";
import { Colors, Shadow, Spacing, Typography } from "./constants/theme";
import { LanguageProvider } from "./context/LanguageContext";
import AnalyzeScreen from "./screens/AnalyzeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import HomeScreen from "./screens/HomeScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import ResultScreen from "./screens/ResultScreen";
import SignInScreen from "./screens/SignInScreen";
import SplashScreen from "./screens/SplashScreen";
import TreatmentScreen from "./screens/TreatmentScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔬" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={KnowledgeFeedScreen}
        options={{
          tabBarLabel: "Feed",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📰" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
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

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <StatusBar style="light" />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerStyle: styles.header,
                headerTintColor: Colors.white,
                headerTitleStyle: styles.headerTitle,
                headerBackTitleVisible: false,
                headerShadowVisible: false,
              }}
            >
              {/* Onboarding Flow */}
              <Stack.Screen
                name="Splash"
                component={SplashScreen}
                options={{ headerShown: false }}
              />
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

              {/* Main App */}
              <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{ headerShown: false }}
              />

              {/* Feature Screens */}
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
