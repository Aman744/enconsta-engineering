import * as THREE from 'three';
import { Materials } from '../assets/Materials.js';
import StateManager from '../core/StateManager.js';
import { PERFORMANCE_BUDGET } from '../config/performanceBudget.js';

class Pipelines {
  constructor() {
    this.mesh = new THREE.Group();
    this.curves = [];
    this.particles = [];
    this.particleGroup = null;
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // Set up curves
    this.createCurves();

    // Set up points material & geometry
    this.createFlowParticles();

    // Hide pipelines
    this.mesh.visible = false;

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  createCurves() {
    // Generate curved pipeline paths running across space
    const paths = [
      [
        new THREE.Vector3(-25, 5, -15),
        new THREE.Vector3(-10, 8, -5),
        new THREE.Vector3(5, -2, 5),
        new THREE.Vector3(25, -5, 15)
      ],
      [
        new THREE.Vector3(-20, -10, 10),
        new THREE.Vector3(-5, -5, 0),
        new THREE.Vector3(10, 8, -10),
        new THREE.Vector3(30, 12, -20)
      ],
      [
        new THREE.Vector3(-30, 20, -25),
        new THREE.Vector3(-15, 10, -15),
        new THREE.Vector3(0, 15, -5),
        new THREE.Vector3(20, 5, 10)
      ]
    ];

    paths.forEach(pts => {
      const curve = new THREE.CatmullRomCurve3(pts);
      this.curves.push(curve);
    });
  }

  createFlowParticles() {
    const lowPower = StateManager.get('lowPowerMode');
    const budget = lowPower ? PERFORMANCE_BUDGET.mobile.particles : PERFORMANCE_BUDGET.desktop.particles.pipelines;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(budget * 3);
    
    // Store particle progress values (0 to 1) and speeds
    this.particleData = [];

    for (let i = 0; i < budget; i++) {
      // Distribute evenly among the pipeline curves
      const curveIndex = i % this.curves.length;
      const curve = this.curves[curveIndex];
      const progress = Math.random(); // Start random progress along curve
      const speed = 0.05 + Math.random() * 0.05;

      this.particleData.push({ curve, progress, speed });

      const point = curve.getPointAt(progress);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGroup = new THREE.Points(geometry, Materials.energyParticle);
    this.mesh.add(this.particleGroup);
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    if (!this.mesh.visible) return;
    if (!this.particleGroup || !this.initialized) return;

    const positions = this.particleGroup.geometry.attributes.position.array;
    const count = this.particleData.length;

    for (let i = 0; i < count; i++) {
      const p = this.particleData[i];
      // Increment progress along curves
      p.progress += p.speed * delta;
      if (p.progress > 1) {
        p.progress = 0; // Loop back
      }

      const point = p.curve.getPointAt(p.progress);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    this.particleGroup.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.mesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
    this.mesh.clear();
  }
}

export default new Pipelines();
