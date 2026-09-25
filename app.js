import { generateStory } from "./api.js";
import { 
  initSpeech, 
  speakStory, 
  pauseSpeech, 
  resumeSpeech, 
  stopSpeech, 
  isSpeaking, 
  isPaused, 
  getVoices, 
  setVoice, 
  setSpeechRate 
} from "./speech.js";
import { 
  saveStoryToFavorites, 
  getFavoriteStories, 
  clearFavoriteStories,
  getThemePreference, 
  setThemePreference, 
  getStoredApiKey, 
  setStoredApiKey,
  getSpeechSpeed,
  setSpeechSpeed,
  getStoryLength,
  setStoryLength,
  getLanguagePreference,
  setLanguagePreference,
  getFontSizePreference,
  setFontSizePreference
} from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
  initSpeech();

  // State
  let selectedAge = "3-5";
  let selectedTheme = "Adventure & Bravery";
  let selectedWorld = "Whispering Enchanted Forest";
  let selectedMoral = "Helping Others & Empathy";
  let currentStoryData = null;
  let parentalSolution = null;

  // Surprise Me data pools
  const allThemes = [
    { val: "Adventure & Bravery", label: "🌟 Adventure & Bravery" },
    { val: "Friendship & Kindness", label: "🤝 Friendship & Kindness" },
    { val: "Curiosity & Discovery", label: "🔍 Curiosity & Discovery" },
    { val: "Magic & Fantasy", label: "✨ Magic & Fantasy" },
    { val: "Animal Adventures", label: "🐾 Animal Adventures" }
  ];
  const allWorlds = [
    { val: "Whispering Enchanted Forest", label: "🌳 Whispering Enchanted Forest" },
    { val: "Cosmic Starlight Galaxy", label: "🪐 Cosmic Starlight Galaxy" },
    { val: "Deep Coral Ocean Kingdom", label: "🐠 Deep Coral Ocean Kingdom" },
    { val: "Fluffy Cloud City", label: "☁️ Fluffy Cloud City" },
    { val: "Cozy Backyard Jungle", label: "🏡 Cozy Backyard Jungle" }
  ];
  const allMorals = [
    { val: "Helping Others & Empathy", label: "💖 Helping Others & Empathy" },
    { val: "Honesty & Telling the Truth", label: "💎 Honesty & Telling the Truth" },
    { val: "Never Giving Up (Perseverance)", label: "🧗 Never Giving Up" },
    { val: "Sharing & Teamwork", label: "🤝 Sharing & Teamwork" },
    { val: "Courage in New Situations", label: "🦁 Courage in New Situations" }
  ];
  const allAges = ["3-5", "6-8", "9-12"];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // DOM elements
  const storyForm = document.getElementById("storyForm");
  const generateBtn = document.getElementById("generateBtn");
  const storyContentArea = document.getElementById("storyContentArea");
  const audioControlsBar = document.getElementById("audioControlsBar");
  const actionButtonsBar = document.getElementById("actionButtonsBar");
  const readAloudBtn = document.getElementById("readAloudBtn");
  const readAloudLabel = document.getElementById("readAloudLabel");
  const stopAudioBtn = document.getElementById("stopAudioBtn");
  const voiceSelect = document.getElementById("voiceSelect");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");

  // 🔤 Apply Font Size to Story Area
  function applyStoryFontSize(size) {
    if (!storyContentArea) return;
    storyContentArea.classList.remove("text-base", "text-lg", "text-xl", "text-2xl");
    if (size === "large") storyContentArea.classList.add("text-xl");
    else if (size === "xlarge") storyContentArea.classList.add("text-2xl");
    else storyContentArea.classList.add("text-base");
  }

  applyStoryFontSize(getFontSizePreference());

  // Font size buttons inside Settings
  document.querySelectorAll(".font-size-btn").forEach(btn => {
    if (btn.dataset.size === getFontSizePreference()) {
      btn.classList.add("bg-amber-100", "border-amber-400", "text-amber-800");
    }
    btn.addEventListener("click", () => {
      document.querySelectorAll(".font-size-btn").forEach(b => {
        b.classList.remove("bg-amber-100", "border-amber-400", "text-amber-800");
      });
      btn.classList.add("bg-amber-100", "border-amber-400", "text-amber-800");
      setFontSizePreference(btn.dataset.size);
      applyStoryFontSize(btn.dataset.size);
    });
  });

  // Narration Speed Slider
  const speedSlider = document.getElementById("speechSpeedSlider");
  const speedLabel = document.getElementById("speedValueLabel");
  if (speedSlider && speedLabel) {
    speedSlider.value = getSpeechSpeed();
    speedLabel.textContent = `${parseFloat(speedSlider.value).toFixed(1)}x`;
    speedSlider.addEventListener("input", (e) => {
      speedLabel.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
    });
  }

  // Age group selector
  document.querySelectorAll(".age-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".age-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedAge = btn.dataset.age;
    });
  });

  // Dropdown helper
  function setupDropdown(btnId, menuId, labelId, onSelect) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    const label = document.getElementById(labelId);
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".custom-dropdown-menu").forEach(m => {
        if (m !== menu) m.classList.remove("open");
      });
      menu?.classList.toggle("open");
    });
    menu?.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        if (label) label.textContent = item.textContent.trim();
        menu.classList.remove("open");
        onSelect(item.dataset.val);
      });
    });
  }

  setupDropdown("themeDropdownBtn", "themeDropdownMenu", "themeSelectedLabel", v => selectedTheme = v);
  setupDropdown("worldDropdownBtn", "worldDropdownMenu", "worldSelectedLabel", v => selectedWorld = v);
  setupDropdown("moralDropdownBtn", "moralDropdownMenu", "moralSelectedLabel", v => selectedMoral = v);

  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-dropdown-menu").forEach(m => m.classList.remove("open"));
  });

  // 🎲 Surprise Me! Button
  document.getElementById("surpriseMeBtn")?.addEventListener("click", () => {
    const rTheme = pick(allThemes);
    const rWorld = pick(allWorlds);
    const rMoral = pick(allMorals);
    const rAge = pick(allAges);

    selectedTheme = rTheme.val;
    selectedWorld = rWorld.val;
    selectedMoral = rMoral.val;
    selectedAge = rAge;

    document.getElementById("themeSelectedLabel").textContent = rTheme.label;
    document.getElementById("worldSelectedLabel").textContent = rWorld.label;
    document.getElementById("moralSelectedLabel").textContent = rMoral.label;

    document.querySelectorAll(".age-btn").forEach(b => {
      b.classList.remove("active");
      if (b.dataset.age === rAge) b.classList.add("active");
    });

    if (window.confetti) {
      window.confetti({ particleCount: 40, spread: 50, origin: { y: 0.3 } });
    }
  });

  // Bedtime Theme Switcher
  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark");
      themeIcon?.classList.replace("fa-sun", "fa-moon");
    } else {
      document.body.classList.remove("dark");
      themeIcon?.classList.replace("fa-moon", "fa-sun");
    }
  }

  applyTheme(getThemePreference());

  themeToggleBtn?.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    setThemePreference(newTheme);
    applyTheme(newTheme);
  });

  // Voice population
  setTimeout(() => {
    const voices = getVoices();
    if (voiceSelect && voices.length > 0) {
      voiceSelect.innerHTML = `<option value="">🎙️ Warm Teacher Voice (Auto)</option>`;
      voices.forEach((v, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(opt);
      });
      voiceSelect.addEventListener("change", (e) => {
        setVoice(e.target.value === "" ? null : parseInt(e.target.value));
      });
    }
  }, 600);

  // Form Submission
  storyForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const childName = document.getElementById("childName")?.value.trim();
    if (!childName) return;

    generateBtn.disabled = true;
    generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>✨ Weaving Magic...</span>`;
    stopSpeech();

    storyContentArea.innerHTML = `
      <div class="py-20 text-center animate-pulse">
        <div class="text-5xl mb-4">🪄</div>
        <p class="font-heading text-2xl font-bold text-purple-600 dark:text-purple-300">Writing a magical adventure for ${childName}...</p>
        <p class="text-sm text-slate-400 mt-2 font-semibold">Gathering playful words & heartwarming lessons...</p>
      </div>
    `;

    try {
      const story = await generateStory({ childName, ageGroup: selectedAge, theme: selectedTheme, world: selectedWorld, moralLesson: selectedMoral });
      currentStoryData = story;
      renderStory(story);
      if (window.confetti) window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      audioControlsBar?.classList.remove("hidden");
      actionButtonsBar?.classList.remove("hidden");
    } catch (err) {
      storyContentArea.innerHTML = `
        <div class="py-12 text-center text-rose-500">
          <div class="text-4xl mb-3">⚠️</div>
          <h4 class="font-heading text-xl font-bold">Oops! Magic Hiccup</h4>
          <p class="text-sm max-w-sm mx-auto mt-1 font-semibold">${err.message}</p>
        </div>
      `;
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i><span>✨ Create My Story!</span>`;
    }
  });

  // Render Story
  function renderStory(story) {
    const paragraphsHtml = story.paragraphs.map(p => `
      <p class="text-lg sm:text-xl leading-relaxed text-slate-800 dark:text-slate-100 mb-5 font-medium">${p}</p>
    `).join("");

    const vocabHtml = (story.funVocabulary || []).map(v => `
      <span class="inline-block px-3.5 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 rounded-2xl text-sm font-bold mr-2 mb-2 shadow-sm border border-amber-200">
        💡 ${v.word}: <span class="font-normal opacity-90">${v.meaning}</span>
      </span>
    `).join("");

    const questionsHtml = (story.discussionQuestions || []).map(q => `
      <li class="text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-2 font-semibold">• ${q}</li>
    `).join("");

    storyContentArea.innerHTML = `
      <div class="w-full text-left">
        ${story.soundEffect ? `<div class="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-purple-700 dark:text-purple-200 rounded-full text-sm font-bold mb-4 shadow-sm">✨ ${story.soundEffect}</div>` : ""}
        <h1 class="font-heading text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-6">${story.title}</h1>
        <div class="story-body mb-8">${paragraphsHtml}</div>
        <div class="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-3xl border-2 border-amber-200 dark:border-amber-900/60 mb-6 shadow-sm">
          <div class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1.5">🌱 Moral Lesson</div>
          <p class="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-100">${story.moral}</p>
        </div>
        ${vocabHtml ? `<div class="mb-6"><div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Vocabulary Explorer</div><div class="flex flex-wrap">${vocabHtml}</div></div>` : ""}
        ${questionsHtml ? `<div class="p-5 bg-purple-50/70 dark:bg-slate-700/50 rounded-3xl border-2 border-purple-100 dark:border-slate-700 mb-2 shadow-sm"><div class="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 mb-2.5">Chat About the Story</div><ul class="list-none">${questionsHtml}</ul></div>` : ""}
      </div>
    `;
  }

  // Audio Controls
  readAloudBtn?.addEventListener("click", () => {
    if (!currentStoryData) return;
    if (isSpeaking()) { pauseSpeech(); readAloudLabel.textContent = "Resume"; return; }
    if (isPaused()) { resumeSpeech(); readAloudLabel.textContent = "Pause"; return; }
    const fullText = `${currentStoryData.title}. ${currentStoryData.paragraphs.join(" ")} The moral: ${currentStoryData.moral}`;
    speakStory(fullText, () => { readAloudLabel.textContent = "Pause"; }, () => { readAloudLabel.textContent = "Read Aloud"; });
  });

  stopAudioBtn?.addEventListener("click", () => { stopSpeech(); readAloudLabel.textContent = "Read Aloud"; });

  // Save / Print / Copy
  document.getElementById("saveStoryBtn")?.addEventListener("click", () => {
    if (currentStoryData) { saveStoryToFavorites(currentStoryData); alert("Story saved to your device's favorites! 🌟"); }
  });
  document.getElementById("printStoryBtn")?.addEventListener("click", () => window.print());
  document.getElementById("copyStoryBtn")?.addEventListener("click", () => {
    if (!currentStoryData) return;
    const text = `${currentStoryData.title}\n\n${currentStoryData.paragraphs.join("\n\n")}\n\nMoral: ${currentStoryData.moral}`;
    navigator.clipboard.writeText(text);
    alert("Story copied to clipboard! 📋");
  });

  // 📖 History Modal
  const historyModal = document.getElementById("historyModal");
  const historyList = document.getElementById("historyList");

  document.getElementById("historyBtn")?.addEventListener("click", () => {
    const favorites = getFavoriteStories();
    if (favorites.length === 0) {
      historyList.innerHTML = `<p class="text-sm text-slate-400 text-center py-6 font-semibold">No saved stories yet! Generate your first story and click 💾 Save to Favorites.</p>`;
    } else {
      historyList.innerHTML = favorites.map((s, i) => `
        <div class="p-4 bg-slate-50 dark:bg-slate-700/60 rounded-2xl border-2 border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-amber-50 dark:hover:bg-slate-700 transition-all" data-index="${i}">
          <div class="font-heading text-base font-bold text-slate-800 dark:text-white mb-1">${s.title}</div>
          <div class="text-xs text-slate-400 font-semibold">${new Date(s.savedAt).toLocaleDateString()}</div>
          <div class="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium line-clamp-2">${s.paragraphs?.[0] || ""}</div>
        </div>
      `).join("");

      historyList.querySelectorAll("[data-index]").forEach(card => {
        card.addEventListener("click", () => {
          const story = favorites[parseInt(card.dataset.index)];
          currentStoryData = story;
          renderStory(story);
          audioControlsBar?.classList.remove("hidden");
          actionButtonsBar?.classList.remove("hidden");
          historyModal?.classList.add("hidden");
        });
      });
    }
    historyModal?.classList.remove("hidden");
  });

  document.getElementById("closeHistoryBtn")?.addEventListener("click", () => historyModal?.classList.add("hidden"));

  // Parental Gate & Settings
  const parentalModal = document.getElementById("parentalModal");
  const settingsModal = document.getElementById("settingsModal");
  const privacyModal = document.getElementById("privacyModal");

  document.getElementById("settingsBtn")?.addEventListener("click", () => {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 8) + 2;
    parentalSolution = num1 + num2;
    document.getElementById("parentalMathQuestion").textContent = `${num1} + ${num2} = ?`;
    document.getElementById("parentalMathAnswer").value = "";
    parentalModal?.classList.remove("hidden");
  });

  document.getElementById("cancelParentalBtn")?.addEventListener("click", () => parentalModal?.classList.add("hidden"));
  document.getElementById("submitParentalBtn")?.addEventListener("click", () => {
    const ans = parseInt(document.getElementById("parentalMathAnswer")?.value);
    if (ans === parentalSolution) {
      parentalModal?.classList.add("hidden");
      
      document.getElementById("customApiKeyInput").value = getStoredApiKey();
      
      const speedVal = getSpeechSpeed();
      const speedSliderInput = document.getElementById("speechSpeedSlider");
      if (speedSliderInput) speedSliderInput.value = speedVal;
      const speedValLabel = document.getElementById("speedValueLabel");
      if (speedValLabel) speedValLabel.textContent = `${speedVal.toFixed(1)}x`;

      const lenSelect = document.getElementById("storyLengthSelect");
      if (lenSelect) lenSelect.value = getStoryLength();

      const langSelect = document.getElementById("languageSelect");
      if (langSelect) langSelect.value = getLanguagePreference();

      settingsModal?.classList.remove("hidden");
    } else {
      alert("Oops! That's not quite right. Try again!");
    }
  });

  document.getElementById("closeSettingsBtn")?.addEventListener("click", () => settingsModal?.classList.add("hidden"));
  
  // Save All Settings
  document.getElementById("saveCustomKeyBtn")?.addEventListener("click", () => {
    const key = document.getElementById("customApiKeyInput")?.value.trim();
    const speed = parseFloat(document.getElementById("speechSpeedSlider")?.value) || 0.88;
    const length = document.getElementById("storyLengthSelect")?.value;
    const lang = document.getElementById("languageSelect")?.value;

    setStoredApiKey(key);
    setSpeechSpeed(speed);
    setSpeechRate(speed);
    setStoryLength(length);
    setLanguagePreference(lang);

    settingsModal?.classList.add("hidden");
    alert("All preferences saved securely! 🌟");
  });

  // 🗑️ Clear Favorites handler
  document.getElementById("clearFavoritesBtn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all saved favorite stories?")) {
      clearFavoriteStories();
      alert("All saved stories cleared! 🧹");
    }
  });

  document.getElementById("privacyBtn")?.addEventListener("click", () => privacyModal?.classList.remove("hidden"));
  document.getElementById("closePrivacyBtn")?.addEventListener("click", () => privacyModal?.classList.add("hidden"));
});
