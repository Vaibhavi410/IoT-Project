import Constants from 'expo-constants';
import { Platform } from 'react-native';

function stripTrailingSlashes(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function hostFromExpoHostUri(hostUri) {
  // Examples:
  // - "192.168.1.12:8081"
  // - "localhost:8081"
  // - "10.0.2.2:8081"
  const raw = String(hostUri || '').trim();
  if (!raw) return '';
  const withoutScheme = raw.replace(/^\w+:\/\//, '');
  return withoutScheme.split('/')[0].split(':')[0];
}

/**
 * Returns the backend base URL for the app.
 *
 * Priority:
 * 1) EXPO_PUBLIC_API_URL (recommended for production / physical devices)
 * 2) Use the dev server host (works well on physical devices in LAN)
 * 3) Release fallback: Render (works anywhere)
 * 4) Emulator fallback: Android -> 10.0.2.2, iOS -> localhost
 */
export function getApiBaseUrl() {
  const env =
    typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL
      ? stripTrailingSlashes(process.env.EXPO_PUBLIC_API_URL)
      : '';
  if (env) return env;

  // If you forget to inject EXPO_PUBLIC_API_URL into a release APK,
  // we still want the app to work on other devices (e.g. a friend's phone).
  // This is the previous project default backend.
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return 'https://iot-project-a0ho.onrender.com';
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost ||
    '';

  const host = hostFromExpoHostUri(hostUri);
  if (host && host !== 'localhost') {
    return `http://${host}:5000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
}

