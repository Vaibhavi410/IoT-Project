const axios = require('axios');
const { callGemini } = require('./gemini');

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const adviceCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

function cacheKey({ crop, latitude, longitude }) {
  return `${String(crop || '').toLowerCase()}|${latitude || ''}|${longitude || ''}`;
}

async function fetchWeather(latitude, longitude) {
  if (!latitude || !longitude) return null;
  const { data } = await axios.get(WEATHER_URL, {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,precipitation,weathercode',
    },
    timeout: 15000,
  });
  return data?.current || null;
}



exports.getAdvice = async (req, res) => {
  try {
    const { crop = 'crop', latitude, longitude } = req.query || {};
    const key = cacheKey({ crop, latitude, longitude });
    const now = Date.now();
    const hit = adviceCache.get(key);
    if (hit && now - hit.ts < CACHE_TTL_MS) {
      return res.status(200).json({ success: true, data: hit.data, cached: true });
    }

    let weather = null;
    try {
      weather = await fetchWeather(latitude, longitude);
    } catch (err) {
      weather = null;
    }

    const weatherContext = weather
      ? `Current weather: temperature ${weather.temperature_2m}C, precipitation ${weather.precipitation}mm, weather code ${weather.weathercode}.`
      : 'Weather data unavailable.';

    const prompt = `Give 3 practical farming tips for growing healthy ${crop}. Format: numbered list.
${weatherContext}
Keep each tip short and actionable for Indian farmers.`;
    const text = await callGemini(prompt);
    const lines = String(text)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 6);

    const data = { crop, weather, adviceText: text, tips: lines };
    adviceCache.set(key, { ts: now, data });
    return res.status(200).json({ success: true, data, cached: false });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate advice' });
  }
};

