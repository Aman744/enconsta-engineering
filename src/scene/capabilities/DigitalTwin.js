import * as THREE from 'three';
import { Colors } from '../../assets/Colors.js';
import { Materials } from '../../assets/Materials.js';

class DigitalTwin {
  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.position.set(45, 0, 0); // Position on the camera journey track
    this.coreMesh = null;
    this.scanPlane = null;
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // Wireframe reactor cylinder
    const geom = new THREE.CylinderGeometry(1.6, 1.6, 9, 12);
    const edges = new THREE.EdgesGeometry(geom);
    this.coreMesh = new THREE.LineSegments(edges, Materials.blueprintLine);
    this.mesh.add(this.coreMesh);

    // Glowing scanning horizontal plane
    const planeGeom = new THREE.BoxGeometry(4, 0.1, 4);
    const planeMat = new THREE.MeshPhongMaterial({
      color: Colors.three.accent,
      emissive: 0x003f6f,
      transparent: true,
      opacity: 0.5
    });
    this.scanPlane = new THREE.Mesh(planeGeom, planeMat);
    this.mesh.add(this.scanPlane);

    // Node network links
    const nodeGeom = new THREE.SphereGeometry(0.3, 6, 6);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const positions = [
      [-2, 3, -1],
      [2, 1, 2],
      [-1.5, -2, 1.5],
      [1.8, -3, -2]
    ];
    positions.forEach(pos => {
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      node.position.set(...pos);
      this.mesh.add(node);
    });

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    // Animate scan plane moving up and down the vessel column
    if (this.scanPlane) {
      this.scanPlane.position.y = Math.sin(time * 1.5) * 4.5;
    }
    if (this.coreMesh) {
      this.coreMesh.rotation.y = time * 0.12;
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

export default new DigitalTwin();
