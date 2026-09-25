import { GeminiService } from './api.js';
import { SpeechService } from './speech.js';
import { StorageService } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  let currentStory = null;
  let selectedAge = '6-8 years (Early Readers)';
  let currentFontSize = 18;
  let speechRate = 0.85;

  let gateNum1 = 0;
  let gateNum2 = 0;

  const form = document.getElementById('story-form');
  const charInput = document.getElementById('character-input');
  const themeSelect = document.getElementById('theme-select');
  const customThemeInput = document.getElementById('custom-theme-input');
  const moralSelect = document.getElementById('moral-select');
  const extraInput = document.getElementById('extra-input');
  const surpriseBtn = document.getElementById('surprise-btn');

  const emptyPlaceholder = document.getElementById('empty-placeholder');
  const loadingCard = document.getElementById('loading-card');
  const storyCard = document.getElementById('story-card');
  const storyTitle = document.getElementById('story-title');
  const storyParagraphs = document.getElementById('story-paragraphs');
  const storyMoral = document.getElementById('story-moral');
  const storyVocab = document.getElementById('story-vocab');
  const discussionQuestionsList = document.getElementById('discussion-questions');
  const storyAgeBadge = document.getElementById('story-age-badge');
  const storyThemeBadge = document.getElementById('story-theme-badge');

  const playAudioBtn = document.getElementById('play-audio-btn');
  const pauseAudioBtn = document.getElementById('pause-audio-btn');
  const stopAudioBtn = document.getElementById('stop-audio-btn');
  const voiceSelect = document.getElementById('voice-select');
  const speedToggleBtn = document.getElementById('speed-toggle-btn');

  const fontIncreaseBtn = document.getElementById('font-increase-btn');
  const fontDecreaseBtn = document.getElementById('font-decrease-btn');

  const libraryDrawer = document.getElementById('library-drawer');
  const openLibraryBtn = document.getElementById('open-library-btn');
  const closeLibraryBtn = document.getElementById('close-library-btn');
  const libraryList = document.getElementById('library-list');
  const libraryCountBadge = document.getElementById('library-count-badge');

  const settingsModal = document.getElementById('settings-modal');
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveApiKeyBtn = document.getElementById('save-api-key-btn');
  const clearApiKeyBtn = document.getElementById('clear-api-key-btn');
  const apiKeyStatusBadge = document.getElementById('api-key-status-badge');

  const safetyBadgeBtn = document.getElementById('safety-badge-btn');
  const safetyModal = document.getElementById('safety-modal');
  const closeSafetyBtn = document.getElementById('close-safety-btn');
  const confirmSafetyBtn = document.getElementById('confirm-safety-btn');

  const parentGateModal = document.getElementById('parent-gate-modal');
  const gateQuestion = document.getElementById('gate-question');
  const gateAnswerInput = document.getElementById('gate-answer-input');
  const verifyGateBtn = document.getElementById('verify-gate-btn');
  const closeGateBtn = document.getElementById('close-gate-btn');

  SpeechService.initVoices((voices) => {
    if (!voiceSelect) return;
    voiceSelect.innerHTML = '';
    voices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${v.name.split(' ')[0]} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
  });

  voiceSelect?.addEventListener('change', (e) => {
    SpeechService.setVoice(parseInt(e.target.value));
  });

  function updateApiKeyBadge() {
    if (!apiKeyStatusBadge) return;
    const key = StorageService.getApiKey();
    if (key) {
      apiKeyStatusBadge.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/40';
      apiKeyStatusBadge.textContent = '✨ Gemini AI Active';
    } else {
      apiKeyStatusBadge.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/40';
      apiKeyStatusBadge.textContent = '⚡ Demo Mode';
    }
  }

  function updateLibraryUI() {
    if (!libraryList || !libraryCountBadge) return;
    const stories = StorageService.getStories();
    libraryCountBadge.textContent = stories.length;
    libraryList.innerHTML = '';

    if (stories.length === 0) {
      libraryList.innerHTML = '<p class="text-xs text-gray-400 text-center py-8">No saved stories yet.</p>';
      return;
    }

    stories.forEach(s => {
      const item = document.createElement('div');
      item.className = 'p-3 rounded-xl border bg-amber-50/60 hover:bg-amber-100/60 cursor-pointer transition flex justify-between items-start';
      item.innerHTML = `
        <div class="pr-2">
          <h4 class="font-bold text-xs text-gray-900 line-clamp-1">${s.title}</h4>
          <p class="text-[11px] text-gray-500 mt-0.5">${s.theme} • ${s.ageGroup ? s.ageGroup.split(' ')[0] : ''}</p>
        </div>
        <button class="text-gray-400 hover:text-red-500 font-bold text-sm delete-btn">&times;</button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        currentStory = s;
        renderStory(s);
        libraryDrawer?.classList.add('translate-x-full');
      });

      item.querySelector('.delete-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const updated = StorageService.getStories().filter(story => story.id !== s.id);
        localStorage.setItem('wondertales_stories', JSON.stringify(updated));
        updateLibraryUI();
      });

      libraryList.appendChild(item);
    });
  }

  document.querySelectorAll('.age-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.age-pill').forEach(b => {
        b.classList.remove('btn-pill-active');
        b.classList.add('border', 'border-white/20', 'text-white');
      });
      btn.classList.add('btn-pill-active');
      btn.classList.remove('border', 'border-white/20', 'text-white');
      selectedAge = btn.dataset.age;
    });
  });

  themeSelect?.addEventListener('change', () => {
    if (customThemeInput) {
      if (themeSelect.value === 'custom') {
        customThemeInput.classList.remove('hidden');
      } else {
        customThemeInput.classList.add('hidden');
      }
    }
  });

  surpriseBtn?.addEventListener('click', () => {
    const presets = [
      { char: 'Barnaby the Brave Bunny', theme: 'Enchanted Whispering Woods', moral: 'Kindness and helping friends', extra: 'Carries a leaf backpack' },
      { char: 'Cosmo the Star-Pup', theme: 'The Sparkling Milky Way', moral: 'Courage to overcome fears', extra: 'Glowing star paws' },
      { char: 'Finley the Flying Fish', theme: 'The Great Coral Reef Kingdom', moral: 'Sharing and generosity', extra: 'Glides across sea waves' }
    ];
    const p = presets[Math.floor(Math.random() * presets.length)];
    if (charInput) charInput.value = p.char;
    if (themeSelect) themeSelect.value = p.theme;
    if (moralSelect) moralSelect.value = p.moral;
    if (extraInput) extraInput.value = p.extra;
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    emptyPlaceholder?.classList.add('hidden');
    storyCard?.classList.add('hidden');
    loadingCard?.classList.remove('hidden');
    SpeechService.stop();

    const theme = themeSelect?.value === 'custom' ? (customThemeInput?.value || 'Magical World') : (themeSelect?.value || 'Enchanted Woods');
    const apiKey = StorageService.getApiKey();

    try {
      const story = await GeminiService.generateStory({
        character: charInput ? charInput.value : 'Hero',
        theme,
        ageGroup: selectedAge,
        moral: moralSelect ? moralSelect.value : 'Kindness',
        extra: extraInput ? extraInput.value : ''
      }, apiKey);

      currentStory = story;
      renderStory(story);
      StorageService.saveStory(story);
      updateLibraryUI();

      if (typeof confetti === 'function') {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      }

    } catch (err) {
      alert('Generation error: ' + err.message);
    } finally {
      loadingCard?.classList.add('hidden');
    }
  });

  function renderStory(story) {
    if (!storyCard) return;
    storyCard.classList.remove('hidden');
    if (storyTitle) storyTitle.textContent = story.title;
    if (storyAgeBadge) storyAgeBadge.textContent = story.ageGroup ? story.ageGroup.split(' ')[0] : 'Kids';
    if (storyThemeBadge) storyThemeBadge.textContent = story.theme;
    if (storyMoral) storyMoral.textContent = story.moral;

    if (storyParagraphs) {
      storyParagraphs.innerHTML = '';
      storyParagraphs.style.fontSize = `${currentFontSize}px`;
      story.paragraphs.forEach(p => {
        const pEl = document.createElement('p');
        pEl.className = 'bg-amber-50/50 p-4 rounded-2xl border border-amber-100/70 shadow-xs';
        pEl.textContent = p;
        storyParagraphs.appendChild(pEl);
      });
    }

    if (storyVocab) {
      storyVocab.innerHTML = '';
      (story.funVocabulary || []).forEach(v => {
        const div = document.createElement('div');
        div.className = 'p-2.5 bg-white rounded-xl border border-indigo-100 shadow-xs';
        div.innerHTML = `<strong>✨ ${v.word}</strong>: ${v.definition}`;
        storyVocab.appendChild(div);
      });
    }

    if (discussionQuestionsList) {
      discussionQuestionsList.innerHTML = '';
      (story.discussionQuestions || []).forEach(q => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-indigo-100';
        li.innerHTML = `<span>💬</span> <span>${q}</span>`;
        discussionQuestionsList.appendChild(li);
      });
    }
  }

  speedToggleBtn?.addEventListener('click', () => {
    if (speechRate === 0.85) {
      speechRate = 1.05;
      speedToggleBtn.textContent = '🐇 Normal';
    } else {
      speechRate = 0.85;
      speedToggleBtn.textContent = '🐢 Slow';
    }
  });

  fontIncreaseBtn?.addEventListener('click', () => {
    if (currentFontSize < 26 && storyParagraphs) {
      currentFontSize += 2;
      storyParagraphs.style.fontSize = `${currentFontSize}px`;
    }
  });

  fontDecreaseBtn?.addEventListener('click', () => {
    if (currentFontSize > 14 && storyParagraphs) {
      currentFontSize -= 2;
      storyParagraphs.style.fontSize = `${currentFontSize}px`;
    }
  });

  playAudioBtn?.addEventListener('click', () => {
    if (!currentStory) return;
    const text = `${currentStory.title}. ${currentStory.paragraphs.join(' ')}. The moral is: ${currentStory.moral}`;
    SpeechService.speak(text, 
      () => { 
        playAudioBtn.classList.add('hidden'); 
        pauseAudioBtn?.classList.remove('hidden'); 
      },
      () => { 
        playAudioBtn.classList.remove('hidden'); 
        pauseAudioBtn?.classList.add('hidden'); 
      }
    );
  });

  pauseAudioBtn?.addEventListener('click', () => {
    SpeechService.pause();
    playAudioBtn?.classList.remove('hidden');
    pauseAudioBtn.classList.add('hidden');
  });

  stopAudioBtn?.addEventListener('click', () => {
    SpeechService.stop();
    playAudioBtn?.classList.remove('hidden');
    pauseAudioBtn?.classList.add('hidden');
  });

  document.getElementById('copy-story-btn')?.addEventListener('click', () => {
    if (!currentStory) return;
    navigator.clipboard.writeText(`${currentStory.title}\n\n${currentStory.paragraphs.join('\n\n')}\n\nMoral: ${currentStory.moral}`);
    alert('Story copied to clipboard!');
  });

  document.getElementById('download-story-btn')?.addEventListener('click', () => {
    if (!currentStory) return;
    const content = `${currentStory.title}\n\n${currentStory.paragraphs.join('\n\n')}\n\nMoral: ${currentStory.moral}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentStory.title.replace(/\s+/g, '_')}.txt`;
    a.click();
  });

  document.getElementById('print-story-btn')?.addEventListener('click', () => window.print());

  openLibraryBtn?.addEventListener('click', () => {
    updateLibraryUI();
    libraryDrawer?.classList.remove('translate-x-full');
  });

  closeLibraryBtn?.addEventListener('click', () => {
    libraryDrawer?.classList.add('translate-x-full');
  });

  openSettingsBtn?.addEventListener('click', () => {
    gateNum1 = Math.floor(Math.random() * 8) + 2;
    gateNum2 = Math.floor(Math.random() * 8) + 2;
    if (gateQuestion) gateQuestion.textContent = `What is ${gateNum1} + ${gateNum2}?`;
    if (gateAnswerInput) gateAnswerInput.value = '';
    parentGateModal?.classList.remove('hidden');
  });

  closeGateBtn?.addEventListener('click', () => {
    parentGateModal?.classList.add('hidden');
  });

  verifyGateBtn?.addEventListener('click', () => {
    const ans = parseInt(gateAnswerInput.value);
    if (ans === (gateNum1 + gateNum2)) {
      parentGateModal?.classList.add('hidden');
      if (apiKeyInput) apiKeyInput.value = StorageService.getApiKey();
      settingsModal?.classList.remove('hidden');
    } else {
      alert('Incorrect answer. Settings are protected for parents & teachers.');
    }
  });

  closeSettingsBtn?.addEventListener('click', () => settingsModal?.classList.add('hidden'));

  saveApiKeyBtn?.addEventListener('click', () => {
    if (apiKeyInput) StorageService.saveApiKey(apiKeyInput.value);
    settingsModal?.classList.add('hidden');
    updateApiKeyBadge();
    alert('API Key saved!');
  });

  clearApiKeyBtn?.addEventListener('click', () => {
    StorageService.saveApiKey('');
    if (apiKeyInput) apiKeyInput.value = '';
    updateApiKeyBadge();
    alert('API Key cleared. Switched to Demo Mode.');
  });

  safetyBadgeBtn?.addEventListener('click', () => safetyModal?.classList.remove('hidden'));
  closeSafetyBtn?.addEventListener('click', () => safetyModal?.classList.add('hidden'));
  confirmSafetyBtn?.addEventListener('click', () => safetyModal?.classList.add('hidden'));

  updateApiKeyBadge();
  updateLibraryUI();
});
