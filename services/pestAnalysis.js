// services/pestAnalysis.js
// Proxy to backend AI analyze endpoint. Backend will call Gemini/other model.

const API_URL =
  (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) ||
  'https://iot-project-a0ho.onrender.com';

/**
 * Analyzes a crop image by sending it to the backend AI endpoint.
 * @param {string} base64Image - Base64 encoded image (without data URI prefix)
 * @param {string} mimeType
 * @param {string} additionalContext
 */
export async function analyzePestImage(base64Image, mimeType = 'image/jpeg', additionalContext = '') {
  if (!base64Image) throw new Error('MISSING_IMAGE');

  const resp = await fetch(`${API_URL}/api/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType, additionalContext }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => 'AI backend error');
    throw new Error(text || `AI backend returned ${resp.status}`);
  }

  const payload = await resp.json().catch(() => null);
  if (!payload) throw new Error('Empty response from AI backend');

  if (!payload.success) {
    throw new Error(payload.message || 'AI backend failed');
  }

  // If the backend returned parsed `data` use it, otherwise return raw text
  return payload.data || payload.raw || {};
}

export const SEVERITY_COLORS = {
  Low: '#4caf50',
  Moderate: '#ff9800',
  High: '#f44336',
  Critical: '#7b1fa2',
};

export const SEVERITY_BG = {
  Low: '#e8f5e9',
  Moderate: '#fff3e0',
  High: '#ffebee',
  Critical: '#f3e5f5',
};

export const SPREAD_COLORS = {
  Low: '#4caf50',
  Moderate: '#ff9800',
  High: '#f44336',
};
