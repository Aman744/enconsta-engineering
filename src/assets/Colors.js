import * as THREE from 'three';
import { TOKENS } from '../design-system/tokens.js';

export const Colors = {
  // CSS Values
  css: TOKENS.colors,

  // Three.js instances
  three: {
    primary: new THREE.Color(TOKENS.colors.primary),
    secondary: new THREE.Color(TOKENS.colors.secondary),
    accent: new THREE.Color(TOKENS.colors.accent),
    bgDark: new THREE.Color(TOKENS.colors.bgDark),
    blueprintLines: new THREE.Color(TOKENS.colors.blueprintLines),
    blueprintDark: new THREE.Color(TOKENS.colors.blueprintDark)
  }
};
