// theme.ts
import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
  MD3Theme,
} from "react-native-paper";
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";

const { LightTheme: navLight, DarkTheme: navDark } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Light theme
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  ...navLight,
  colors: {
    ...MD3LightTheme.colors,
    ...navLight.colors,
    primary: "#2563eb",
    primaryContainer: "#dbeafe",
    secondary: "#10b981",
    background: "#ffffff",
    surface: "#f9fafb",
    onBackground: "#111827",
    onSurface: "#111827",
  },
  fonts: {
    ...MD3LightTheme.fonts, // preserve type-safe font weights
  },
};

// Dark theme
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  ...navDark,
  colors: {
    ...MD3DarkTheme.colors,
    ...navDark.colors,
    primary: "#3b82f6",
    primaryContainer: "#1e3a8a",
    secondary: "#10b981",
    background: "#111827",
    surface: "#1f2937",
    onBackground: "#f9fafb",
    onSurface: "#f9fafb",
  },
  fonts: {
    ...MD3DarkTheme.fonts, // preserve type-safe font weights
  },
};
