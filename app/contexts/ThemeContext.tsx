"use client";

// contexts/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  colorThemes,
  gradients,
  statusColors,
  trustSignals,
} from "../constants/colors";

// Type definitions
type ThemeType = "light" | "dark";

interface ThemeColors {
  background: {
    main: string;
    orb1: string;
    orb2: string;
    orb3: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
  };
  icon: {
    primary: string;
    secondary: string;
    muted: string;
  };
  card: {
    background: string;
    hover: string;
  };
  form: {
    background: string;
    focus: string;
    button: string;
  };
  select: {
    background: string;
    border: string;
    hover: string;
    focus: string;
    dropdown: string;
    dropdownBorder: string;
    dropdownShadow: string;
    option: {
      default: string;
      selected: string;
      text: string;
      textMuted: string;
    };
  };
}

interface ThemeGradients {
  heading: {
    primary: string;
    secondary: string;
  };
  highlight: string;
  progress: string;
  glow: {
    emerald: string;
    focus: string;
  };
}

interface StatusColors {
  success: string;
  error: string;
  loading: string;
  pulse: string;
}

interface TrustSignals {
  secure: string;
  email: string;
  rocket: string;
}

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  gradients: ThemeGradients;
  status: StatusColors;
  trust: TrustSignals;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
  isLight: boolean;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : "dark";
    }
    return "dark";
  });

  // Update localStorage when theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = (): void => {
    setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Set specific theme
  const setTheme = (newTheme: ThemeType): void => {
    if (newTheme === "light" || newTheme === "dark") {
      setThemeState(newTheme);
    }
  };

  // Get current theme colors
  const colors = colorThemes[theme];
  const themeGradients = gradients[theme];
  const themeTrustSignals = trustSignals[theme];

  // Context value
  const value: ThemeContextType = {
    theme,
    colors,
    gradients: themeGradients,
    status: statusColors,
    trust: themeTrustSignals,
    toggleTheme,
    setTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
