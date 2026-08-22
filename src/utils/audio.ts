/**
 * Lightweight Web Audio Synthesizer for POS beep, Check-in chime, and Denied alert
 */

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Quick crisp barcode scanner beep
  playScanBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted before first user gesture
    }
  }

  // Melodic 2-tone chime for valid check-in / payment success
  playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(523.25, now, 0.12); // C5
      playTone(659.25, now + 0.08, 0.14); // E5
      playTone(783.99, now + 0.16, 0.22); // G5
    } catch {
      // Ignored
    }
  }

  // Low warning buzz for expired member or session gender mismatch
  playDeniedBuzz() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.25);
      
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignored
    }
  }
}

export const soundFx = new SoundSynthesizer();
