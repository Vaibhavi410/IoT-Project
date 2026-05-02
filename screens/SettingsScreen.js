// screens/SettingsScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../context/LanguageContext";

export default function SettingsScreen({ navigation }) {
  const { t, languageCode } = useLanguage();
  const [userName, setUserName] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("user_name").then((name) => {
      if (name) setUserName(name);
    });
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.replace("Splash");
        },
      },
    ]);
  };

  const LANGUAGE_NAMES = {
    english: "English",
    hindi: "हिंदी",
    marathi: "मराठी",
    telugu: "తెలుగు",
    tamil: "தமிழ்",
    kannada: "ಕನ್ನಡ",
    bengali: "বাংলা",
    gujarati: "ગુજરાતી",
    punjabi: "ਪੰਜਾਬੀ",
    urdu: "اردو",
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFILE</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName ? userName[0].toUpperCase() : "👤"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName || "Farmer"}</Text>
              <Text style={styles.profileSub}>Pestify User</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>

          {/* Language */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setLangOpen(true)}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#E3F2FD" }]}
              >
                <Text style={styles.settingEmoji}>🌐</Text>
              </View>
              <View>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingValue}>
                  {LANGUAGE_NAMES[languageCode] || "English"}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#FFF8E1" }]}
              >
                <Text style={styles.settingEmoji}>🔔</Text>
              </View>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#CCC", true: "#2E7D32" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.divider} />

          {/* Low Bandwidth */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#F3E5F5" }]}
              >
                <Text style={styles.settingEmoji}>📶</Text>
              </View>
              <View>
                <Text style={styles.settingLabel}>Low Bandwidth Mode</Text>
                <Text style={styles.settingValue}>For 2G / slow networks</Text>
              </View>
            </View>
            <Switch
              value={lowBandwidth}
              onValueChange={setLowBandwidth}
              trackColor={{ false: "#CCC", true: "#2E7D32" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* App Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEATURES</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate("LowBandwidth")}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Text style={styles.settingEmoji}>📡</Text>
              </View>
              <Text style={styles.settingLabel}>Low Bandwidth Settings</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate("VoiceAssistant")}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Text style={styles.settingEmoji}>🎤</Text>
              </View>
              <Text style={styles.settingLabel}>Voice Assistant</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Text style={styles.settingEmoji}>📱</Text>
              </View>
              <Text style={styles.settingLabel}>App Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Text style={styles.settingEmoji}>📋</Text>
              </View>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Text style={styles.settingEmoji}>📄</Text>
              </View>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>🚪 Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <LanguageSelector visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2E7D32",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: { padding: 8 },
  backText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  scrollContent: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9E9E9E",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "#2E7D32" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: "bold", color: "#1B5E20" },
  profileSub: { fontSize: 13, color: "#9E9E9E", marginTop: 2 },
  editBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editBtnText: { color: "#2E7D32", fontWeight: "700", fontSize: 13 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingEmoji: { fontSize: 20 },
  settingLabel: { fontSize: 15, fontWeight: "600", color: "#1B5E20" },
  settingValue: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  chevron: { fontSize: 22, color: "#9E9E9E" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginLeft: 68 },
  signOutBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    marginTop: 8,
  },
  signOutText: { color: "#E53935", fontSize: 16, fontWeight: "bold" },
});
