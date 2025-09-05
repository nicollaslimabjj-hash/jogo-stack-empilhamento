import { useEffect, useCallback } from 'react';
import { useGameStore } from '../systems/gameStore';
import { audioSystem } from '../systems/audio';

export const useGameControls = () => {
  const {
    isPlaying,
    isPaused,
    isGameOver,
    currentBlock,
    placeBlock,
    startGame,
    pauseGame,
    resumeGame,
    resetGame
  } = useGameStore();

  // Função para colocar bloco
  const handlePlaceBlock = useCallback(() => {
    if (isPlaying && !isPaused && !isGameOver && currentBlock?.isMoving) {
      placeBlock();
      audioSystem.playPlaceSound();
    }
  }, [isPlaying, isPaused, isGameOver, currentBlock, placeBlock]);

  // Função para iniciar/pausar jogo
  const handlePlayPause = useCallback(() => {
    if (!isPlaying) {
      startGame();
    } else if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }, [isPlaying, isPaused, startGame, resumeGame, pauseGame]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          handlePlaceBlock();
          break;
        case 'KeyP':
          event.preventDefault();
          handlePlayPause();
          break;
        case 'KeyR':
          event.preventDefault();
          resetGame();
          break;
        case 'Escape':
          event.preventDefault();
          if (isPlaying && !isGameOver) {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlaceBlock, handlePlayPause, resetGame, isPlaying, isGameOver, pauseGame]);

  // Controles de mouse/touch
  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      // Evitar clicks em elementos da UI
      const target = event.target as HTMLElement;
      if (target.closest('button') || target.closest('.game-ui-overlay')) {
        return;
      }
      
      handlePlaceBlock();
    };

    // Prevenir menu de contexto no mobile
    const handleContextMenu = (event: Event) => {
      event.preventDefault();
    };

    // Prevenir seleção de texto
    const handleSelectStart = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('selectstart', handleSelectStart);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('selectstart', handleSelectStart);
    };
  }, [handlePlaceBlock]);

  // Prevenir zoom no mobile
  useEffect(() => {
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return {
    handlePlaceBlock,
    handlePlayPause,
    isPlaying,
    isPaused,
    isGameOver
  };
};