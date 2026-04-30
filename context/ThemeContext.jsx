import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DARK, LIGHT } from "../constants/colors";

const THEME_KEY = "isDarkMode";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadThemePreference() {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        setIsDarkMode(saved === "true");
      } finally {
        setReady(true);
      }
    }

    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, String(next));
      return next;
    });
  };

  const value = useMemo(
    () => ({
      isDarkMode,
      COLORS: isDarkMode ? DARK : LIGHT,
      toggleTheme,
      themeReady: ready,
    }),
    [isDarkMode, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
