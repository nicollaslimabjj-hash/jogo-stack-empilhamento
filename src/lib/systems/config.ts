// Configurações globais para o jogo Stack
export const GAME_CONFIG = {
  // Performance
  TARGET_FPS: 60,
  MAX_PARTICLES: 100,
  
  // Física
  GRAVITY: 9.8,
  FRICTION: 0.8,
  
  // Gameplay
  PERFECT_THRESHOLD: 0.1,
  BASE_SPEED: 2,
  SPEED_INCREMENT: 0.2,
  MAX_SPEED: 8,
  
  // Visual
  BLOCK_HEIGHT: 0.5,
  CAMERA_FOLLOW_SPEED: 0.02,
  
  // Audio
  DEFAULT_VOLUME: 0.7,
  MUSIC_VOLUME_MULTIPLIER: 0.3,
  
  // Colors
  BLOCK_COLORS: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ],
  
  // Scoring
  BASE_POINTS: 10,
  PERFECT_POINTS: 50,
  STREAK_BONUS: 10,
  
  // Storage
  BEST_SCORE_KEY: 'stackGameBestScore'
};

// Utilitários para o jogo
export const gameUtils = {
  // Gerar cor aleatória
  getRandomColor: () => {
    return GAME_CONFIG.BLOCK_COLORS[Math.floor(Math.random() * GAME_CONFIG.BLOCK_COLORS.length)];
  },
  
  // Calcular pontuação
  calculateScore: (isPerfect: boolean, streak: number) => {
    if (isPerfect) {
      return GAME_CONFIG.PERFECT_POINTS + (streak * GAME_CONFIG.STREAK_BONUS);
    }
    return GAME_CONFIG.BASE_POINTS;
  },
  
  // Calcular velocidade baseada no nível
  calculateSpeed: (level: number) => {
    return Math.min(
      GAME_CONFIG.BASE_SPEED + (level * GAME_CONFIG.SPEED_INCREMENT),
      GAME_CONFIG.MAX_SPEED
    );
  },
  
  // Formatar pontuação
  formatScore: (score: number) => {
    return score.toLocaleString();
  },
  
  // Salvar melhor pontuação
  saveBestScore: (score: number) => {
    localStorage.setItem(GAME_CONFIG.BEST_SCORE_KEY, score.toString());
  },
  
  // Carregar melhor pontuação
  loadBestScore: () => {
    return parseInt(localStorage.getItem(GAME_CONFIG.BEST_SCORE_KEY) || '0');
  }
};