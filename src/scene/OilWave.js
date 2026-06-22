import * as THREE from 'three';
import { Colors } from '../assets/Colors.js';
import StateManager from '../core/StateManager.js';
import AnimationController from '../core/AnimationController.js';
import { PERFORMANCE_BUDGET } from '../config/performanceBudget.js';

class OilWave {
  constructor() {
    this.mesh = new THREE.Group();
    this.points = null;
    this.geometry = null;
    this.transitionFactor = 0; // 0 = Pure Oil, 1 = Pure Blue Energy
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    const lowPower = StateManager.get('lowPowerMode');
    const budget = lowPower ? PERFORMANCE_BUDGET.mobile.particles : PERFORMANCE_BUDGET.desktop.particles.wave;

    // Grid coordinates
    const gridDim = Math.floor(Math.sqrt(budget));
    const spacing = 1.2;
    const startX = -(gridDim * spacing) / 2;
    const startZ = -(gridDim * spacing) / 2;

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(gridDim * gridDim * 3);
    const colors = new Float32Array(gridDim * gridDim * 3);

    this.particleGrid = [];

    for (let r = 0; r < gridDim; r++) {
      for (let c = 0; c < gridDim; c++) {
        const index = r * gridDim + c;
        const x = startX + c * spacing;
        const z = startZ + r * spacing;
        const y = 0;

        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        // Start colors: Black oil
        colors[index * 3] = 0.01;
        colors[index * 3 + 1] = 0.01;
        colors[index * 3 + 2] = 0.01;

        this.particleGrid.push({ x, z, r, c });
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader-like materials properties
    const mat = new THREE.PointsMaterial({
      size: lowPower ? 2.5 : 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, mat);
    this.points.position.y = -8; // Position at bottom of screen
    this.mesh.add(this.points);

    parentGroup.add(this.mesh);
    this.initialized = true;

    // Scroll-bound transition trigger mapping
    this.setupTransitionAnimation();
  }

  setupTransitionAnimation() {
    // Bind ScrollTrigger to transition factor
    AnimationController.createTimeline('oil-to-energy', {
      scrollTrigger: {
        trigger: '.transition-canvas-trigger',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          this.transitionFactor = self.progress; // 0 to 1
        }
      }
    });
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    if (!this.initialized || !this.points) return;

    const positions = this.geometry.attributes.position.array;
    const colors = this.geometry.attributes.color.array;
    const count = this.particleGrid.length;

    // Interpolated wave variables
    const oilFreq = 0.08;
    const energyFreq = 0.25;
    const currentFreq = THREE.MathUtils.lerp(oilFreq, energyFreq, this.transitionFactor);

    const oilSpeed = 0.8;
    const energySpeed = 3.5;
    const currentSpeed = THREE.MathUtils.lerp(oilSpeed, energySpeed, this.transitionFactor);

    const oilAmp = 3.0;
    const energyAmp = 1.2;
    const currentAmp = THREE.MathUtils.lerp(oilAmp, energyAmp, this.transitionFactor);

    for (let i = 0; i < count; i++) {
      const p = this.particleGrid[i];

      // Wave calculation: sin + cos offsets
      const waveVal = Math.sin(p.x * currentFreq + time * currentSpeed) * 
                      Math.cos(p.z * currentFreq + time * currentSpeed);
      
      positions[i * 3 + 1] = waveVal * currentAmp; // Height update

      // Color interpolation: Black (0.01, 0.01, 0.01) to Cyan (0.0, 0.7, 0.85)
      const targetR = THREE.MathUtils.lerp(0.01, 0.0, this.transitionFactor);
      const targetG = THREE.MathUtils.lerp(0.01, 0.7, this.transitionFactor);
      const targetB = THREE.MathUtils.lerp(0.01, 0.85, this.transitionFactor);

      colors[i * 3] = targetR;
      colors[i * 3 + 1] = targetG;
      colors[i * 3 + 2] = targetB;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  dispose() {
    if (this.geometry) this.geometry.dispose();
    if (this.points) {
      if (this.points.material) this.points.material.dispose();
    }
    this.mesh.clear();
  }
}

export default new OilWave();
