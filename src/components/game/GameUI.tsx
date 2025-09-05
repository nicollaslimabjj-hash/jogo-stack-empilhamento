import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '../../lib/systems/gameStore';

interface GameUIProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle
}) => {
  const {
    score,
    level,
    isPlaying,
    isGameOver,
    isPaused,
    perfectStreak,
    bestScore,
    startGame,
    pauseGame,
    resumeGame,
    resetGame
  } = useGameStore();

  const handlePlayPause = () => {
    if (!isPlaying) {
      startGame();
    } else if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Header com pontuação */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">Score: {score.toLocaleString()}</div>
          <div className="text-sm opacity-80">Level: {level}</div>
          {perfectStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-yellow-400 text-sm font-bold"
            >
              Perfect Streak: {perfectStreak}
            </motion.div>
          )}
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white text-right">
          <div className="text-sm opacity-80">Best Score</div>
          <div className="text-xl font-bold">{bestScore.toLocaleString()}</div>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            {!isPlaying ? (
              <Play className="w-5 h-5 text-white" />
            ) : isPaused ? (
              <Play className="w-5 h-5 text-white" />
            ) : (
              <Pause className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            onClick={resetGame}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={onMuteToggle}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-white"
            />
          </div>
        </div>
      </div>

      {/* Instruções */}
      {!isPlaying && !isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 text-white text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Stack Game</h2>
            <p className="mb-4">
              Time your taps perfectly to stack blocks as high as possible!
            </p>
            <div className="text-sm opacity-80 space-y-1">
              <p>• Click or tap to place blocks</p>
              <p>• Perfect alignment gives bonus points</p>
              <p>• Speed increases with each level</p>
              <p>• Build the highest tower you can!</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-black/80 backdrop-blur-sm rounded-xl p-8 text-white text-center max-w-md mx-4"
            >
              <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
              
              <div className="space-y-2 mb-6">
                <div className="text-xl">Final Score: <span className="font-bold text-yellow-400">{score.toLocaleString()}</span></div>
                <div className="text-lg">Level Reached: {level}</div>
                {score === bestScore && score > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-yellow-400 font-bold"
                  >
                    🏆 New Best Score!
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Play Again
                </button>
                
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-colors"
                >
                  Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to place indicator */}
      {isPlaying && !isPaused && !isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-bold"
          >
            Tap to Place Block
          </motion.div>
        </motion.div>
      )}

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-black/60 backdrop-blur-sm rounded-xl p-8 text-white text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Paused</h2>
              <button
                onClick={resumeGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};