import * as THREE from 'three';
import { Colors } from './Colors.js';

export const Materials = {
  // Shared lines for blueprint wireframes
  blueprintLine: new THREE.LineBasicMaterial({
    color: Colors.three.accent,
    transparent: true,
    opacity: 0.15,
    depthWrite: false
  }),

  blueprintLineDark: new THREE.LineBasicMaterial({
    color: Colors.three.secondary,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  }),

  // Solid metallic mesh for refinery assets
  refineryMetal: new THREE.MeshPhongMaterial({
    color: 0x112244,
    emissive: 0x051025,
    specular: 0x00b4d8,
    shininess: 30,
    flatShading: true,
    transparent: true,
    opacity: 0.8
  }),

  refineryMetalDark: new THREE.MeshPhongMaterial({
    color: 0x061226,
    emissive: 0x020713,
    specular: 0x0f4c81,
    shininess: 10,
    flatShading: true,
    transparent: true,
    opacity: 0.95
  }),

  // Glowing particles (flowing energy along pipelines)
  energyParticle: new THREE.PointsMaterial({
    color: Colors.three.accent,
    size: 2,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }),

  // Light energy transitions
  blueParticle: new THREE.PointsMaterial({
    color: 0x00d8ff,
    size: 3,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }),

  // Dark oil particles
  oilParticle: new THREE.PointsMaterial({
    color: 0x030303,
    size: 4,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    depthWrite: true
  }),

  // Wireframe structural layout
  structureGrid: new THREE.LineBasicMaterial({
    color: Colors.three.accent,
    transparent: true,
    opacity: 0.08,
    depthWrite: false
  })
};
