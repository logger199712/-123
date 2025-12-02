import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getConePoint } from '../utils';

interface PolaroidsProps {
  treeState: React.MutableRefObject<TreeState>;
  userPhotos: string[];
}

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500",
];

const PHOTO_COUNT = 16;

const PolaroidItem = ({ data, treeState }: { data: any, treeState: React.MutableRefObject<TreeState> }) => {
    const ref = useRef<THREE.Group>(null);
    const currentChaos = useRef(0);
    const originalPos = data.pos;
    const targetPos = data.chaosPos;
    
    // Add some random sway offset
    const randomOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state, delta) => {
        if(!ref.current) return;
        
        currentChaos.current = THREE.MathUtils.lerp(currentChaos.current, treeState.current.chaosLevel, delta * 2);
        
        // Position Interp
        const currentPos = new THREE.Vector3().lerpVectors(originalPos, targetPos, currentChaos.current);
        
        // Gentle float in formed state
        if (currentChaos.current < 0.1) {
            currentPos.y += Math.sin(state.clock.elapsedTime + randomOffset) * 0.05;
        }

        ref.current.position.copy(currentPos);
        
        // Look at camera but maintain some original chaotic rotation
        // We want them to generally face the camera (0, 4, 25)
        ref.current.lookAt(0, 4, 25); 
        
        // Add local rotation wobble for life
        ref.current.rotateZ(Math.sin(state.clock.elapsedTime * 0.5 + randomOffset) * 0.05);
    });

    return (
        <group ref={ref} position={originalPos} rotation={data.rot}>
             {/* Frame Front - Creamy Paper */}
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[1.3, 1.6]} />
                <meshStandardMaterial color="#fffff0" roughness={0.9} />
            </mesh>
            
            {/* Gold Trim/Border for Luxury */}
             <mesh position={[0, 0, -0.015]} scale={[1.32, 1.62, 1]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
            </mesh>

            {/* Back of photo - Dark Cardboard */}
            <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
                 <planeGeometry args={[1.3, 1.6]} />
                 <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>

            {/* Image */}
            <Image 
                url={data.url} 
                scale={[1.1, 1.1]} 
                position={[0, 0.1, 0.001]} 
                transparent 
                opacity={1}
                toneMapped={false} // Keep colors vibrant
            />
        </group>
    )
}

const Polaroids: React.FC<PolaroidsProps> = ({ treeState, userPhotos }) => {
    
    const items = useMemo(() => {
        const photosToUse = userPhotos.length > 0 ? userPhotos : DEFAULT_PHOTOS;
        
        return Array.from({ length: PHOTO_COUNT }).map((_, i) => {
            // Spiral down the tree
            const t = 0.1 + (i / (PHOTO_COUNT + 2)); // Start from bottom-ish up to top
            const pos = getConePoint(14, 7.0, 1 - t); // Inverse so 0 is bottom
            // Push them out a bit more to float
            const dir = pos.clone().normalize();
            pos.add(dir.multiplyScalar(0.8));
            
            return {
                id: i,
                pos: pos,
                chaosPos: pos.clone().multiplyScalar(3).add(new THREE.Vector3((Math.random()-0.5)*15, (Math.random()-0.5)*15, (Math.random()-0.5)*15)),
                url: photosToUse[i % photosToUse.length], // Cycle through user photos
                rot: [0, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.3] as [number, number, number]
            };
        });
    }, [userPhotos]);

  return (
    <group>
        {items.map((data) => (
            <PolaroidItem key={data.id} data={data} treeState={treeState} />
        ))}
    </group>
  );
};

export default Polaroids;