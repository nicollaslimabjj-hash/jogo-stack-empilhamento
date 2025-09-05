import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, BufferAttribute, PointsMaterial } from 'three';
import { ParticleEffect } from '../../types/game';

interface ParticleSystemProps {
  particles: ParticleEffect[];
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ particles }) => {
  const pointsRef = useRef<Points>(null);

  // Gerar partículas para cada efeito
  const particleData = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    particles.forEach(particle => {
      const particleCount = particle.type === 'perfect' ? 20 : 10;
      
      for (let i = 0; i < particleCount; i++) {
        // Posição com dispersão aleatória
        const spread = particle.type === 'perfect' ? 1.5 : 1.0;
        positions.push(
          particle.position.x + (Math.random() - 0.5) * spread,
          particle.position.y + Math.random() * 2,
          particle.position.z + (Math.random() - 0.5) * spread
        );

        // Cores baseadas no tipo
        if (particle.type === 'perfect') {
          colors.push(1, 0.8, 0); // Dourado
        } else if (particle.type === 'place') {
          colors.push(0.2, 0.8, 1); // Azul claro
        } else {
          colors.push(1, 0.3, 0.3); // Vermelho
        }

        // Tamanhos variados
        sizes.push(Math.random() * 0.1 + 0.05);
      }
    });

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes),
      count: positions.length / 3
    };
  }, [particles]);

  // Animação das partículas
  useFrame((state, delta) => {
    if (!pointsRef.current || !pointsRef.current.geometry) return;

    const geometry = pointsRef.current.geometry as BufferGeometry;
    const positions = geometry.attributes.position;
    const colors = geometry.attributes.color;
    
    if (!positions || !colors) return;

    const now = Date.now();
    let particleIndex = 0;

    particles.forEach(particle => {
      const age = (now - particle.startTime) / particle.duration;
      const particleCount = particle.type === 'perfect' ? 20 : 10;

      for (let i = 0; i < particleCount; i++) {
        const index = particleIndex * 3;
        
        if (age < 1 && positions.array && colors.array) {
          // Movimento ascendente
          (positions.array as Float32Array)[index + 1] += delta * 2;
          
          // Fade out
          const alpha = 1 - age;
          (colors.array as Float32Array)[particleIndex * 3] *= alpha;
          (colors.array as Float32Array)[particleIndex * 3 + 1] *= alpha;
          (colors.array as Float32Array)[particleIndex * 3 + 2] *= alpha;
        }
        
        particleIndex++;
      }
    });

    positions.needsUpdate = true;
    colors.needsUpdate = true;
  });

  if (particleData.count === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particleData.positions}
          count={particleData.count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={particleData.colors}
          count={particleData.count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={particleData.sizes}
          count={particleData.count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
      />
    </points>
  );
};