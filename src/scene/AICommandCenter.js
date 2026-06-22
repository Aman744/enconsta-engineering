import * as THREE from 'three';
import { Colors } from '../assets/Colors.js';
import { Materials } from '../assets/Materials.js';

class AICommandCenter {
  constructor() {
    this.mesh = new THREE.Group();
    this.centerNode = null;
    this.nodes = [];
    this.connections = [];
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // 1. Central Core Node (glowing reactor column)
    const coreGeom = new THREE.CylinderGeometry(1.5, 1.5, 12, 16);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x051a3a,
      emissive: 0x0a2540,
      specular: 0x00b4d8,
      shininess: 50,
      wireframe: true // High-tech grid look
    });
    this.centerNode = new THREE.Mesh(coreGeom, coreMat);
    this.centerNode.position.set(0, 0, -5);
    this.mesh.add(this.centerNode);

    // 2. Surrounding Floating AI Agent Spheres
    const nodeSpecs = [
      { x: -8, y: 4, z: -2, label: "P&ID Auto Review" },
      { x: 8, y: 3, z: -3, label: "Asset Integrity" },
      { x: -7, y: -4, z: 0, label: "Predictive Maintenance" },
      { x: 7, y: -3, z: -1, label: "Document Generation" }
    ];

    const sphereGeom = new THREE.SphereGeometry(0.8, 12, 12);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x00b4d8,
      emissive: 0x003f6f,
      shininess: 100
    });

    nodeSpecs.forEach((spec, i) => {
      const nodeMesh = new THREE.Mesh(sphereGeom, sphereMat);
      nodeMesh.position.set(spec.x, spec.y, spec.z);
      this.mesh.add(nodeMesh);
      this.nodes.push(nodeMesh);

      // 3. Connectors to Center Node
      const start = nodeMesh.position;
      const end = this.centerNode.position;

      const lineGeom = new THREE.BufferGeometry().setFromPoints([start, end]);
      const line = new THREE.Line(lineGeom, Materials.blueprintLine);
      this.mesh.add(line);

      // Animated tracer particle along line
      const tracerGeom = new THREE.BufferGeometry();
      const pos = new Float32Array(3);
      tracerGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const tracer = new THREE.Points(tracerGeom, Materials.energyParticle);
      this.mesh.add(tracer);

      this.connections.push({
        start,
        end,
        tracer,
        progress: Math.random(),
        speed: 0.5 + Math.random() * 0.5
      });
    });

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    if (!this.initialized) return;

    // Slowly rotate central core
    if (this.centerNode) {
      this.centerNode.rotation.y = time * 0.15;
    }

    // Floating animation for surrounding nodes
    this.nodes.forEach((node, i) => {
      node.position.y += Math.sin(time * 2 + i) * 0.005;
    });

    // Move data tracer particles along connections
    this.connections.forEach(conn => {
      conn.progress += conn.speed * delta;
      if (conn.progress > 1) conn.progress = 0;

      const currentPos = new THREE.Vector3().lerpVectors(conn.start, conn.end, conn.progress);
      const array = conn.tracer.geometry.attributes.position.array;
      array[0] = currentPos.x;
      array[1] = currentPos.y;
      array[2] = currentPos.z;
      conn.tracer.geometry.attributes.position.needsUpdate = true;
    });
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

export default new AICommandCenter();
