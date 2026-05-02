import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [confirmation, setConfirmation] = useState(null);
  const [firebaseIdToken, setFirebaseIdToken] = useState(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    const sanitizedPhone = phone.replace(/\D/g, "");
    if (sanitizedPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const confirm = await auth().signInWithPhoneNumber("+91" + sanitizedPhone);
      setConfirmation(confirm);
      setOtpSent(true);
      setCountdown(30);
    } catch (_error) {
      alert(_error.message);
      setOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const sanitized = String(text).replace(/\D/g, '');
    const newOtp = [...otp];
    // Handle paste of multiple digits
    if (sanitized.length > 1) {
      for (let i = 0; i < sanitized.length && index + i < 6; i++) {
        newOtp[index + i] = sanitized[i];
      }
      setOtp(newOtp);
      const next = Math.min(5, index + sanitized.length);
      otpRefs.current[next]?.focus();
      return;
    }

    newOtp[index] = sanitized;
    setOtp(newOtp);
    if (sanitized && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      if (!confirmation) {
        alert('OTP session expired. Please request a new code.');
        setOtpSent(false);
        setLoading(false);
        return;
      }
      const result = await confirmation.confirm(enteredOtp);
      // obtain Firebase ID token to exchange with backend later
      try {
        const idToken = await result.user.getIdToken();
        setFirebaseIdToken(idToken);
      } catch (e) {
        console.warn('Failed to read Firebase ID token', e);
      }
      setNameStep(true);
    } catch (_error) {
      alert("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      try {
        const idToken = await userCredential.user.getIdToken();
        setFirebaseIdToken(idToken);
      } catch (e) {
        console.warn('Failed to get Firebase ID token for email sign-in', e);
      }
      setNameStep(true);
    } catch (_error) {
      if (_error.code === "auth/user-not-found") {
        try {
          const createCred = await auth().createUserWithEmailAndPassword(email, password);
          try {
            const idToken = await createCred.user.getIdToken();
            setFirebaseIdToken(idToken);
          } catch (e) {
            console.warn('Failed to get Firebase ID token after account creation', e);
          }
          setNameStep(true);
          } catch (createError) {
            alert(createError.message);
          }
      } else {
        alert(_error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setNameStep(true);
  };

  const handleStart = async () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    const BACKEND_URL = 'https://iot-project-a0ho.onrender.com';
    // If we have a Firebase ID token, exchange it with backend to get app JWT
    if (firebaseIdToken) {
      setLoading(true);
      try {
        const resp = await fetch(`${BACKEND_URL}/api/auth/firebase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: firebaseIdToken, name: name.trim() }),
        });
        const data = await resp.json().catch(() => null);
        if (data?.token) {
          await AsyncStorage.setItem('pestify_token', data.token);
        }
      } catch (e) {
        console.warn('Backend auth exchange failed', e);
      } finally {
        setLoading(false);
      }
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
        <View style={styles.nameContainer}>
          <Text style={styles.nameEmoji}>👋</Text>
          <Text style={styles.nameTitle}>What is your name?</Text>
          <Text style={styles.nameSubtitle}>
            So we can personalize your experience
          </Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>Start Using Pestify 🚀</Text>
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerLogo}>🌿</Text>
          <Text style={styles.headerTitle}>Sign In to Pestify</Text>
          <Text style={styles.headerSubtitle}>Protecting farmers with AI</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "phone" && styles.tabActive]}
              onPress={() => {
                setActiveTab("phone");
                setOtpSent(false);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "phone" && styles.tabTextActive,
                ]}
              >
                📱 Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "email" && styles.tabActive]}
              onPress={() => setActiveTab("email")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "email" && styles.tabTextActive,
                ]}
              >
                ✉️ Email
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "phone" && (
            <>
              {!otpSent ? (
                <>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.phoneRow}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Enter phone number"
                      placeholderTextColor="#999"
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
              ) : (
                <>
                  <Text style={styles.label}>
                    Verification code sent to +91 {phone.slice(0, 5)}XXXXX
                  </Text>
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
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                            otpRefs.current[index - 1]?.focus();
                            const newOtp = [...otp];
                            newOtp[index - 1] = '';
                            setOtp(newOtp);
                          }
                        }}
                        autoFocus={index === 0}
                      />
                    ))}
                  </View>
                  <TouchableOpacity
                    onPress={() => countdown === 0 && handleSendOTP()}
                    disabled={countdown > 0}
                  >
                    <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                    onPress={handleVerify}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.primaryBtnText}>
                        Verify & Continue
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {activeTab === "email" && (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#999"
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
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
          >
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleGoogleSignIn}
          >
            <Text style={styles.createBtnText}>Create Account</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By signing in you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F8E9" },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 70 : 55,
    paddingBottom: 30,
  },
  headerLogo: { fontSize: 48, marginBottom: 8 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: "#4A7C4A" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#fff", elevation: 2 },
  tabText: { fontSize: 14, color: "#999", fontWeight: "600" },
  tabTextActive: { color: "#2E7D32" },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 8 },
  phoneRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  countryCode: {
    backgroundColor: "#F1F8E9",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  countryCodeText: { fontSize: 15, color: "#2E7D32", fontWeight: "bold" },
  phoneInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F1F8E9",
    color: "#1B5E20",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F1F8E9",
    color: "#1B5E20",
    marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpBox: {
    width: 44,
    height: 54,
    borderWidth: 2,
    borderColor: "#C8E6C9",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
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
  resendDisabled: {
    color: '#9E9E9E',
  },
  forgotText: {
    textAlign: "center",
    color: "#2E7D32",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  googleG: { fontSize: 18, fontWeight: "bold", color: "#DB4437" },
  googleBtnText: { fontSize: 15, fontWeight: "600", color: "#333" },
  createBtn: {
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  createBtnText: { fontSize: 15, fontWeight: "600", color: "#2E7D32" },
  terms: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    lineHeight: 18,
  },
  nameContainer: {
    flex: 1,
    backgroundColor: "#F1F8E9",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  nameEmoji: { fontSize: 60, marginBottom: 20 },
  nameTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 8,
    textAlign: "center",
  },
  nameSubtitle: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 30,
    textAlign: "center",
  },
  nameInput: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#1B5E20",
    marginBottom: 20,
  },
  startBtn: {
    width: "100%",
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});