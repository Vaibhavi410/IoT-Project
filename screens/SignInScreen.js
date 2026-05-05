import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const pestifyLogo = require("../assets/images/pestify-logo-mark.png");

export default function SignInScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  
  // Configure Expo AuthSession + Google. Client IDs should be added to
  // `app.json` under `expo.extra.google` (placeholders added there).
  WebBrowser.maybeCompleteAuthSession();

  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
  const googleCfg = extra.google || {};
  const ANDROID_CLIENT_ID = googleCfg.androidClientId;
  const IOS_CLIENT_ID = googleCfg.iosClientId;
  const EXPO_CLIENT_ID = googleCfg.expoClientId;
  const WEB_CLIENT_ID = googleCfg.webClientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID || undefined,
    iosClientId: IOS_CLIENT_ID || undefined,
    androidClientId: ANDROID_CLIENT_ID || undefined,
    expoClientId: EXPO_CLIENT_ID || undefined,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const id_token = response.params?.id_token || response.params?.id_token;
      if (!id_token) {
        alert("Google authentication failed: no id token returned");
        return;
      }
      const credential = auth.GoogleAuthProvider.credential(id_token);
      setLoading(true);
      auth()
        .signInWithCredential(credential)
        .then((userCredential) => finalizeSignIn(userCredential.user))
        .catch((err) => alert(err.message || "Google sign-in failed"))
        .finally(() => setLoading(false));
    }
  }, [response]);
  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      await finalizeSignIn(userCredential.user);
    } catch (_error) {
      // Sign-in failed; surface message
      alert(_error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      alert('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const cred = await auth().createUserWithEmailAndPassword(email, password);
      // Optionally set display name if provided (we'll still show nameStep to confirm)
      try {
        if (name && cred.user && cred.user.updateProfile) {
          await cred.user.updateProfile({ displayName: name.trim() });
        }
      } catch (e) {
        console.warn('Failed to set displayName', e);
      }
      try {
        // proceed to finalize sign-in immediately
        await finalizeSignIn(cred.user);
      } finally {
        setShowSignUp(false);
      }
    } catch (e) {
      alert(e.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const configured = ANDROID_CLIENT_ID || IOS_CLIENT_ID || EXPO_CLIENT_ID || WEB_CLIENT_ID;
    if (!configured || !request) {
      alert(
        'Google sign-in is not configured in this build. To enable it, add Google OAuth client IDs to app config (app.json -> expo.extra.google) and install/configure expo-auth-session, then rebuild with EAS.'
      );
      return;
    }
    promptAsync({ useProxy: true });
  };

  // exchange Firebase idToken with backend, persist app JWT and user name, then navigate
  const finalizeSignIn = async (user) => {
    try {
      if (!user) return;
      let idToken = null;
      try {
        idToken = await user.getIdToken();
      } catch (e) {
        console.warn('Failed to get ID token', e);
      }

      if (idToken) {
        const BACKEND_URL = 'https://iot-project-a0ho.onrender.com';
        try {
          const resp = await fetch(`${BACKEND_URL}/api/auth/firebase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, name: user.displayName || '' }),
          });
          const data = await resp.json().catch(() => null);
          if (data?.token) {
            await AsyncStorage.setItem('pestify_token', data.token);
          }
          if (data?.user?.id) {
            await AsyncStorage.setItem('pestify_user_id', String(data.user.id));
          }
        } catch (e) {
          console.warn('Backend auth exchange failed', e);
        }
      }

      const displayName = user.displayName || user.email || user.phoneNumber || '';
      if (displayName) {
        await AsyncStorage.setItem('user_name', displayName);
      }
    } catch (e) {
      console.warn('finalizeSignIn error', e);
    } finally {
      navigation.replace('Main');
    }
  };

  // nameStep removed: finalizeSignIn handles navigation and onboarding immediately

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
          <Image source={pestifyLogo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Sign In to Pestify</Text>
          <Text style={styles.headerSubtitle}>Protecting farmers with AI</Text>
        </View>

        <View style={styles.card}>

          

          {activeTab === "email" && (
            <>
              <Text style={styles.label}>{showSignUp ? 'Name (optional)' : 'Email'}</Text>
              {showSignUp ? (
                <TextInput
                  style={styles.input}
                  placeholder="Full name (optional)"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              ) : null}
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
              {showSignUp && (
                <>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </>
              )}
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                onPress={showSignUp ? handleEmailSignUp : handleEmailSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>{showSignUp ? 'Create Account' : 'Sign In'}</Text>
                )}
              </TouchableOpacity>
              {!showSignUp ? (
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setShowSignUp(false)}>
                  <Text style={[styles.forgotText, { color: '#2E7D32' }]}>Back to sign in</Text>
                </TouchableOpacity>
              )}
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
            onPress={() => {
              // Open sign-up mode and show email tab by default
              setShowSignUp(true);
              setActiveTab('email');
            }}
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
  headerLogo: {
    width: 76,
    height: 86,
    marginBottom: 8,
  },
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
