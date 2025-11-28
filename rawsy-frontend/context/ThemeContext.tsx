import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MD3LightTheme, MD3DarkTheme, MD3Theme, adaptNavigationTheme } from "react-native-paper";
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from "@react-navigation/native";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// 1️⃣ Typed MD3 Typography
const md3Typography: MD3Theme["fonts"] = {
  default: { fontFamily: "System", fontWeight: "400", letterSpacing: 0 },
   displayLarge: { fontFamily: "System", fontWeight: "400", fontSize: 57, lineHeight: 64, letterSpacing: 0 },
  displayMedium: { fontFamily: "System", fontWeight: "400", fontSize: 45, lineHeight: 52, letterSpacing: 0 },
  displaySmall: { fontFamily: "System", fontWeight: "400", fontSize: 36, lineHeight: 44, letterSpacing: 0 },
  headlineLarge: { fontFamily: "System", fontWeight: "700", fontSize: 32, lineHeight: 40, letterSpacing: 0 },
  headlineMedium: { fontFamily: "System", fontWeight: "600", fontSize: 28, lineHeight: 36, letterSpacing: 0 },
  headlineSmall: { fontFamily: "System", fontWeight: "600", fontSize: 24, lineHeight: 32, letterSpacing: 0 },
  titleLarge: { fontFamily: "System", fontWeight: "600", fontSize: 22, lineHeight: 28, letterSpacing: 0 },
  titleMedium: { fontFamily: "System", fontWeight: "500", fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  titleSmall: { fontFamily: "System", fontWeight: "500", fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  bodyLarge: { fontFamily: "System", fontWeight: "400", fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  bodyMedium: { fontFamily: "System", fontWeight: "400", fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  bodySmall: { fontFamily: "System", fontWeight: "400", fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  labelLarge: { fontFamily: "System", fontWeight: "500", fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium: { fontFamily: "System", fontWeight: "500", fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall: { fontFamily: "System", fontWeight: "500", fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },

};

// 2️⃣ Custom Light Theme
const customLightTheme: MD3Theme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: "#2563eb",
    primaryContainer: "#dbeafe",
    secondary: "#10b981",
    secondaryContainer: "#d1fae5",
    tertiary: "#f59e0b",
    error: "#dc2626",
    background: "#ffffff",
    surface: "#f9fafb",
    surfaceVariant: "#f3f4f6",
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
    onBackground: "#111827",
    onSurface: "#111827",
  },
  fonts: md3Typography,
};

// 3️⃣ Custom Dark Theme
const customDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: "#3b82f6",
    primaryContainer: "#1e3a8a",
    secondary: "#10b981",
    secondaryContainer: "#064e3b",
    tertiary: "#f59e0b",
    error: "#ef4444",
    background: "#111827",
    surface: "#1f2937",
    surfaceVariant: "#374151",
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
    onBackground: "#f9fafb",
    onSurface: "#f9fafb",
  },
  fonts: md3Typography,
};

// 4️⃣ Theme Context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: MD3Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(system === "dark");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("themePreference");
        if (saved) setIsDarkMode(saved === "dark");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem("themePreference", newMode ? "dark" : "light");
  };

  const theme = isDarkMode ? customDarkTheme : customLightTheme;

  if (isLoading) return null;

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};
