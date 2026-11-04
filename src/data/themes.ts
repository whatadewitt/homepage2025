// Theme ids, display names and swatch colors for the picker. The full token
// sets live in src/styles/global.css under [data-theme="<id>"].

export type ThemeMode = "dark" | "light";

export interface Theme {
  id: string;
  name: string;
  mode: ThemeMode;
  bg: string;
  accent: string;
}

export const THEMES: Theme[] = [
  { id: "wad-dark", name: "wad · dark", mode: "dark", bg: "#111111", accent: "#A78BFA" },
  { id: "wad-light", name: "wad · light", mode: "light", bg: "#F5F3FF", accent: "#0F766E" },
  { id: "tokyo-night", name: "tokyo night", mode: "dark", bg: "#1A1B26", accent: "#7AA2F7" },
  { id: "dracula", name: "dracula", mode: "dark", bg: "#282A36", accent: "#BD93F9" },
  { id: "latte", name: "catppuccin latte", mode: "light", bg: "#EFF1F5", accent: "#8436EB" },
];

export const DEFAULT_DARK = "wad-dark";
export const DEFAULT_LIGHT = "wad-light";

// localStorage keys
export const THEME_KEY = "dw-theme";
export const TERM_KEY = "dw-term";

// sessionStorage: the hero name has typed itself out this session.
export const INTRO_KEY = "dw-typed";
// sessionStorage: the terminal's open state, scrollback and history.
export const CONSOLE_KEY = "dw-console";
