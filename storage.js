const STORAGE_KEYS = {
  API_KEY: "wondertales_custom_gemini_key",
  FAVORITES: "wondertales_saved_stories",
  THEME: "wondertales_bedtime_theme"
};

export function getStoredApiKey() {
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || "";
}

export function setStoredApiKey(key) {
  if (!key) {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  } else {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  }
}

export function getFavoriteStories() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
  } catch {
    return [];
  }
}

export function saveStoryToFavorites(story) {
  const favorites = getFavoriteStories();
  const exists = favorites.some(f => f.title === story.title);
  if (!exists) {
    favorites.unshift({ ...story, savedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }
}

export function getThemePreference() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
}

export function setThemePreference(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}
