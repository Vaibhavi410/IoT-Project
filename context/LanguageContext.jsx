import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_LANG, TRANSLATIONS } from '../constants/translations';

/** Key used in AsyncStorage to remember the user's language. */
const STORAGE_KEY = '@pestify_language_code';

/**
 * @typedef {{
 *   languageCode: string;
 *   setLanguage: (code: string) => Promise<void>;
 *   t: (key: string) => string;
 *   ready: boolean;
 * }} LanguageContextValue
 */

const LanguageContext = createContext(/** @type {LanguageContextValue | null} */ (null));

/**
 * Wrap your app (or navigation root) with LanguageProvider so any screen
 * can call useLanguage() and get t('key') translations.
 */
export function LanguageProvider({ children }) {
  const [languageCode, setLanguageCodeState] = useState(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  // On first launch: load saved language from phone storage (if any).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && saved && TRANSLATIONS[saved]) {
          setLanguageCodeState(saved);
        }
      } catch {
        // ignore read errors — we fall back to DEFAULT_LANG
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Change app language and persist it for next app open. */
  const setLanguage = useCallback(async (code) => {
    if (!TRANSLATIONS[code]) return;
    setLanguageCodeState(code);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch {
      // still update UI even if save fails
    }
  }, []);

  /**
   * Translate a string key for the current language.
   * Falls back to English if a key is missing.
   */
  const t = useCallback(
    (key) => {
      const pack = TRANSLATIONS[languageCode] || TRANSLATIONS[DEFAULT_LANG];
      const fallback = TRANSLATIONS[DEFAULT_LANG];
      if (pack[key] != null) return pack[key];
      if (fallback[key] != null) return fallback[key];
      return key;
    },
    [languageCode]
  );

  const value = useMemo(
    () => ({
      languageCode,
      setLanguage,
      t,
      ready,
    }),
    [languageCode, setLanguage, t, ready]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return ctx;
}
