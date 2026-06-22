import * as THREE from 'three';
import { Materials } from '../../assets/Materials.js';

class ProcessPlant {
  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.position.set(-45, 0, 0); // Position on the camera journey track
    this.reactor = null;
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // High-precision vessel column
    const geom = new THREE.CylinderGeometry(1.8, 1.8, 10, 16);
    this.reactor = new THREE.Mesh(geom, Materials.refineryMetal);
    this.mesh.add(this.reactor);

    // Grid support ring
    const ringGeom = new THREE.TorusGeometry(2.2, 0.15, 8, 24);
    const ring = new THREE.Mesh(ringGeom, Materials.refineryMetalDark);
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    // Structural outline
    const frameGeom = new THREE.BoxGeometry(4.5, 12, 4.5);
    const edges = new THREE.EdgesGeometry(frameGeom);
    const frame = new THREE.LineSegments(edges, Materials.blueprintLine);
    this.mesh.add(frame);

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    if (this.reactor) {
      this.reactor.rotation.y = time * 0.1;
    }
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

export default new ProcessPlant();
