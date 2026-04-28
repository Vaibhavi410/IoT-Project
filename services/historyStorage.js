// services/historyStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "pestify_scan_history";
const MAX_HISTORY = 50;

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
