import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getConePoint, getRandomSpherePoint } from '../utils';

// Vertex Shader: Interpolates between chaos and tree form
const vertexShader = `
  uniform float uTime;
  uniform float uChaos; // 0 to 1
  
  attribute vec3 aChaosPos;
  attribute vec3 aTreePos;
  attribute float aRandom;
  
  varying float vAlpha;
  varying vec3 vColor;

  // Simplex noise function would be here, but using simple sin/cos for brevity
  
  void main() {
    // Current base position lerp
    vec3 pos = mix(aTreePos, aChaosPos, uChaos);
    
    // Add "Unleash" explosion effect
    // When chaos is high, add some noise movement
    float noise = sin(uTime * 2.0 + aRandom * 10.0) * 0.5;
    
    if (uChaos > 0.1) {
       pos += normalize(pos) * noise * uChaos;
    } else {
       // Gentle wind in tree mode
       pos.x += sin(uTime + pos.y) * 0.05;
       pos.z += cos(uTime + pos.y) * 0.05;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (4.0 + aRandom * 2.0) * (100.0 / -mvPosition.z);
    
    // Color mixing based on position
    vec3 colorBot = vec3(0.02, 0.22, 0.15); // Dark Emerald
    vec3 colorTop = vec3(0.1, 0.5, 0.3);    // Lighter Green
    vColor = mix(colorBot, colorTop, (pos.y / 15.0) + 0.5);
    
    // Add gold flecks
    if (aRandom > 0.95) {
      vColor = vec3(1.0, 0.84, 0.0); // Gold
    }
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
    if (dot(circCoord, circCoord) > 1.0) {
      discard;
    }
    
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

interface FoliageProps {
  treeState: React.MutableRefObject<TreeState>;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const COUNT = 15000;
  const currentChaos = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const treePositions = [];
    const chaosPositions = [];
    const randoms = [];

    for (let i = 0; i < COUNT; i++) {
      // Tree Form: Cone
      // Height 15, Radius 6
      const t = Math.random();
      const treePos = getConePoint(15, 6, t);
      treePositions.push(treePos.x, treePos.y, treePos.z);

      // Chaos Form: Sphere Burst
      const chaosPos = getRandomSpherePoint(25);
      chaosPositions.push(chaosPos.x, chaosPos.y, chaosPos.z);

      randoms.push(Math.random());
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(treePositions, 3)); // Default render pos (updated by shader)
    geo.setAttribute('aTreePos', new THREE.Float32BufferAttribute(treePositions, 3));
    geo.setAttribute('aChaosPos', new THREE.Float32BufferAttribute(chaosPositions, 3));
    geo.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 1));
    
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (shaderRef.current) {
      // Smoothly interpolate the chaos value
      const target = treeState.current.chaosLevel;
      // Lerp logic
      currentChaos.current = THREE.MathUtils.lerp(currentChaos.current, target, delta * 2);
      
      shaderRef.current.uniforms.uChaos.value = currentChaos.current;
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uChaos: { value: 0 }
        }}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;
