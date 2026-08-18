import { useAppStore } from "@/store/useAppStore";

export type ModeKey = "dev" | "study" | "faith";

export interface ModePalette {
  screen: string;
  header: string;
  headerText: string;
  card: string;
  accent: string;
  accentSoft: string;
  interactive: string;
  onInteractive: string;
  accentText: string;
  secondary: string;
  bodyText: string;
  mutedText: string;
}

export const palettes: Record<
  ModeKey,
  { light: ModePalette; dark: ModePalette }
> = {
  dev: {
    light: {
      screen: "#F1F5F9",
      header: "#07191E",
      headerText: "#FFFFFF",
      card: "#FFFFFF",
      accent: "#02F5A1",
      accentSoft: "#E0FBF2",
      interactive: "#07191E",
      onInteractive: "#FFFFFF",
      accentText: "#07191E",
      secondary: "#06503F",
      bodyText: "#1E293B",
      mutedText: "#64748B",
    },
    dark: {
      screen: "#334155",
      header: "#07191E",
      headerText: "#FFFFFF",
      card: "#13252C",
      accent: "#02F5A1",
      accentSoft: "#12312E",
      interactive: "#02F5A1",
      onInteractive: "#07191E",
      accentText: "#02F5A1",
      secondary: "#03D48D",
      bodyText: "#E2E8F0",
      mutedText: "#94A3B8",
    },
  },
  study: {
    light: {
      screen: "#F1F5F9",
      header: "#240A30",
      headerText: "#FFFFFF",
      card: "#FFFFFF",
      accent: "#FFDCEF",
      accentSoft: "#FFF1F8",
      interactive: "#240A30",
      onInteractive: "#FFFFFF",
      accentText: "#240A30",
      secondary: "#5B3E60",
      bodyText: "#1E293B",
      mutedText: "#64748B",
    },
    dark: {
      screen: "#334155",
      header: "#240A30",
      headerText: "#FFFFFF",
      card: "#1D0B29",
      accent: "#FFCBE7",
      accentSoft: "#2B103A",
      interactive: "#FFCBE7",
      onInteractive: "#240A30",
      accentText: "#FFCBE7",
      secondary: "#DEAECB",
      bodyText: "#E2E8F0",
      mutedText: "#94A3B8",
    },
  },
  faith: {
    light: {
      screen: "#F1F5F9",
      header: "#003152",
      headerText: "#FFFFFF",
      card: "#FFFFFF",
      accent: "#ADDFF1",
      accentSoft: "#EAF6FB",
      interactive: "#003152",
      onInteractive: "#FFFFFF",
      accentText: "#003152",
      secondary: "#2B5C79",
      bodyText: "#1E293B",
      mutedText: "#64748B",
    },
    dark: {
      screen: "#334155",
      header: "#003152",
      headerText: "#FFFFFF",
      card: "#003152",
      accent: "#ADDFF1",
      accentSoft: "#0C3A58",
      interactive: "#ADDFF1",
      onInteractive: "#003152",
      accentText: "#ADDFF1",
      secondary: "#93C4D9",
      bodyText: "#E2E8F0",
      mutedText: "#94A3B8",
    },
  },
};

const MODE_KEY_MAP: Record<string, ModeKey> = {
  coding: "dev",
  study: "study",
  faith: "faith",
};

export function useModeTheme() {
  const mode = useAppStore((s) => s.mode);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const modeKey: ModeKey = MODE_KEY_MAP[mode] ?? "study";
  const palette = palettes[modeKey][isDarkMode ? "dark" : "light"];
  return { modeKey, isDarkMode, palette };
}