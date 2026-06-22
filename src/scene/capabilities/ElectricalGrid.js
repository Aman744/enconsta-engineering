import * as THREE from 'three';
import { Materials } from '../../assets/Materials.js';

class ElectricalGrid {
  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.position.set(15, 0, 0); // Position on the camera journey track
    this.tower = null;
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // Grid truss transmission tower
    const towerGeom = new THREE.CylinderGeometry(0.3, 2.0, 12, 4);
    const edges = new THREE.EdgesGeometry(towerGeom);
    this.tower = new THREE.LineSegments(edges, Materials.blueprintLine);
    this.tower.position.y = 1;
    this.mesh.add(this.tower);

    // Cross-arms
    const armGeom = new THREE.BoxGeometry(6, 0.2, 0.4);
    const arm1 = new THREE.Mesh(armGeom, Materials.refineryMetalDark);
    arm1.position.set(0, 4, 0);
    this.mesh.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, Materials.refineryMetalDark);
    arm2.position.set(0, 6.5, 0);
    this.mesh.add(arm2);

    // Connecting wires
    const wireGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, 4, 0),
      new THREE.Vector3(-3, 4, 0),
      new THREE.Vector3(3, 4, 0),
      new THREE.Vector3(10, 4, 0)
    ]);
    const wire = new THREE.Line(wireGeom, Materials.blueprintLine);
    this.mesh.add(wire);

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    // Subtle rotation or pulse
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
