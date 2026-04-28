# 🌿 CropGuard AI — Pest Identification App

AI-powered mobile app to identify crop pests from photos and recommend organic & chemical treatments.
Built with **React Native + Expo Go** + **Claude Vision API**.

---

## 📱 Features

- 📷 **Camera & Gallery** — Capture pest photos or pick from gallery
- 🤖 **Claude AI Vision** — Identifies 500+ crop pests and diseases
- 🧪 **Treatment Plans** — Organic AND chemical treatment recommendations with dosage
- 📊 **Severity Rating** — Low / Moderate / High / Critical classification
- 📋 **Scan History** — Persistent local history with AsyncStorage
- 📤 **Share Results** — Share pest reports with fellow farmers
- 🌾 **Context Input** — Add crop type / location for better accuracy

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API Key

Open `services/pestAnalysis.js` and replace:
```js
const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
```
with your actual key from https://console.anthropic.com

> ⚠️ **Security Note:** For production, never hardcode API keys in the app.
> Use a backend proxy (e.g., Express/Node server) that holds the key server-side.

### 3. Start the development server

```bash
npx expo start
```

### 4. Open in Expo Go

- Download **Expo Go** from App Store / Play Store
- Scan the QR code from the terminal
- The app will load on your device

---

## 📁 Project Structure

```
CropGuardAI/
├── App.js                    # Root navigation setup
├── app.json                  # Expo configuration
├── babel.config.js           # Babel config
├── package.json              # Dependencies
│
├── constants/
│   └── theme.js              # Colors, typography, spacing
│
├── screens/
│   ├── HomeScreen.js         # Main dashboard + scan buttons
│   ├── AnalyzeScreen.js      # Image preview + API call
│   ├── ResultScreen.js       # Pest ID results + treatments
│   └── HistoryScreen.js      # Past scan history
│
└── services/
    ├── pestAnalysis.js       # Anthropic Claude Vision API
    └── historyStorage.js     # AsyncStorage CRUD helpers
```

---

## 🔧 Dependencies

| Package | Purpose |
|---|---|
| `expo-image-picker` | Camera & gallery access |
| `expo-file-system` | Convert image to base64 |
| `@react-navigation/native` | App navigation |
| `@react-navigation/stack` | Stack screens |
| `@react-navigation/bottom-tabs` | Tab bar |
| `@react-native-async-storage/async-storage` | Persistent history |
| `expo-linear-gradient` | Beautiful gradients |
| `react-native-reanimated` | Animations |

---

## 🤖 How the AI Works

1. User captures/selects a crop image
2. App converts image to Base64 using `expo-file-system`
3. Base64 image + optional context is sent to **Claude claude-sonnet-4-20250514** via the Vision API
4. Claude responds with structured JSON containing:
   - Pest name + scientific name + confidence score
   - Severity level + spread risk
   - Symptoms list
   - Organic treatments (neem oil, biopesticides, etc.)
   - Chemical treatments with dosage + harvest waiting period
   - Prevention tips + economic impact
5. Results are displayed in a beautiful UI and saved to local history

---

## 🔒 Production Security

For a production app, **never expose your API key** in the mobile app bundle.

Instead, create a simple backend:

```js
// server.js (Node/Express)
app.post('/analyze', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY }, // env var
    body: req.body
  });
  res.json(await response.json());
});
```

Then in `pestAnalysis.js`, call `https://yourserver.com/analyze` instead of the Anthropic API directly.

---

## 📸 Tips for Best Results

- Photograph in natural daylight
- Get close to the pest or damaged area (5–15cm)
- Keep the phone steady to avoid blur
- Include both healthy and affected plant tissue
- Add crop type + region in the context field

---

## 🌾 Made for Farmers Everywhere

CropGuard AI is designed to help farmers in India and globally identify pests early, 
reducing crop loss and enabling targeted, responsible pesticide use.
