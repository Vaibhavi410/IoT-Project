// screens/SignInScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const pestifyLogo = require("../assets/images/pestify-logo-mark.png");

export default function SignInScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [nameStep, setNameStep] = useState(false);
  const [name, setName] = useState("");
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = () => {
    if (phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setCountdown(30);
    }, 1500);
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }
    setNameStep(true);
  };

  const handleEmailSignIn = () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNameStep(true);
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    setNameStep(true);
  };

  const handleStart = async () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    await AsyncStorage.setItem("user_name", name.trim());
    navigation.replace("Main");
  };

  if (nameStep) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Image source={pestifyLogo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Pestify</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.subtitle}>So we can personalize your experience</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
            <Text style={styles.primaryBtnText}>Start Using Pestify 🚀</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={pestifyLogo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Pestify</Text>
          <Text style={styles.headerSubtitle}>Smart Crop & Soil Health Assistant</Text>
        </View>

        <View style={styles.body}>
          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
            <Text style={styles.googleLogo}>G</Text>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "phone" && styles.tabActive]}
              onPress={() => { setActiveTab("phone"); setOtpSent(false); }}
            >
              <Text style={[styles.tabText, activeTab === "phone" && styles.tabTextActive]}>
                📱 Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "email" && styles.tabActive]}
              onPress={() => setActiveTab("email")}
            >
              <Text style={[styles.tabText, activeTab === "email" && styles.tabTextActive]}>
                📧 Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Phone Tab */}
          {activeTab === "phone" && !otpSent && (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="10-digit number"
                  keyboardType="numeric"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* OTP Input */}
          {activeTab === "phone" && otpSent && (
            <>
              <Text style={styles.label}>OTP sent to +91 {phone.slice(0, 6)}XXXX</Text>
              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpRefs.current[index] = ref)}
                    style={styles.otpBox}
                    maxLength={1}
                    keyboardType="numeric"
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                  />
                ))}
              </View>
              <TouchableOpacity
                onPress={() => { if (countdown === 0) setCountdown(30); }}
                disabled={countdown > 0}
              >
                <Text style={styles.resendText}>
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOTP}>
                <Text style={styles.primaryBtnText}>Verify & Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.backLink}>
                <Text style={styles.backLinkText}>← Change number</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="farmer@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                onPress={handleEmailSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sign In with Email</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink}>
                <Text style={styles.backLinkText}>Forgot password?</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#2E7D32",
    paddingTop: Platform.OS === "ios" ? 60 : 48,
    paddingBottom: 28,
    alignItems: "center",
  },
  headerLogo: { width: 72, height: 82, marginBottom: 8 },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#fff", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  body: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1B5E20", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#757575", marginBottom: 20 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    gap: 10,
    elevation: 1,
  },
  googleLogo: { fontSize: 20, fontWeight: "900", color: "#4285F4" },
  googleBtnText: { fontSize: 16, fontWeight: "600", color: "#333" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  dividerText: { color: "#9E9E9E", fontWeight: "600", fontSize: 13 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, padding: 10, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#2E7D32" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#555" },
  tabTextActive: { color: "#fff" },
  label: { fontSize: 13, fontWeight: "600", color: "#1B5E20", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#F1F8E9",
    color: "#1B5E20",
    marginBottom: 14,
  },
  phoneRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  countryCode: {
    backgroundColor: "#F1F8E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  countryCodeText: { fontSize: 15, color: "#1B5E20", fontWeight: "600" },
  primaryBtn: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  otpBox: {
    width: 44,
    height: 52,
    borderWidth: 2,
    borderColor: "#C8E6C9",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
    backgroundColor: "#F1F8E9",
  },
  resendText: {
    textAlign: "center",
    color: "#2E7D32",
    fontSize: 14,
    marginBottom: 16,
    fontWeight: "600",
  },
  backLink: { alignItems: "center", marginTop: 12 },
  backLinkText: { color: "#2E7D32", fontSize: 14, fontWeight: "600" },
  termsText: {
    textAlign: "center",
    color: "#9E9E9E",
    fontSize: 11,
    marginTop: 24,
    lineHeight: 16,
  },
});
