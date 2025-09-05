import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { useGameStore } from '../../lib/systems/gameStore';
import { audioSystem } from '../../lib/systems/audio';
import { Block } from './Block';
import { ParticleSystem } from './ParticleSystem';
import { GameUI } from './GameUI';

// Componente para controlar a câmera
const CameraController: React.FC = () => {
  const cameraRef = useRef<any>();
  const { blocks, currentBlock } = useGameStore();

  useFrame(() => {
    if (!cameraRef.current) return;

    // Calcular altura da torre
    const towerHeight = blocks.length * 0.5;
    const targetY = Math.max(5, towerHeight + 3);
    
    // Suavizar movimento da câmera
    cameraRef.current.position.y = THREE.MathUtils.lerp(
      cameraRef.current.position.y,
      targetY,
      0.02
    );

    // Olhar para o topo da torre
    const lookAtY = Math.max(0, towerHeight - 2);
    cameraRef.current.lookAt(0, lookAtY, 0);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[8, 5, 8]}
      fov={60}
    />
  );
};

// Componente da cena 3D
const GameScene: React.FC = () => {
  const {
    blocks,
    currentBlock,
    particles,
    isPlaying,
    isPaused,
    placeBlock,
    updateCurrentBlock,
    updateParticles
  } = useGameStore();

  // Loop principal do jogo
  useFrame((state, delta) => {
    if (!isPlaying || isPaused) return;

    updateCurrentBlock(delta);
    updateParticles(delta);
  });

  // Controles de input
  useEffect(() => {
    const handleClick = () => {
      if (isPlaying && !isPaused && currentBlock?.isMoving) {
        placeBlock();
        audioSystem.playPlaceSound();
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [isPlaying, isPaused, currentBlock, placeBlock]);

  return (
    <>
      <CameraController />
      
      {/* Iluminação */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Ambiente */}
      <Environment preset="city" />

      {/* Plano de fundo/base */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[20, 0.1, 20]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Grid de referência */}
      <gridHelper args={[20, 20, '#34495e', '#34495e']} position={[0, -0.95, 0]} />

      {/* Renderizar blocos colocados */}
      {blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}

      {/* Renderizar bloco atual */}
      {currentBlock && (
        <Block block={currentBlock} isCurrentBlock />
      )}

      {/* Sistema de partículas */}
      <ParticleSystem particles={particles} />

      {/* Controles da câmera (desabilitados durante o jogo) */}
      <OrbitControls
        enabled={!isPlaying}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
};

// Componente principal do jogo
export const StackGame: React.FC = () => {
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const { isPlaying, isGameOver, perfectStreak } = useGameStore();

  // Configurar áudio
  useEffect(() => {
    audioSystem.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Música de fundo
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      audioSystem.playBackgroundMusic();
    } else {
      audioSystem.stopBackgroundMusic();
    }

    return () => {
      audioSystem.stopBackgroundMusic();
    };
  }, [isPlaying, isGameOver]);

  // Sons de feedback
  useEffect(() => {
    if (perfectStreak > 0) {
      audioSystem.playPerfectSound();
    }
  }, [perfectStreak]);

  useEffect(() => {
    if (isGameOver) {
      audioSystem.playGameOverSound();
    }
  }, [isGameOver]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black overflow-hidden">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <GameScene />
      </Canvas>

      <GameUI
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onMuteToggle={handleMuteToggle}
      />
    </div>
  );
};