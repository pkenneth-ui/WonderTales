export const SpeechService = {
  synth: window.speechSynthesis,
  isPlaying: false,
  selectedVoice: null,
  voices: [],

  initVoices(callback) {
    if (!this.synth) return;
    const load = () => {
      this.voices = this.synth.getVoices().filter(v => v.lang.startsWith('en'));
      if (this.voices.length > 0 && !this.selectedVoice) {
        this.selectedVoice = this.voices.find(v => v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Google')) || this.voices[0];
      }
      if (callback) callback(this.voices, this.selectedVoice);
    };

    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  },

  setVoice(voiceIndex) {
    if (this.voices[voiceIndex]) {
      this.selectedVoice = this.voices[voiceIndex];
    }
  },

  speak(text, onStart, onEnd) {
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => { this.isPlaying = true; if (onStart) onStart(); };
    utterance.onend = () => { this.isPlaying = false; if (onEnd) onEnd(); };
    utterance.onerror = () => { this.isPlaying = false; if (onEnd) onEnd(); };

    this.synth.speak(utterance);
  },

  pause() {
    if (this.synth) this.synth.pause();
  },

  resume() {
    if (this.synth) this.synth.resume();
  },

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
    }
  }
};
