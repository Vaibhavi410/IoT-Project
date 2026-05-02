// services/historyStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "pestify_scan_history";
const MAX_HISTORY = 50;

const API_URL =
  (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) ||
  'https://iot-project-a0ho.onrender.com';

async function getAuthToken() {
  try {
    const t = await AsyncStorage.getItem('pestify_token');
    return t;
  } catch {
    return null;
  }
}

/**
 * Save a scan result to history
 */
export async function saveScanResult(imageUri, result) {
  try {
    const existing = await getScanHistory();
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      imageUri,
      result,
    };
    const updated = [newEntry, ...existing].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newEntry.id;
  } catch (error) {
    console.error("Failed to save scan history:", error);
  }
}

/**
 * Try to save a scan result to the backend (requires `pestify_token` in AsyncStorage).
 * This posts to POST /api/pest/analyze and returns the created item or null on failure.
 */
export async function saveScanResultRemote(imageUri, result) {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const confidence = (() => {
      if (typeof result?.confidence === 'number') return result.confidence;
      if (typeof result?.confidence === 'string') return parseInt(result.confidence.replace(/[^0-9]/g, ''), 10) || null;
      return null;
    })();

    const severity = (() => {
      const s = String(result?.severity || '').toLowerCase();
      if (s.includes('critical')) return 'critical';
      if (s.includes('high')) return 'high';
      if (s.includes('moderate') || s.includes('medium')) return 'medium';
      if (s.includes('low')) return 'low';
      return 'medium';
    })();

    const payload = {
      pestName: result?.pestName || result?.name || 'Unknown',
      confidence: confidence,
      severity,
      cropType: (result?.affectedCrops && result.affectedCrops[0]) || result?.crop || '',
      imageUrl: imageUri,
      recommendations: result?.organicTreatments?.map((t) => t.name).concat(result?.chemicalTreatments?.map((t) => t.name) || []) || [],
      notes: result?.description || '',
    };

    const resp = await fetch(`${API_URL}/api/pest/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => null);
      console.warn('Remote save failed', resp.status, txt);
      return null;
    }

    const body = await resp.json().catch(() => null);
    return body?.data || null;
  } catch (error) {
    console.warn('saveScanResultRemote error', error);
    return null;
  }
}

/**
 * Fetch user's scan history from backend (requires auth). Falls back to [] on error.
 */
export async function getScanHistoryRemote() {
  try {
    const token = await getAuthToken();
    if (!token) return [];
    const resp = await fetch(`${API_URL}/api/pest/history`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return [];
    const body = await resp.json().catch(() => null);
    return body?.data || [];
  } catch (error) {
    console.warn('getScanHistoryRemote error', error);
    return [];
  }
}

/**
 * Get all scan history
 */
export async function getScanHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a scan from history by id
 */
export async function deleteScanResult(id) {
  try {
    const existing = await getScanHistory();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete scan:", error);
  }
}

/**
 * Clear all history
 */
export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}

/**
 * Format a timestamp nicely
 */
export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}
