// services/pestAnalysis.js
// Calls Claude Vision API to identify pests and recommend treatments

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ⚠️ Replace with your Anthropic API key
// In production, NEVER hardcode keys — use environment variables or a backend proxy
const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";

const SYSTEM_PROMPT = `You are CropGuard AI, an expert agricultural entomologist and plant pathologist with 30 years of experience identifying crop pests and diseases worldwide. You specialize in integrated pest management (IPM) for farmers in South Asia, Southeast Asia, and globally.

When given an image of a crop pest, diseased plant, or damaged crop, you MUST respond ONLY with a valid JSON object (no markdown, no extra text) in this exact structure:

{
  "identified": true,
  "pestName": "Common name of pest/disease",
  "scientificName": "Scientific name (Genus species)",
  "confidence": 85,
  "severity": "Low|Moderate|High|Critical",
  "category": "Insect|Fungal Disease|Bacterial Disease|Viral Disease|Mite|Nematode|Weed|Other",
  "affectedCrops": ["Rice", "Wheat", "Cotton"],
  "description": "2-3 sentence description of this pest/disease and how it damages crops.",
  "symptoms": ["Yellowing of leaves", "Small holes in foliage", "Sticky residue"],
  "organicTreatments": [
    {
      "name": "Neem Oil Spray",
      "instructions": "Mix 5ml neem oil with 1L water and 2-3 drops of dish soap. Spray on affected plants every 7 days.",
      "effectiveness": "Moderate"
    }
  ],
  "chemicalTreatments": [
    {
      "name": "Imidacloprid",
      "dosage": "0.5ml per liter of water",
      "instructions": "Apply as foliar spray in early morning or evening. Avoid spraying near water bodies.",
      "effectiveness": "High",
      "waitingPeriod": "7 days before harvest"
    }
  ],
  "preventionTips": ["Rotate crops seasonally", "Maintain field hygiene", "Use resistant varieties"],
  "bestTimeToTreat": "Early morning or evening when temperatures are cooler",
  "spreadRisk": "Low|Moderate|High",
  "economicImpact": "Brief note on potential yield loss if untreated"
}

If you cannot identify the pest or if no pest/disease is visible in the image, respond with:
{
  "identified": false,
  "message": "Reason why identification was not possible (e.g., image unclear, no pest visible, not a crop pest image)",
  "suggestions": ["Take a clearer, closer photo", "Ensure good lighting", "Focus on the affected area"]
}`;

/**
 * Analyzes a crop image for pest identification using Claude Vision
 * @param {string} base64Image - Base64 encoded image (without data URI prefix)
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @param {string} [additionalContext] - Optional user notes about the crop/location
 * @returns {Promise<Object>} Parsed pest identification result
 */
export async function analyzePestImage(base64Image, mimeType = "image/jpeg", additionalContext = "") {
  if (!API_KEY || API_KEY === "YOUR_ANTHROPIC_API_KEY_HERE") {
    throw new Error("API_KEY_MISSING");
  }

  const userMessage = additionalContext
    ? `Please analyze this crop image for pests or diseases. Additional context from the farmer: ${additionalContext}`
    : "Please analyze this crop image for pests or diseases and provide identification with treatment recommendations.";

  const requestBody = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: userMessage,
          },
        ],
      },
    ],
  };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || "";

  // Strip any accidental markdown code fences
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse AI response. Please try again.");
  }
}

/**
 * Severity color mapping
 */
export const SEVERITY_COLORS = {
  Low: "#4caf50",
  Moderate: "#ff9800",
  High: "#f44336",
  Critical: "#7b1fa2",
};

export const SEVERITY_BG = {
  Low: "#e8f5e9",
  Moderate: "#fff3e0",
  High: "#ffebee",
  Critical: "#f3e5f5",
};

/**
 * Spread risk colors
 */
export const SPREAD_COLORS = {
  Low: "#4caf50",
  Moderate: "#ff9800",
  High: "#f44336",
};
