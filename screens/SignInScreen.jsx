import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeMode } from '../context/ThemeModeContext';

export default function SignInScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);

    setTimeout(async () => {
      await AsyncStorage.setItem("isLoggedIn", "true");
      setLoading(false);
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.title}>Sign In to Pestify</Text>
        <Text style={styles.subtitle}>Protecting farmers with AI</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.prefixBox}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            style={styles.phoneInput}
            placeholderTextColor="#8AA08A"
          />
        </View>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#8AA08A"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#8AA08A"
        />

        <TouchableOpacity
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.white} />
              <Text style={styles.signInButtonText}>Signing In...</Text>
            </View>
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.createButton} activeOpacity={0.85}>
          <Text style={styles.createButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.9}>
          <Text style={styles.googleText}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By signing in you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18,
    paddingTop: 62,
  },
  header: {
    alignItems: "center",
    marginBottom: 22,
  },
  logo: {
    fontSize: 42,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 8,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#577657",
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9E7D5",
    padding: 16,
  },
  label: {
    color: "#355B35",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  phoneRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  prefixBox: {
    width: 62,
    borderWidth: 1,
    borderColor: "#CCE0C7",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6FBF4",
    marginRight: 8,
  },
  prefixText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CCE0C7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#234A24",
    fontSize: 15,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DFE8DB",
  },
  orText: {
    marginHorizontal: 12,
    color: "#7A8F78",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCE0C7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#234A24",
    fontSize: 15,
    marginBottom: 12,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.88,
  },
  signInButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  createButton: {
    borderWidth: 1.4,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  googleButton: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#D7DDE3",
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  googleText: {
    color: "#EA4335",
    fontSize: 20,
    fontWeight: "900",
    marginRight: 10,
  },
  googleButtonText: {
    color: "#3C4043",
    fontWeight: "700",
    fontSize: 15,
  },
  footerText: {
    marginTop: 14,
    textAlign: "center",
    color: "#748A74",
    fontSize: 12,
    lineHeight: 18,
  },
});
