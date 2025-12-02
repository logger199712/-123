import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getConePoint, getRandomSpherePoint, GOLD_COLORS, RED_COLORS } from '../utils';

interface OrnamentsProps {
  treeState: React.MutableRefObject<TreeState>;
}

const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const COUNT = 300;
  const currentChaos = useRef(0);
  
  // Data for instances
  const data = useMemo(() => {
    const items = [];
    for (let i = 0; i < COUNT; i++) {
        const t = Math.random();
        // Place ornaments slightly outside the foliage
        const treePos = getConePoint(15, 6.5, t); 
        const chaosPos = getRandomSpherePoint(30);
        
        const isGold = Math.random() > 0.4;
        const color = isGold 
            ? new THREE.Color(GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)])
            : new THREE.Color(RED_COLORS[Math.floor(Math.random() * RED_COLORS.length)]);

        // Scale varies: balls are small, boxes larger
        const scale = 0.2 + Math.random() * 0.3;

        items.push({
            treePos,
            chaosPos,
            color,
            scale,
            rotationSpeed: (Math.random() - 0.5) * 2,
            phase: Math.random() * Math.PI * 2
        });
    }
    return items;
  }, []);

  useLayoutEffect(() => {
    if (meshRef.current) {
        const tempColor = new THREE.Color();
        data.forEach((d, i) => {
            meshRef.current?.setColorAt(i, d.color);
        });
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update chaos lerp
    const targetChaos = treeState.current.chaosLevel;
    // Ornaments are "heavier" so they lag behind slightly or move faster depending on logic
    // Let's make them move faster to look explosive
    currentChaos.current = THREE.MathUtils.lerp(currentChaos.current, targetChaos, delta * 3);

    data.forEach((d, i) => {
        // Interpolate position
        const pos = new THREE.Vector3().lerpVectors(d.treePos, d.chaosPos, currentChaos.current);

        // Add floaty physics in chaos mode
        if (currentChaos.current > 0.1) {
            pos.y += Math.sin(state.clock.elapsedTime + d.phase) * 0.1 * currentChaos.current;
        }

        dummy.position.copy(pos);
        
        // Rotate
        dummy.rotation.x = state.clock.elapsedTime * d.rotationSpeed;
        dummy.rotation.y = state.clock.elapsedTime * d.rotationSpeed;
        
        dummy.scale.setScalar(d.scale);
        dummy.updateMatrix();
        
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        roughness={0.1} 
        metalness={0.9} 
        envMapIntensity={2}
      />
    </instancedMesh>
  );
};

export default Ornaments;
