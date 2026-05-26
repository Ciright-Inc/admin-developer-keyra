/**
 * Resolved design tokens for the KEYRA Admin Console.
 *
 * These mirror the CSS custom properties in `app/keyra-theme.css` so chart
 * libraries (Recharts, d3) and any JS that needs concrete color values can
 * stay in sync with the theme. Two modes are exported — dark (default) and
 * light. Call `getDesignTokens()` at runtime to read the active mode based
 * on `document.documentElement.dataset.theme`.
 */

export type ThemeMode = "dark" | "light";

/**
 * Shared shape for every theme. Using an explicit interface (rather than
 * `as const` + `typeof`) keeps property values widened to `string`, so the
 * dark and light palettes are mutually assignable to `DesignTokens` even
 * though their literal hex values differ.
 */
export interface DesignTokens {
  canvas: string;
  canvasSoft: string;
  surfaceCard: string;
  surfaceStrong: string;
  surfaceDark: string;
  hairline: string;
  hairlineSoft: string;
  hairlineStrong: string;
  ink: string;
  body: string;
  muted: string;
  mutedSoft: string;
  onPrimary: string;
  onDark: string;
  primary: string;
  primaryActive: string;
  textLink: string;
  textLink2: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  critical: string;
  trust0: string;
  trust25: string;
  trust50: string;
  trust75: string;
  trust100: string;
}

const DARK: DesignTokens = {
  canvas: "#0a0a0a",
  canvasSoft: "#111111",
  surfaceCard: "#171717",
  surfaceStrong: "#262626",
  surfaceDark: "#141414",
  hairline: "#262626",
  hairlineSoft: "#1f1f1f",
  hairlineStrong: "#3a3a3a",
  ink: "#fafafa",
  body: "#a3a3a3",
  muted: "#737373",
  mutedSoft: "#525252",
  onPrimary: "#171717",
  onDark: "#ffffff",
  primary: "#fafafa",
  primaryActive: "#e5e5e5",
  textLink: "#7eb8ff",
  textLink2: "#a8d4ff",
  success: "#22c55e",
  error: "#f87171",
  warning: "#f59e0b",
  info: "#7eb8ff",
  critical: "#f87171",
  trust0: "#f87171",
  trust25: "#fb923c",
  trust50: "#f59e0b",
  trust75: "#4ade80",
  trust100: "#22c55e",
};

const LIGHT: DesignTokens = {
  canvas: "#ffffff",
  canvasSoft: "#fafafa",
  surfaceCard: "#ffffff",
  surfaceStrong: "#f0f0f3",
  surfaceDark: "#171717",
  hairline: "#f0f0f3",
  hairlineSoft: "#f5f5f7",
  hairlineStrong: "#dcdee0",
  ink: "#171717",
  body: "#60646c",
  muted: "#999999",
  mutedSoft: "#cccccc",
  onPrimary: "#ffffff",
  onDark: "#ffffff",
  primary: "#000000",
  primaryActive: "#1a1a1a",
  textLink: "#0d74ce",
  textLink2: "#476cff",
  success: "#16a34a",
  error: "#dc2626",
  warning: "#ab6400",
  info: "#0d74ce",
  critical: "#dc2626",
  trust0: "#dc2626",
  trust25: "#ea580c",
  trust50: "#ab6400",
  trust75: "#15803d",
  trust100: "#16a34a",
};

export const DS: Readonly<Record<ThemeMode, DesignTokens>> = {
  dark: DARK,
  light: LIGHT,
};

/** Read the active mode from the document. SSR-safe (defaults to dark). */
export function getActiveThemeMode(): ThemeMode {
  if (typeof document === "undefined") return "dark";
  const raw = document.documentElement.dataset.theme;
  return raw === "light" ? "light" : "dark";
}

export function getDesignTokens(mode: ThemeMode = getActiveThemeMode()): DesignTokens {
  return mode === "light" ? LIGHT : DARK;
}
