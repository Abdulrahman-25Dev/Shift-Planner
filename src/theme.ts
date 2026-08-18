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

export interface ModeClasses {
  headerBg: string;
  textHeader: string;
  darkCard: string;
  darkInteractive: string;
  darkInteractiveText: string;
  darkInteractiveText80: string;
  darkInteractiveText70: string;
  textHeader80: string;
  textHeader70: string;
  darkInteractive60: string;
  darkInteractive15: string;
  darkInteractive10: string;
  darkAccentSoft: string;
  darkAccentBorder: string;
  accentSoft: string;
  accentBg40: string;
  accentBorder: string;
  accentBorderFull: string;
  accentBg30: string;
  darkInteractiveBorder: string;
  darkInteractiveBorder30: string;
  darkInteractiveBorder40: string;
  headerBorder: string;
}

export const MODE_CLASSES: Record<ModeKey, ModeClasses> = {
  dev: {
    headerBg: "bg-dev-header",
    textHeader: "text-dev-header",
    darkCard: "bg-dev-dark-card",
    darkInteractive: "bg-dev-dark-interactive",
    darkInteractiveText: "text-dev-dark-interactive",
    darkInteractiveText80: "text-dev-dark-interactive/80",
    darkInteractiveText70: "text-dev-dark-interactive/70",
    textHeader80: "text-dev-header/80",
    textHeader70: "text-dev-header/70",
    darkInteractive60: "bg-dev-dark-interactive/60",
    darkInteractive15: "bg-dev-dark-interactive/15",
    darkInteractive10: "bg-dev-dark-interactive/10",
    darkAccentSoft: "bg-dev-dark-accentSoft",
    darkAccentBorder: "border-dev-dark-accentSoft",
    accentSoft: "bg-dev-accentSoft",
    accentBg40: "bg-dev-accent/40",
    accentBorder: "border-dev-accent/60",
    accentBorderFull: "border-dev-accent",
    accentBg30: "bg-dev-accent/30",
    darkInteractiveBorder: "border-dev-dark-interactive/60",
    darkInteractiveBorder30: "border-dev-dark-interactive/30",
    darkInteractiveBorder40: "border-dev-dark-interactive/40",
    headerBorder: "border-dev-header/30",
  },
  study: {
    headerBg: "bg-study-header",
    textHeader: "text-study-header",
    darkCard: "bg-study-dark-card",
    darkInteractive: "bg-study-dark-interactive",
    darkInteractiveText: "text-study-dark-interactive",
    darkInteractiveText80: "text-study-dark-interactive/80",
    darkInteractiveText70: "text-study-dark-interactive/70",
    textHeader80: "text-study-header/80",
    textHeader70: "text-study-header/70",
    darkInteractive60: "bg-study-dark-interactive/60",
    darkInteractive15: "bg-study-dark-interactive/15",
    darkInteractive10: "bg-study-dark-interactive/10",
    darkAccentSoft: "bg-study-dark-accentSoft",
    darkAccentBorder: "border-study-dark-accentSoft",
    accentSoft: "bg-study-accentSoft",
    accentBg40: "bg-study-accent/40",
    accentBorder: "border-study-accent/60",
    accentBorderFull: "border-study-accent",
    accentBg30: "bg-study-accent/30",
    darkInteractiveBorder: "border-study-dark-interactive/60",
    darkInteractiveBorder30: "border-study-dark-interactive/30",
    darkInteractiveBorder40: "border-study-dark-interactive/40",
    headerBorder: "border-study-header/30",
  },
  faith: {
    headerBg: "bg-faith-header",
    textHeader: "text-faith-header",
    darkCard: "bg-faith-dark-card",
    darkInteractive: "bg-faith-dark-interactive",
    darkInteractiveText: "text-faith-dark-interactive",
    darkInteractiveText80: "text-faith-dark-interactive/80",
    darkInteractiveText70: "text-faith-dark-interactive/70",
    textHeader80: "text-faith-header/80",
    textHeader70: "text-faith-header/70",
    darkInteractive60: "bg-faith-dark-interactive/60",
    darkInteractive15: "bg-faith-dark-interactive/15",
    darkInteractive10: "bg-faith-dark-interactive/10",
    darkAccentSoft: "bg-faith-dark-accentSoft",
    darkAccentBorder: "border-faith-dark-accentSoft",
    accentSoft: "bg-faith-accentSoft",
    accentBg40: "bg-faith-accent/40",
    accentBorder: "border-faith-accent/60",
    accentBorderFull: "border-faith-accent",
    accentBg30: "bg-faith-accent/30",
    darkInteractiveBorder: "border-faith-dark-interactive/60",
    darkInteractiveBorder30: "border-faith-dark-interactive/30",
    darkInteractiveBorder40: "border-faith-dark-interactive/40",
    headerBorder: "border-faith-header/30",
  },
};

export function useModeClasses(): ModeClasses {
  const { modeKey } = useModeTheme();
  return MODE_CLASSES[modeKey];
}