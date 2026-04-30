import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DARK, LIGHT } from "../constants/colors";

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    async function loadThemeMode() {
      const saved = await AsyncStorage.getItem("isDarkMode");
      setIsDarkMode(saved === "true");
    }
    loadThemeMode();
  }, []);

  const toggleThemeMode = async () => {
    setIsDarkMode((current) => {
      const next = !current;
      AsyncStorage.setItem("isDarkMode", String(next));
      return next;
    });
  };

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleThemeMode,
      COLORS: isDarkMode ? DARK : LIGHT,
    }),
    [isDarkMode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    return {
      isDarkMode: false,
      toggleThemeMode: () => {},
      COLORS: LIGHT,
    };
  }
  return context;
}
