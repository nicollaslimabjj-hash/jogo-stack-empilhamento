import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, BoxGeometry, EdgesGeometry } from 'three';
import { Block as BlockType } from '../../types/game';
import * as THREE from 'three';

interface BlockProps {
  block: BlockType;
  isCurrentBlock?: boolean;
}

export const Block: React.FC<BlockProps> = ({ block, isCurrentBlock = false }) => {
  const meshRef = useRef<Mesh>(null);

  // Animação de queda suave para blocos colocados
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isCurrentBlock && block.isMoving) {
      // Animação de movimento lateral
      meshRef.current.position.x = block.position.x;
    } else if (!block.isMoving && block.isPlaced) {
      // Animação de queda suave
      const targetY = block.position.y;
      const currentY = meshRef.current.position.y;
      
      if (Math.abs(currentY - targetY) > 0.01) {
        meshRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, delta * 8);
      }
    }

    // Efeito de brilho para alinhamento perfeito
    if (block.perfectAlignment && meshRef.current.material) {
      const material = meshRef.current.material as any;
      const time = state.clock.elapsedTime;
      material.emissive.setHex(0x444444);
      material.emissiveIntensity = 0.3 + Math.sin(time * 4) * 0.2;
    }
  });

  // Geometria otimizada
  const geometry = useMemo(() => {
    return [block.size.x, block.size.y, block.size.z];
  }, [block.size.x, block.size.y, block.size.z]);

  // Material com cor dinâmica
  const materialProps = useMemo(() => ({
    color: block.color,
    roughness: 0.3,
    metalness: 0.1,
    emissive: block.perfectAlignment ? '#222222' : '#000000',
    emissiveIntensity: block.perfectAlignment ? 0.3 : 0,
  }), [block.color, block.perfectAlignment]);

  const edgesGeometry = useMemo(() => {
    return new EdgesGeometry(new BoxGeometry(...geometry));
  }, [geometry]);

  return (
    <group position={[block.position.x, block.position.y, block.position.z]}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
      >
        <boxGeometry args={geometry} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* Bordas destacadas */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </lineSegments>
      
      {/* Efeito de sombra interna */}
      <mesh position={[0, -block.size.y * 0.4, 0]}>
        <boxGeometry args={[geometry[0] * 0.9, 0.01, geometry[2] * 0.9]} />
        <meshBasicMaterial color="#000000" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};