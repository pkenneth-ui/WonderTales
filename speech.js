import { getSpeechSpeed } from "./storage.js";

let currentUtterance = null;
let availableVoices = [];
let selectedVoiceIndex = null;
let currentSpeechRate = getSpeechSpeed();

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

  currentUtterance = new SpeechSynthesisUtterance(text);
  const voice = pickFriendlyVoice();
  if (voice) currentUtterance.voice = voice;

  currentUtterance.pitch = 1.08;
  currentUtterance.rate = currentSpeechRate;

  if (onStart) currentUtterance.onstart = onStart;
  if (onEnd) currentUtterance.onend = onEnd;
  currentUtterance.onerror = () => { if (onEnd) onEnd(); };

  if (onBoundary) {
    currentUtterance.onboundary = (e) => {
      if (e.name === "word") onBoundary(e.charIndex);
    };
  }

  speechSynthesis.speak(currentUtterance);
}

export function pauseSpeech() {
  if ("speechSynthesis" in window && speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
}

export function resumeSpeech() {
  if ("speechSynthesis" in window && speechSynthesis.paused) {
    speechSynthesis.resume();
  }
}

export function stopSpeech() {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return "speechSynthesis" in window && speechSynthesis.speaking && !speechSynthesis.paused;
}

export function isPaused() {
  return "speechSynthesis" in window && speechSynthesis.paused;
}
