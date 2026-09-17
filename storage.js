export const StorageService = {
  getApiKey() {
    return localStorage.getItem('wondertales_api_key') || '';
  },
  saveApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem('wondertales_api_key', key.trim());
    } else {
      localStorage.removeItem('wondertales_api_key');
    }
  },
  getStories() {
    try {
      const data = localStorage.getItem('wondertales_stories');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveStory(story) {
    const stories = this.getStories();
    const newStory = { id: 'story_' + Date.now(), ...story };
    stories.unshift(newStory);
    localStorage.setItem('wondertales_stories', JSON.stringify(stories.slice(0, 20)));
    return newStory;
  }
};