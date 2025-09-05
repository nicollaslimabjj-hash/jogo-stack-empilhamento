import { Howl } from 'howler';
import { AudioSystem } from '../types/game';

class GameAudioSystem implements AudioSystem {
  private sounds: { [key: string]: Howl } = {};
  private backgroundMusic: Howl | null = null;
  private volume: number = 0.7;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Criando sons sintéticos usando Web Audio API
    this.sounds.place = new Howl({
      src: [this.createSyntheticSound('place')],
      volume: this.volume,
    });

    this.sounds.perfect = new Howl({
      src: [this.createSyntheticSound('perfect')],
      volume: this.volume,
    });

    this.sounds.gameOver = new Howl({
      src: [this.createSyntheticSound('gameOver')],
      volume: this.volume,
    });

    // Música de fundo sintética
    this.backgroundMusic = new Howl({
      src: [this.createBackgroundMusic()],
      loop: true,
      volume: this.volume * 0.3,
    });
  }

  private createSyntheticSound(type: string): string {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    let duration: number;
    let frequency: number;

    switch (type) {
      case 'place':
        duration = 0.2;
        frequency = 440;
        break;
      case 'perfect':
        duration = 0.4;
        frequency = 880;
        break;
      case 'gameOver':
        duration = 1.0;
        frequency = 220;
        break;
      default:
        duration = 0.2;
        frequency = 440;
    }

    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      if (type === 'place') {
        sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5);
      } else if (type === 'perfect') {
        sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) +
                Math.sin(2 * Math.PI * frequency * 1.5 * t) * Math.exp(-t * 4) * 0.5;
      } else if (type === 'gameOver') {
        sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 
                (1 - t / duration);
      }

      data[i] = sample * 0.3;
    }

    // Converter buffer para blob URL
    const offlineContext = new OfflineAudioContext(1, length, sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineContext.destination);
    source.start();

    return URL.createObjectURL(new Blob([new Float32Array(data)], { type: 'audio/wav' }));
  }

  private createBackgroundMusic(): string {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 8; // 8 segundos de loop
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.floor((t * 2) % notes.length);
      const frequency = notes[noteIndex];
      
      const sample = Math.sin(2 * Math.PI * frequency * t) * 
                    Math.sin(2 * Math.PI * t * 0.5) * 0.1;
      
      data[i] = sample;
    }

    return URL.createObjectURL(new Blob([new Float32Array(data)], { type: 'audio/wav' }));
  }

  playPlaceSound(): void {
    this.sounds.place?.play();
  }

  playPerfectSound(): void {
    this.sounds.perfect?.play();
  }

  playGameOverSound(): void {
    this.sounds.gameOver?.play();
  }

  playBackgroundMusic(): void {
    this.backgroundMusic?.play();
  }

  stopBackgroundMusic(): void {
    this.backgroundMusic?.stop();
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      sound.volume(this.volume);
    });
    if (this.backgroundMusic) {
      this.backgroundMusic.volume(this.volume * 0.3);
    }
  }
}

export const audioSystem = new GameAudioSystem();