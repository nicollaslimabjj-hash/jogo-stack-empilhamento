import { Vector3 } from 'three';

export interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  perfectStreak: number;
  bestScore: number;
}

export interface Block {
  id: string;
  position: Vector3;
  size: Vector3;
  color: string;
  isMoving: boolean;
  direction: number;
  speed: number;
  isPlaced: boolean;
  perfectAlignment: boolean;
}

export interface GameSettings {
  baseSpeed: number;
  speedIncrease: number;
  maxSpeed: number;
  blockHeight: number;
  perfectThreshold: number;
  colors: string[];
}

export interface AudioSystem {
  playPlaceSound: () => void;
  playPerfectSound: () => void;
  playGameOverSound: () => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  setVolume: (volume: number) => void;
}

export interface ParticleEffect {
  id: string;
  position: Vector3;
  type: 'perfect' | 'place' | 'fall';
  duration: number;
  startTime: number;
}