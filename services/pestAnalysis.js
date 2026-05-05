import axios from 'axios';
import { getApiBaseUrl } from './apiBaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = getApiBaseUrl();

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

function parseJwtPayload(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
    return JSON.parse(global.atob(payload));
  } catch (e) {
    return null;
  }
}

export async function getCurrentUserId() {
  const stored = await AsyncStorage.getItem('pestify_user_id');
  if (stored) return stored;
  const token = await AsyncStorage.getItem('pestify_token');
  const payload = parseJwtPayload(token);
  const userId = payload?.id || payload?._id || null;
  if (userId) {
    await AsyncStorage.setItem('pestify_user_id', String(userId));
  }
  return userId;
}

export async function analyzePest(imageBase64, cropType, location) {
  try {
    const url = joinUrl(BASE_URL, '/api/ai/analyze-pest');
    const resp = await axios.post(
      url,
      { imageBase64, cropType, location },
      { timeout: 120000 }
    );
    const body = resp?.data;
    if (body && body.success === false) {
      return { error: true, message: body.message || 'Analysis failed' };
    }
    if (body && body.success === true && body.data) {
      return body.data;
    }
    return { error: true, message: 'Analysis failed' };
  } catch (error) {
    return { error: true, message: 'Analysis failed' };
  }
}

export async function getPestHistory(userId) {
  try {
    const url = joinUrl(BASE_URL, `/api/ai/history/${userId}`);
    const resp = await axios.get(url);
    return Array.isArray(resp?.data?.data) ? resp.data.data : [];
  } catch (error) {
    return [];
  }
}

export async function deletePestScan(id) {
  try {
    const url = joinUrl(BASE_URL, `/api/ai/${id}`);
    const resp = await axios.delete(url);
    if (resp?.data?.success) return { success: true };
    return { error: true };
  } catch (error) {
    return { error: true };
  }
}

export async function getAiStats(userId) {
  try {
    const url = joinUrl(BASE_URL, `/api/ai/stats/${userId}`);
    const resp = await axios.get(url);
    return resp?.data?.success ? resp.data.data : null;
  } catch (error) {
    return null;
  }
}

export async function getAdvice(crop, latitude, longitude) {
  try {
    const url = joinUrl(BASE_URL, '/api/advice');
    const resp = await axios.get(url, {
      params: { crop, latitude, longitude },
      timeout: 30000,
    });
    return resp?.data?.success ? resp.data.data : null;
  } catch (error) {
    return null;
  }
}

export async function chatWithAssistant(message, history = []) {
  try {
    const url = joinUrl(BASE_URL, '/api/ai/chat');
    const resp = await axios.post(url, { message, history }, { timeout: 30000 });
    if (resp?.data?.success) {
      return { text: resp.data.generated_text || '', error: false };
    }
    return { text: '', error: true };
  } catch (error) {
    return { text: '', error: true };
  }
}
