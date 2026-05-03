Google Auth Setup (Expo + Firebase)

1) Create OAuth client IDs
- Open Google Cloud Console → APIs & Services → Credentials → Create Credentials → OAuth client ID.
- Create client IDs for: Android (package name: `com.pestify`), iOS (bundle id), Web (for web/expo), and an Expo (for Expo Go) client if needed.
- For Android provide package name and SHA-1 (if doing a standalone build).

2) Add client IDs to `app.json`
- Open `app.json` and fill `expo.extra.google` fields:
  - `androidClientId`, `iosClientId`, `expoClientId`, `webClientId`.
- Do NOT commit real secrets to public repos. Use environment/config secrets for CI.

3) Install dependencies
Run from `IoT-Project`:

```bash
npm install
npx expo install expo-auth-session
```

4) Build / run
- Expo Go: you can test with `promptAsync({ useProxy: true })` and `expoClientId` set.
- Standalone (recommended): build with EAS and install the produced app: `eas build -p android` (ensure `google-services.json` is included).

5) Firebase
- Ensure your Firebase project is configured and `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are set for native builds.
- The app will exchange the Google id token for a Firebase credential and sign in via `@react-native-firebase/auth`.

6) Next steps I can do for you
- Add real client IDs to `app.json` for you (if you provide them).
- Help configure EAS build settings or generate credentials.
