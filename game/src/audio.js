// audio.js — WebAudio sounds only, no files. The AudioContext is created
// lazily on the first user gesture, so nothing sounds before the player acts.
// M toggles mute. Three sounds: chime (found), thud (wrong), win arpeggio.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  // Call from a user gesture (click / keydown). Safe to call repeatedly.
  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  _tone(freq, startAt, dur, type, vol) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + startAt;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // Two bright sine notes, E6 then B6 — the satisfying "found it" chime.
  chime() {
    this._tone(1318.5, 0, 0.28, "sine", 0.22);
    this._tone(1975.5, 0.09, 0.38, "sine", 0.18);
  }

  // Short low triangle thud for a wrong click.
  thud() {
    this._tone(140, 0, 0.18, "triangle", 0.2);
    this._tone(98, 0.02, 0.2, "triangle", 0.14);
  }

  // Rising arpeggio when the garden is complete.
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => this._tone(f, i * 0.12, 0.5, "sine", 0.2));
    this._tone(261.6, 0, 0.9, "triangle", 0.08);
  }

  // Soft tick when the keyboard focus ring moves.
  tick() {
    this._tone(880, 0, 0.06, "sine", 0.07);
  }
}

// Volume note: all gains stay at or below 0.22 so the chime is pleasant
// on laptop speakers and never clips.
