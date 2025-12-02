import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Scene from './components/Scene';
import GestureController from './components/GestureController';
import Overlay from './components/Overlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [detected, setDetected] = useState(false);
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  
  // We use a ref for state that updates 60fps to avoid React re-renders causing lag
  const treeState = useRef<TreeState>({
    chaosLevel: 0,
    handPosition: { x: 0, y: 0 },
    isHandDetected: false,
  });

  const handleGestureUpdate = (data: { chaos: number; x: number; y: number; detected: boolean }) => {
    treeState.current.chaosLevel = data.chaos;
    
    // Smooth hand position for camera
    const lerpFactor = 0.1;
    treeState.current.handPosition.x += (data.x - treeState.current.handPosition.x) * lerpFactor;
    treeState.current.handPosition.y += (data.y - treeState.current.handPosition.y) * lerpFactor;
    
    treeState.current.isHandDetected = data.detected;
    
    if (data.detected && !detected) setDetected(true);
    if (!data.detected && detected) setDetected(false);
  };

  return (
    <div className="w-full h-screen relative bg-[#021a12]">
      
      <Overlay 
        onStart={() => setStarted(true)} 
        started={started} 
        detected={detected}
        onPhotosUploaded={setUserPhotos}
      />

      {started && (
        <GestureController onUpdate={handleGestureUpdate} />
      )}

      {started && (
        <Canvas
            shadows
            camera={{ position: [0, 4, 25], fov: 45 }}
            gl={{ antialias: false, toneMappingExposure: 1.5 }} // PP handles AA usually, but basic is fine. Exposure up for bloom.
            dpr={[1, 2]} // Performance optimization for high DPI
        >
            <Suspense fallback={null}>
            <Scene treeState={treeState} userPhotos={userPhotos} />
            </Suspense>
        </Canvas>
      )}
      
      <Loader 
        containerStyles={{ background: '#021a12' }}
        innerStyles={{ width: '300px', height: '10px', background: '#333' }}
        barStyles={{ height: '10px', background: '#D4AF37' }}
        dataStyles={{ color: '#D4AF37', fontFamily: 'serif' }}
      />
    </div>
  );
};

export default App;