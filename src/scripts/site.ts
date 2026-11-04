// Site-wide behaviors. State lives on <html> (set before paint by the inline
// script in BaseLayout): data-theme, data-mode, data-term, and .scrolled.

import {
  THEMES,
  DEFAULT_DARK,
  DEFAULT_LIGHT,
  THEME_KEY,
  TERM_KEY,
  INTRO_KEY,
} from "../data/themes";

const root = document.documentElement;

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
}

function stored(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// --- Theme -----------------------------------------------------------------

function applyTheme(id: string) {
  const theme = THEMES.find((t) => t.id === id);
  if (!theme) return;
  root.dataset.theme = theme.id;
  root.dataset.mode = theme.mode;
  root.classList.toggle("dark", theme.mode === "dark");
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-option]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.themeOption === id))
    );
}

applyTheme(root.dataset.theme ?? DEFAULT_DARK);

// Until someone picks a theme, follow the OS setting.
const lightQuery = window.matchMedia("(prefers-color-scheme: light)");
lightQuery.addEventListener("change", (e) => {
  if (!stored(THEME_KEY)) applyTheme(e.matches ? DEFAULT_LIGHT : DEFAULT_DARK);
});

const menu = document.querySelector<HTMLElement>("[data-theme-menu]");
const menuButton = menu?.querySelector<HTMLButtonElement>(
  "[data-theme-menu-button]"
);
const panel = menu?.querySelector<HTMLElement>("#theme-menu-panel");

function setMenuOpen(open: boolean) {
  if (!menuButton || !panel) return;
  panel.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  if (open) {
    panel
      .querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.focus();
  }
}

menuButton?.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

panel?.addEventListener("click", (e) => {
  const option = (e.target as Element).closest<HTMLButtonElement>(
    "[data-theme-option]"
  );
  if (!option?.dataset.themeOption) return;
  applyTheme(option.dataset.themeOption);
  store(THEME_KEY, option.dataset.themeOption);
  setMenuOpen(false);
  menuButton?.focus();
});

panel?.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const options = Array.from(
    panel.querySelectorAll<HTMLButtonElement>("[data-theme-option]")
  );
  const i = options.indexOf(document.activeElement as HTMLButtonElement);
  const next = e.key === "ArrowDown" ? i + 1 : i - 1;
  options[(next + options.length) % options.length]?.focus();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuButton.focus();
  }
});

document.addEventListener("click", (e) => {
  if (menu && !menu.contains(e.target as Node)) setMenuOpen(false);
});

menu?.addEventListener("focusout", (e) => {
  if (!menu.contains(e.relatedTarget as Node | null)) setMenuOpen(false);
});

// --- Full terminal -----------------------------------------------------------

const termSwitch = document.querySelector<HTMLButtonElement>(
  "[data-term-switch]"
);

function syncTermSwitch() {
  termSwitch?.setAttribute("aria-checked", String(root.dataset.term === "on"));
}

syncTermSwitch();

// The sweep plus the per-element cursor's rest on its last character.
const FLIP_MS = 1000;
let flipTimer: number | undefined;

termSwitch?.addEventListener("click", () => {
  const on = root.dataset.term !== "on";
  // Enables the cursor sweep; left off on page load so nothing animates then.
  root.classList.add("term-anim");
  // While the text rewrites, the sweeping cursors are the cursor: hide the
  // blinking one after the name until they're done.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("term-flipping");
    clearTimeout(flipTimer);
    flipTimer = window.setTimeout(() => root.classList.remove("term-flipping"), FLIP_MS);
  }
  root.dataset.term = on ? "on" : "off";
  store(TERM_KEY, root.dataset.term);
  syncTermSwitch();
});

// --- Hero name types itself out once per session --------------------------

if (root.classList.contains("type-intro") && document.querySelector(".hero__name")) {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    // No sessionStorage: it'll just type again next time.
  }
  // Long enough for the last character; then drop the intro styles.
  window.setTimeout(() => root.classList.remove("type-intro"), 2500);
}

// --- Full terminal: keep line breaks steady --------------------------------
// Geist Mono is ~20% wider than Geist, so text rewraps when it flips. For each
// weight, shrink the mono by the measured sans/mono width ratio (same size for
// the same style everywhere), then give each split element a small
// letter-spacing tweak so its total width matches the sans. Both are em-based,
// so they hold at any viewport size.

const SANS = "Geist";
const MONO = '"Geist Mono"';
const SAMPLE = "The quick brown fox jumps over the lazy dog, 2026.";
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

async function fitMono() {
  const ctx = document.createElement("canvas").getContext("2d");
  const splits = document.querySelectorAll<HTMLElement>(".split");
  if (!ctx || splits.length === 0) return;

  const weights = new Set(
    Array.from(splits, (el) => getComputedStyle(el).fontWeight).concat("400")
  );
  await Promise.all(
    [...weights].flatMap((w) => [
      document.fonts.load(`${w} 16px ${SANS}`),
      document.fonts.load(`${w} 16px ${MONO}`),
    ])
  );

  const width = (text: string, weight: string, size: number, family: string) => {
    ctx.font = `${weight} ${size}px ${family}`;
    return ctx.measureText(text).width;
  };

  // Don't shrink mono below 80%: past that it gets hard to read.
  const scale = new Map<string, number>();
  for (const w of weights) {
    scale.set(w, clamp(width(SAMPLE, w, 100, SANS) / width(SAMPLE, w, 100, MONO), 0.8, 1));
  }
  root.style.setProperty("--mono-k", String(scale.get("400")));

  splits.forEach((el) => {
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const k = scale.get(cs.fontWeight) ?? 1;
    const text = el.textContent ?? "";
    const n = Array.from(text).length;
    if (!n) return;
    const spacing = cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing);
    const target = width(text, cs.fontWeight, size, SANS) + n * spacing;
    const mono = width(text, cs.fontWeight, size * k, MONO);
    // Per-character tweak in ems of the mono size, kept subtle.
    const ls = clamp((target - mono) / n / (size * k), -0.04, 0.08);
    el.style.setProperty("--mono-size", `${k.toFixed(4)}em`);
    el.style.setProperty("--mono-ls", `${ls.toFixed(4)}em`);
  });
}

fitMono();

// --- Head moves into the nav on scroll ------------------------------------

const header = document.querySelector<HTMLElement>("[data-site-header]");
const heroHead = document.querySelector<HTMLElement>("[data-hero-head]");

if (header) {
  let observer: IntersectionObserver | undefined;

  const observe = () => {
    const h = header.offsetHeight;
    root.style.setProperty("--header-h", `${h}px`);
    if (!heroHead) return;
    observer?.disconnect();
    observer = new IntersectionObserver(
      ([entry]) => {
        // Only "scrolled" once the head has gone up under the header, not
        // when it's below the fold.
        const above = entry.boundingClientRect.top < h;
        root.classList.toggle("scrolled", !entry.isIntersecting && above);
      },
      { rootMargin: `-${h}px 0px 0px 0px` }
    );
    observer.observe(heroHead);
  };

  observe();
  // The header wraps at narrow widths, so its height (and the margin) changes.
  new ResizeObserver(observe).observe(header);
}
