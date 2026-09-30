import { getSpeechSpeed } from "./storage.js";

let currentUtterance = null;
let availableVoices = [];
let selectedVoiceIndex = null;
let currentSpeechRate = getSpeechSpeed();

// Internal state tracking to fix browser desync
let isExplicitlyPaused = false;
let lastSpokenText = "";
let lastOnStart = null;
let lastOnEnd = null;
let lastOnBoundary = null;

export function initSpeech() {
  if (!("speechSynthesis" in window)) return;
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
}

function loadVoices() {
  if (!("speechSynthesis" in window)) return [];
  availableVoices = speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
  return availableVoices;
}

export function getVoices() {
  if (availableVoices.length === 0) loadVoices();
  return availableVoices;
}

export function setVoice(index) {
  selectedVoiceIndex = index;
}

export function setSpeechRate(rate) {
  currentSpeechRate = parseFloat(rate) || 0.88;
}

function pickFriendlyVoice() {
  if (selectedVoiceIndex !== null && availableVoices[selectedVoiceIndex]) {
    return availableVoices[selectedVoiceIndex];
  }
  const preferred = [
    "Google US English",
    "Samantha",
    "Natural",
    "Jenny",
    "Zira",
    "Victoria",
    "Karen",
    "Google UK English Female"
  ];
  for (const name of preferred) {
    const match = availableVoices.find(v => v.name.includes(name));
    if (match) return match;
  }
  const nonRobotic = availableVoices.find(v => 
    !v.name.toLowerCase().includes("david") && 
    !v.name.toLowerCase().includes("desktop")
  );
  return nonRobotic || availableVoices[0] || null;
}

export function speakStory(text, onStart, onEnd, onBoundary) {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech is not supported in this browser.");
    return;
  }
  stopSpeech();

  // Save references for seamless resume if Chrome drops the utterance
  lastSpokenText = text;
  lastOnStart = onStart;
  lastOnEnd = onEnd;
  lastOnBoundary = onBoundary;
  isExplicitlyPaused = false;

  currentUtterance = new SpeechSynthesisUtterance(text);
  
  // Attach to window to prevent Chrome V8 garbage collection
  window._wonderTalesUtterance = currentUtterance;

  const voice = pickFriendlyVoice();
  if (voice) currentUtterance.voice = voice;

  currentUtterance.pitch = 1.08;
  currentUtterance.rate = currentSpeechRate;

  currentUtterance.onstart = () => {
    isExplicitlyPaused = false;
    if (onStart) onStart();
  };

  currentUtterance.onend = () => {
    isExplicitlyPaused = false;
    window._wonderTalesUtterance = null;
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance.onerror = (e) => {
    console.warn("Speech error or cancelled:", e);
    isExplicitlyPaused = false;
    window._wonderTalesUtterance = null;
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  if (onBoundary) {
    currentUtterance.onboundary = (e) => {
      if (e.name === "word") onBoundary(e.charIndex);
    };
  }

  speechSynthesis.speak(currentUtterance);
}

export function pauseSpeech() {
  if (!("speechSynthesis" in window)) return;
  isExplicitlyPaused = true;
  speechSynthesis.pause();
}

export function resumeSpeech() {
  if (!("speechSynthesis" in window)) return;

  isExplicitlyPaused = false;

  // 1. If the browser still has the utterance paused in queue
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    
    // Chromium bug workaround: double-kick resume
    setTimeout(() => {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }
    }, 50);
  } 
  // 2. If Chrome canceled/dropped the utterance while paused, restart speaking
  else if (!speechSynthesis.speaking && lastSpokenText) {
    speakStory(lastSpokenText, lastOnStart, lastOnEnd, lastOnBoundary);
  }
}

export function stopSpeech() {
  if ("speechSynthesis" in window) {
    isExplicitlyPaused = false;
    speechSynthesis.cancel();
    window._wonderTalesUtterance = null;
    currentUtterance = null;
  }
}

export function isSpeaking() {
  if (!("speechSynthesis" in window)) return false;
  return speechSynthesis.speaking && !speechSynthesis.paused && !isExplicitlyPaused;
}

export function isPaused() {
  if (!("speechSynthesis" in window)) return false;
  return isExplicitlyPaused || speechSynthesis.paused;
}
