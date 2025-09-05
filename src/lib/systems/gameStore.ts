import { create } from 'zustand';
import { Vector3 } from 'three';
import { GameState, Block, GameSettings, ParticleEffect } from '../types/game';

interface GameStore extends GameState {
  blocks: Block[];
  currentBlock: Block | null;
  particles: ParticleEffect[];
  settings: GameSettings;
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  placeBlock: () => void;
  updateCurrentBlock: (deltaTime: number) => void;
  addParticle: (particle: ParticleEffect) => void;
  updateParticles: (deltaTime: number) => void;
  resetGame: () => void;
  updateScore: (points: number) => void;
}

const defaultSettings: GameSettings = {
  baseSpeed: 2,
  speedIncrease: 0.2,
  maxSpeed: 8,
  blockHeight: 0.5,
  perfectThreshold: 0.1,
  colors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
};

const createNewBlock = (level: number, lastBlock: Block | null, settings: GameSettings): Block => {
  const baseSize = lastBlock ? lastBlock.size.clone() : new Vector3(2, settings.blockHeight, 2);
  const basePosition = lastBlock 
    ? new Vector3(lastBlock.position.x, lastBlock.position.y + settings.blockHeight, lastBlock.position.z)
    : new Vector3(0, 0, 0);

  // Posição inicial aleatória para movimento
  const startX = Math.random() > 0.5 ? -4 : 4;
  const direction = startX > 0 ? -1 : 1;
  
  const speed = Math.min(
    settings.baseSpeed + (level * settings.speedIncrease),
    settings.maxSpeed
  );

  return {
    id: `block-${Date.now()}-${Math.random()}`,
    position: new Vector3(startX, basePosition.y, basePosition.z),
    size: baseSize,
    color: settings.colors[level % settings.colors.length],
    isMoving: true,
    direction,
    speed,
    isPlaced: false,
    perfectAlignment: false
  };
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  score: 0,
  level: 0,
  isPlaying: false,
  isGameOver: false,
  isPaused: false,
  perfectStreak: 0,
  bestScore: parseInt(localStorage.getItem('stackGameBestScore') || '0'),
  blocks: [],
  currentBlock: null,
  particles: [],
  settings: defaultSettings,

  startGame: () => {
    const firstBlock: Block = {
      id: 'base-block',
      position: new Vector3(0, -0.25, 0),
      size: new Vector3(2, 0.5, 2),
      color: '#34495e',
      isMoving: false,
      direction: 0,
      speed: 0,
      isPlaced: true,
      perfectAlignment: true
    };

    const secondBlock = createNewBlock(0, firstBlock, get().settings);

    set({
      isPlaying: true,
      isGameOver: false,
      isPaused: false,
      score: 0,
      level: 0,
      perfectStreak: 0,
      blocks: [firstBlock],
      currentBlock: secondBlock,
      particles: []
    });
  },

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),

  gameOver: () => {
    const { score, bestScore } = get();
    const newBestScore = Math.max(score, bestScore);
    
    if (newBestScore > bestScore) {
      localStorage.setItem('stackGameBestScore', newBestScore.toString());
    }

    set({
      isGameOver: true,
      isPlaying: false,
      bestScore: newBestScore
    });
  },

  placeBlock: () => {
    const { currentBlock, blocks, level, settings, perfectStreak } = get();
    if (!currentBlock || !currentBlock.isMoving) return;

    const lastBlock = blocks[blocks.length - 1];
    if (!lastBlock) return;

    // Calcular sobreposição
    const overlapX = Math.max(0, Math.min(
      lastBlock.position.x + lastBlock.size.x / 2,
      currentBlock.position.x + currentBlock.size.x / 2
    ) - Math.max(
      lastBlock.position.x - lastBlock.size.x / 2,
      currentBlock.position.x - currentBlock.size.x / 2
    ));

    const overlapZ = Math.max(0, Math.min(
      lastBlock.position.z + lastBlock.size.z / 2,
      currentBlock.position.z + currentBlock.size.z / 2
    ) - Math.max(
      lastBlock.position.z - lastBlock.size.z / 2,
      currentBlock.position.z - currentBlock.size.z / 2
    ));

    if (overlapX <= 0 || overlapZ <= 0) {
      // Sem sobreposição - game over
      get().gameOver();
      return;
    }

    // Calcular nova posição e tamanho
    const newSize = new Vector3(overlapX, settings.blockHeight, overlapZ);
    const newPosition = new Vector3(
      (Math.max(lastBlock.position.x - lastBlock.size.x / 2, currentBlock.position.x - currentBlock.size.x / 2) +
       Math.min(lastBlock.position.x + lastBlock.size.x / 2, currentBlock.position.x + currentBlock.size.x / 2)) / 2,
      currentBlock.position.y,
      (Math.max(lastBlock.position.z - lastBlock.size.z / 2, currentBlock.position.z - currentBlock.size.z / 2) +
       Math.min(lastBlock.position.z + lastBlock.size.z / 2, currentBlock.position.z + currentBlock.size.z / 2)) / 2
    );

    // Verificar alinhamento perfeito
    const alignmentError = Math.abs(currentBlock.position.x - lastBlock.position.x) +
                          Math.abs(currentBlock.position.z - lastBlock.position.z);
    const isPerfect = alignmentError < settings.perfectThreshold;

    // Atualizar bloco atual
    const placedBlock: Block = {
      ...currentBlock,
      position: newPosition,
      size: isPerfect ? currentBlock.size : newSize,
      isMoving: false,
      isPlaced: true,
      perfectAlignment: isPerfect
    };

    // Calcular pontuação
    let points = 10;
    if (isPerfect) {
      points = 50 + (perfectStreak * 10);
    }

    // Adicionar partículas
    get().addParticle({
      id: `particle-${Date.now()}`,
      position: newPosition.clone(),
      type: isPerfect ? 'perfect' : 'place',
      duration: isPerfect ? 2000 : 1000,
      startTime: Date.now()
    });

    // Criar próximo bloco
    const nextBlock = createNewBlock(level + 1, placedBlock, settings);

    set({
      blocks: [...blocks, placedBlock],
      currentBlock: nextBlock,
      level: level + 1,
      score: get().score + points,
      perfectStreak: isPerfect ? perfectStreak + 1 : 0
    });
  },

  updateCurrentBlock: (deltaTime: number) => {
    const { currentBlock, isPaused } = get();
    if (!currentBlock || !currentBlock.isMoving || isPaused) return;

    const newPosition = currentBlock.position.clone();
    newPosition.x += currentBlock.direction * currentBlock.speed * deltaTime;

    // Inverter direção nas bordas
    if (newPosition.x > 4 || newPosition.x < -4) {
      set({
        currentBlock: {
          ...currentBlock,
          direction: -currentBlock.direction
        }
      });
      return;
    }

    set({
      currentBlock: {
        ...currentBlock,
        position: newPosition
      }
    });
  },

  addParticle: (particle: ParticleEffect) => {
    set({ particles: [...get().particles, particle] });
  },

  updateParticles: (deltaTime: number) => {
    const now = Date.now();
    set({
      particles: get().particles.filter(particle => 
        now - particle.startTime < particle.duration
      )
    });
  },

  resetGame: () => {
    set({
      score: 0,
      level: 0,
      isPlaying: false,
      isGameOver: false,
      isPaused: false,
      perfectStreak: 0,
      blocks: [],
      currentBlock: null,
      particles: []
    });
  },

  updateScore: (points: number) => {
    set({ score: get().score + points });
  }
}));