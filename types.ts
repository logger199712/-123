import { Vector3 } from 'three';
import { ThreeElements } from '@react-three/fiber';

export interface TreeState {
  chaosLevel: number; // 0 (Formed) to 1 (Chaos)
  handPosition: { x: number; y: number }; // Normalized -1 to 1
  isHandDetected: boolean;
}

export enum OrnamentType {
  BALL = 'BALL',
  BOX = 'BOX',
  LIGHT = 'LIGHT'
}

export interface InstanceData {
  position: Vector3;
  chaosPosition: Vector3;
  color: string;
  scale: number;
  rotationSpeed: number;
  phaseOffset: number;
}

// Fix: Augment global JSX namespace to include React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}