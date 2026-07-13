const normalizeTheme = (theme) => {
  if (typeof theme !== "string") return "light";
  const value = theme.trim().toLowerCase();
  return value === "dark" ? "dark" : "light";
};

export function applyTheme(theme) {
  const normalized = normalizeTheme(theme);
  try {
    if (typeof document !== "undefined") {
      if (normalized === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.classList.remove("dark");
      }
    }
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("theme", normalized);
    }
  } catch (e) {
    // ignore
  }
}

export function initTheme() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("theme");
      const t = normalizeTheme(stored || "light");
      applyTheme(t);
    }
  } catch (e) {
    // ignore
  }
}

export function getStoredTheme() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return normalizeTheme(localStorage.getItem("theme") || "light");
    }
  } catch (e) {
    return "light";
  }
}
