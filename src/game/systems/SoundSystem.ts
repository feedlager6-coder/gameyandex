export class SoundSystem {
  private static instance: SoundSystem;
  private audioCtx: AudioContext | null = null;
  private isEnabled = true;
  private isVibrationEnabled = true;

  private constructor() {
    // Lazy initialized on first user touch to comply with browser autoplay policies
  }

  static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  setVibrationEnabled(enabled: boolean): void {
    this.isVibrationEnabled = enabled;
  }

  getVibrationEnabled(): boolean {
    return this.isVibrationEnabled;
  }

  unlock(): void {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  vibrate(ms = 30): void {
    if (!this.isVibrationEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Safe catch on unsupported platforms
      }
    }
  }

  playClick(): void {
    if (!this.isEnabled) return;
    this.unlock();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  playSpawn(): void {
    if (!this.isEnabled) return;
    this.unlock();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
      this.vibrate(20);
    } catch {}
  }

  playMerge(level: number): void {
    if (!this.isEnabled) return;
    this.unlock();
    if (!this.audioCtx) return;

    try {
      const baseFreq = 300 + level * 65;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.audioCtx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.14);
      this.vibrate(35);
    } catch {}
  }

  playOrderComplete(): void {
    if (!this.isEnabled) return;
    this.unlock();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        const startTime = this.audioCtx!.currentTime + idx * 0.08;
        const duration = 0.18;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
      this.vibrate(50);
    } catch {}
  }

  playCoin(): void {
    if (!this.isEnabled) return;
    this.unlock();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.audioCtx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, this.audioCtx.currentTime + 0.07); // E6

      gain.gain.setValueAtTime(0.16, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.22);
    } catch {}
  }

  playError(): void {
    if (!this.isEnabled) return;
    this.unlock();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, this.audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
      this.vibrate(80);
    } catch {}
  }
}
