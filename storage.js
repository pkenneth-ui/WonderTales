const STORAGE_KEYS = {
  API_KEY: "wondertales_custom_gemini_key",
  FAVORITES: "wondertales_saved_stories",
  THEME: "wondertales_bedtime_theme",
  SPEECH_SPEED: "wondertales_speech_speed",
  STORY_LENGTH: "wondertales_story_length",
  LANGUAGE: "wondertales_language",
  FONT_SIZE: "wondertales_font_size"
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

export function clearFavoriteStories() {
  localStorage.removeItem(STORAGE_KEYS.FAVORITES);
}

export function getThemePreference() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
}

export function setThemePreference(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

// 🎚️ Speech Speed Preference (default 0.88)
export function getSpeechSpeed() {
  return parseFloat(localStorage.getItem(STORAGE_KEYS.SPEECH_SPEED)) || 0.88;
}

export function setSpeechSpeed(speed) {
  localStorage.setItem(STORAGE_KEYS.SPEECH_SPEED, speed);
}

// 📏 Story Length Preference (default "normal")
export function getStoryLength() {
  return localStorage.getItem(STORAGE_KEYS.STORY_LENGTH) || "normal";
}

export function setStoryLength(len) {
  localStorage.setItem(STORAGE_KEYS.STORY_LENGTH, len);
}

// 🌐 Language Preference (default "English")
export function getLanguagePreference() {
  return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "English";
}

export function setLanguagePreference(lang) {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
}

// 🔤 Font Size Preference (default "normal")
export function getFontSizePreference() {
  return localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || "normal";
}

export function setFontSizePreference(size) {
  localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
}
