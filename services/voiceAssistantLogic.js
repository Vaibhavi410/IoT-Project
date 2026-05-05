/**
 * Dummy “AI” answers for the voice assistant (no backend).
 * Matches keywords in the farmer’s question and returns a canned reply in the right language.
 */

function normalize(s) {
  return (s || '').toLowerCase().trim();
}

/**
 * @param {string} question - User text (typed or pasted after recording)
 * @param {string} langCode - Language id from LanguageContext (e.g. 'english', 'hindi')
 * @param {(key: string) => string} t - translate function
 */
export function getDummyVoiceResponse(question, langCode, t) {
  const q = normalize(question);

  // Devanagari / Latin keyword checks (covers Hindi and typed English)
  if (
    q.includes('पत्ते पीले') ||
    q.includes('yellow leaves') ||
    q.includes('yellow leaf') ||
    q.includes('pila') ||
    q.includes('pale leaves')
  ) {
    return t('voice_ai_yellow_leaves');
  }

  if (
    q.includes('कीट') ||
    q.includes('pest') ||
    q.includes('bug') ||
    q.includes('insect') ||
    q.includes('worm')
  ) {
    return t('voice_ai_pest');
  }

  if (
    q.includes('मिट्टी') ||
    q.includes('soil') ||
    q.includes('mitti') ||
    q.includes('earth')
  ) {
    return t('voice_ai_soil');
  }

  return t('voice_ai_default');
}

/** expo-speech BCP-47 locale hints per app language id */
export const SPEECH_LOCALE_MAP = {
  english: 'en-US',
  hindi: 'hi-IN',
  marathi: 'mr-IN',
  telugu: 'te-IN',
  tamil: 'ta-IN',
  kannada: 'kn-IN',
  bengali: 'bn-IN',
  gujarati: 'gu-IN',
  punjabi: 'pa-IN',
  urdu: 'ur-PK',
};

export function getSpeechLocale(langCode) {
  return SPEECH_LOCALE_MAP[langCode] || 'en-US';
}

/**
 * Voice assistant response.
 * This app version does NOT call any external AI services directly.
 */
export async function queryVoiceAssistant(question, langCode, t) {
  if (!question) return '';
  return getDummyVoiceResponse(question, langCode, t);
}
