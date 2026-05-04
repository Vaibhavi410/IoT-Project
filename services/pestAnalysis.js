import axios from 'axios';
import { getApiBaseUrl } from './apiBaseUrl';

const BASE_URL = getApiBaseUrl();

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
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
