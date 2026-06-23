import * as THREE from 'three';
import { Materials } from '../../assets/Materials.js';

class ElectricalGrid {
  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.position.set(30, 0, 0); // Position on the camera journey track
    this.initialized = false;
    this.cables = [];
    this.flowParticles = null;
    this.particleCount = 30;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // 1. Transformer Substation Block
    const transGroup = new THREE.Group();
    transGroup.position.set(5, -6, 0); // Ground aligned

    const tankGeom = new THREE.BoxGeometry(4, 5, 4);
    const tank = new THREE.Mesh(tankGeom, Materials.refineryMetalDark);
    tank.position.y = 2.5;
    const tankWire = new THREE.LineSegments(new THREE.EdgesGeometry(tankGeom), Materials.blueprintLine);
    tankWire.position.y = 2.5;
    transGroup.add(tank, tankWire);

    // Radiator Cooling Fins
    const finGeom = new THREE.BoxGeometry(0.2, 4, 3.8);
    for (let i = -1.8; i <= 1.8; i += 0.9) {
      const fin = new THREE.LineSegments(new THREE.EdgesGeometry(finGeom), Materials.blueprintLineDark);
      fin.position.set(i, 2.5, 0);
      transGroup.add(fin);
    }

    // Insulator Bushings (Vertical cylinder stacks)
    for (let i = -1.2; i <= 1.2; i += 1.2) {
      const insGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.8, 5);
      const ins = new THREE.LineSegments(new THREE.EdgesGeometry(insGeom), Materials.blueprintLine);
      ins.position.set(i, 5.9, 0);
      transGroup.add(ins);
    }
    this.mesh.add(transGroup);

    // 2. High-Voltage Transmission Tower (Pylon)
    const pylonGroup = new THREE.Group();
    pylonGroup.position.set(-6, -6, 0);

    const mastGeom = new THREE.CylinderGeometry(0.3, 1.4, 17, 4, 4, true);
    const mastWire = new THREE.LineSegments(new THREE.EdgesGeometry(mastGeom), Materials.blueprintLine);
    mastWire.position.y = 8.5;
    pylonGroup.add(mastWire);

    // Cross-arms for holding cable anchors
    const armGeom = new THREE.BoxGeometry(6, 0.4, 0.4);
    const arm1 = new THREE.LineSegments(new THREE.EdgesGeometry(armGeom), Materials.blueprintLine);
    arm1.position.set(0, 13, 0);
    const arm2 = new THREE.LineSegments(new THREE.EdgesGeometry(armGeom), Materials.blueprintLine);
    arm2.position.set(0, 16, 0);
    pylonGroup.add(arm1, arm2);

    this.mesh.add(pylonGroup);

    // 3. Hanging overhead cables (curves)
    const cableCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6, 7, 0),     // pylon arm level 1 (relative to mesh center)
        new THREE.Vector3(0, 2, 0),      // sagging center
        new THREE.Vector3(5, -0.1, 0)     // transformer bushing entry
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6, 10, 0),    // pylon arm level 2
        new THREE.Vector3(0, 4, 0),      // sagging center
        new THREE.Vector3(5, -0.1, 0)     // transformer bushing entry
      ])
    ];

    cableCurves.forEach(curve => {
      const points = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, Materials.blueprintLineDark);
      this.mesh.add(line);
      this.cables.push(curve);
    });

    // 4. Flowing Sparks/Electrical Flow particles
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.flowParticles = new THREE.Points(particleGeom, Materials.energyParticle);
    this.mesh.add(this.flowParticles);

    // Set particle initial progress states
    this.particleData = [];
    for (let i = 0; i < this.particleCount; i++) {
      const curveIndex = i % this.cables.length;
      const progress = Math.random();
      const speed = 0.3 + Math.random() * 0.4;
      this.particleData.push({ curveIndex, progress, speed });
    }

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    if (!this.initialized || !this.flowParticles) return;

    const positions = this.flowParticles.geometry.attributes.position.array;

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particleData[i];
      p.progress += p.speed * delta;
      if (p.progress > 1) p.progress = 0;

      const curve = this.cables[p.curveIndex];
      const pt = curve.getPointAt(p.progress);

      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;
    }
    this.flowParticles.geometry.attributes.position.needsUpdate = true;
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

export default new ElectricalGrid();
