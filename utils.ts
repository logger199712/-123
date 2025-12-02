import * as THREE from 'three';

// Helper to get random point in sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Helper to get point on cone surface (Tree shape)
export const getConePoint = (height: number, bottomRadius: number, t: number): THREE.Vector3 => {
  // t is 0 (bottom) to 1 (top)
  const y = (t - 0.5) * height; // Center vertically
  const r = bottomRadius * (1 - t);
  const angle = t * 50; // Spirals
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  // Add some jitter for volume
  const jitter = (Math.random() - 0.5) * 0.5;
  return new THREE.Vector3(x + jitter, y, z + jitter);
};

export const GOLD_COLORS = ['#FFD700', '#FDB931', '#C5A059', '#E6BE8A'];
export const RED_COLORS = ['#8a0303', '#b30000', '#ff0000'];
export const TREE_COLORS = ['#043927', '#0f5238', '#00261a']; // Dark Emeralds
