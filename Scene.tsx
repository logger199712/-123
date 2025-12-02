import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Image, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Polaroids from './Polaroids';

interface SceneProps {
  treeState: React.MutableRefObject<TreeState>;
  userPhotos: string[];
}

const Scene: React.FC<SceneProps> = ({ treeState, userPhotos }) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  // Camera animation loop
  useFrame((state, delta) => {
    // Smooth Chaos Transition
    
    // Camera Parallax based on Hand Position
    if (treeState.current.isHandDetected) {
      // Invert X because webcam is mirrored usually
      targetRotation.current.x = treeState.current.handPosition.y * 0.5; 
      targetRotation.current.y = -treeState.current.handPosition.x * 0.5;
    } else {
      // Idle rotation
      targetRotation.current.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      targetRotation.current.y = Math.cos(state.clock.elapsedTime * 0.1) * 0.2;
    }

    // Lerp camera lookAt/position slightly for feel
    const damp = 2 * delta;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 10 + targetRotation.current.y * 5, damp);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 4 + targetRotation.current.x * 2, damp);
    camera.lookAt(0, 5, 0);

    if (groupRef.current) {
        // Slow continuous rotation of the entire tree assembly
        groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <>
      <color attach="background" args={['#021a12']} />
      
      {/* Lighting - Luxury Setup */}
      <ambientLight intensity={0.2} color="#043927" />
      <spotLight 
        position={[20, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#ffd700" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#ff0000" />
      <Environment preset="lobby" background={false} blur={0.6} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <group ref={groupRef} position={[0, 0, 0]}>
         {/* The Main Attractions */}
         <Foliage treeState={treeState} />
         <Ornaments treeState={treeState} />
         <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Polaroids treeState={treeState} userPhotos={userPhotos} />
         </Float>
      </group>

      {/* Post Processing for the "Gold Glow" */}
      <EffectComposer disableNormalPass>
        {/* Lowered threshold slightly to ensure gold ornaments and photo frames glow */}
        <Bloom 
          luminanceThreshold={0.65} 
          mipmapBlur 
          intensity={1.0} 
          radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </>
  );
};

export default Scene;