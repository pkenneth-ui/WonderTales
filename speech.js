export const SpeechService = {
  synth: window.speechSynthesis,
  isPlaying: false,

  speak(text, onStart, onEnd) {
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

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