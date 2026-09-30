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
  try {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || "";
  } catch {
    return "";
  }
}

export function setStoredApiKey(key) {
  try {
    if (!key) {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    } else {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
    }
  } catch (e) {
    console.warn("Storage error saving API key:", e);
  }
}

export function getFavoriteStories() {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function saveStoryToFavorites(story) {
  try {
    const favorites = getFavoriteStories();
    const exists = favorites.some(f => f.title === story.title);
    if (!exists) {
      favorites.unshift({ ...story, savedAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  } catch (e) {
    console.warn("Storage error saving favorite:", e);
  }
}

export function clearFavoriteStories() {
  try {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  } catch (e) {
    console.warn("Storage error clearing favorites:", e);
  }
}

export function getThemePreference() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  } catch {
    return "light";
  }
}

export function setThemePreference(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.warn("Storage error saving theme:", e);
  }
}

export function getSpeechSpeed() {
  try {
    const val = parseFloat(localStorage.getItem(STORAGE_KEYS.SPEECH_SPEED));
    return !isNaN(val) && val > 0 ? val : 0.88;
  } catch {
    return 0.88;
  }
}

export function setSpeechSpeed(speed) {
  try {
    localStorage.setItem(STORAGE_KEYS.SPEECH_SPEED, speed);
  } catch (e) {
    console.warn("Storage error saving speech speed:", e);
  }
}

export function getStoryLength() {
  try {
    return localStorage.getItem(STORAGE_KEYS.STORY_LENGTH) || "normal";
  } catch {
    return "normal";
  }
}

export function setStoryLength(len) {
  try {
    localStorage.setItem(STORAGE_KEYS.STORY_LENGTH, len);
  } catch (e) {
    console.warn("Storage error saving story length:", e);
  }
}

export function getLanguagePreference() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "English";
  } catch {
    return "English";
  }
}

export function setLanguagePreference(lang) {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (e) {
    console.warn("Storage error saving language:", e);
  }
}

export function getFontSizePreference() {
  try {
    return localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || "normal";
  } catch {
    return "normal";
  }
}

export function setFontSizePreference(size) {
  try {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
  } catch (e) {
    console.warn("Storage error saving font size:", e);
  }
}
