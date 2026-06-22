import * as THREE from 'three';
import { Materials } from '../../assets/Materials.js';

class PipelineCorridor {
  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.position.set(-15, 0, 0); // Position on the camera journey track
    this.pipes = [];
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    const specs = [
      { start: [-10, -2, -5], end: [10, -2, -5], r: 0.3 },
      { start: [-10, 0, -2], end: [10, 0, -2], r: 0.2 },
      { start: [-10, 2, -7], end: [10, 2, -7], r: 0.4 },
      { start: [-5, -5, -4], end: [-5, 5, -4], r: 0.25 } // Vertical cross-pipe
    ];

    specs.forEach((spec, i) => {
      const startVec = new THREE.Vector3(...spec.start);
      const endVec = new THREE.Vector3(...spec.end);
      const distance = startVec.distanceTo(endVec);

      const pipeGeom = new THREE.CylinderGeometry(spec.r, spec.r, distance, 8);
      const pipe = new THREE.Mesh(pipeGeom, Materials.refineryMetal);

      const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
      const alignAxis = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, direction);

      pipe.quaternion.copy(quaternion);
      pipe.position.copy(new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5));
      this.mesh.add(pipe);
      this.pipes.push(pipe);
    });

    // Support framework
    const frameGeom = new THREE.BoxGeometry(16, 6, 8);
    const edges = new THREE.EdgesGeometry(frameGeom);
    const framework = new THREE.LineSegments(edges, Materials.blueprintLineDark);
    this.mesh.add(framework);

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    // Subtle pipe animation if needed
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

export default new PipelineCorridor();
