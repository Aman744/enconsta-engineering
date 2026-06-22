import * as THREE from 'three';
import { Colors } from '../assets/Colors.js';
import { Materials } from '../assets/Materials.js';
import { SceneLifecycle } from '../core/SceneLifecycle.js';
import AnimationController, { gsap } from '../core/AnimationController.js';

class Refinery {
  constructor() {
    this.mesh = new THREE.Group();
    this.columns = [];
    this.structures = [];
    this.pipes = [];
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // Generate procedural distillation columns
    this.createDistillationColumns();

    // Generate structural frameworks (truss grids)
    this.createStructuralTrusses();

    // Generate connecting pipelines
    this.createConnectingPipes();

    parentGroup.add(this.mesh);
    this.initialized = true;

    // Trigger Scroll-bound GSAP assembly timeline
    this.setupAssemblyAnimation();
  }

  createDistillationColumns() {
    const colSpecs = [
      { radius: 2.2, height: 16, x: -6, z: -4 },
      { radius: 1.5, height: 22, x: 2, z: -8 },
      { radius: 1.8, height: 18, x: 8, z: -2 },
      { radius: 3.0, height: 8, x: -12, z: -10 } // Spherical storage tank base
    ];

    colSpecs.forEach((spec, i) => {
      const group = new THREE.Group();
      group.position.set(spec.x, -10, spec.z); // Start low for assembly growth

      // Distillation Column Cylinder
      const geom = new THREE.CylinderGeometry(spec.radius, spec.radius, spec.height, 16);
      const mesh = new THREE.Mesh(geom, Materials.refineryMetal);
      mesh.position.y = spec.height / 2;
      group.add(mesh);

      // Rings on columns for mechanical detail
      const ringCount = Math.floor(spec.height / 3);
      for (let r = 0; r < ringCount; r++) {
        const ringGeom = new THREE.CylinderGeometry(spec.radius + 0.15, spec.radius + 0.15, 0.2, 16);
        const ringMesh = new THREE.Mesh(ringGeom, Materials.refineryMetalDark);
        ringMesh.position.y = (r * 3) + 1.5;
        group.add(ringMesh);
      }

      this.mesh.add(group);
      this.columns.push(group);
    });
  }

  createStructuralTrusses() {
    // Generate structural grid of thin beams (trusses) surrounding the columns
    const frameGeom = new THREE.BoxGeometry(6, 12, 6);
    const edges = new THREE.EdgesGeometry(frameGeom);
    const line = new THREE.LineSegments(edges, Materials.blueprintLineDark);
    line.position.set(-6, -4, -4);
    line.scale.set(1, 0, 1); // Start flat for vertical assembly growth

    this.mesh.add(line);
    this.structures.push(line);

    // Second support frame
    const frameGeom2 = new THREE.BoxGeometry(5, 18, 5);
    const edges2 = new THREE.EdgesGeometry(frameGeom2);
    const line2 = new THREE.LineSegments(edges2, Materials.blueprintLineDark);
    line2.position.set(2, -1, -8);
    line2.scale.set(1, 0, 1);

    this.mesh.add(line2);
    this.structures.push(line2);
  }

  createConnectingPipes() {
    // Horizontal and vertical pipe lines running between columns
    const pipePaths = [
      { start: [-6, 2, -4], end: [2, 2, -8], radius: 0.2 },
      { start: [2, 6, -8], end: [8, 6, -2], radius: 0.15 },
      { start: [-12, -2, -10], end: [-6, -2, -4], radius: 0.25 }
    ];

    pipePaths.forEach((path) => {
      const startVec = new THREE.Vector3(...path.start);
      const endVec = new THREE.Vector3(...path.end);
      const distance = startVec.distanceTo(endVec);

      const pipeGeom = new THREE.CylinderGeometry(path.radius, path.radius, distance, 8);
      const pipeMesh = new THREE.Mesh(pipeGeom, Materials.refineryMetal);

      // Rotate and position cylinder to align with start/end path
      const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
      const alignAxis = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, direction);
      
      pipeMesh.quaternion.copy(quaternion);
      pipeMesh.position.copy(new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5));
      pipeMesh.scale.set(1, 0, 1); // Start length at zero

      this.mesh.add(pipeMesh);
      this.pipes.push(pipeMesh);
    });
  }

  setupAssemblyAnimation() {
    const tl = AnimationController.createTimeline('refinery-assembly', {
      scrollTrigger: {
        trigger: '.universe-canvas-trigger',
        start: 'top bottom',
        end: 'bottom center',
        scrub: 1.5
      }
    });

    // 1. Distillation Columns grow upwards and fade in
    this.columns.forEach((col, i) => {
      tl.to(col.position, {
        y: 0,
        duration: 1.5,
        ease: 'power3.out'
      }, i * 0.2);
    });

    // 2. Structural frames scale up vertically
    this.structures.forEach((struct, i) => {
      tl.to(struct.scale, {
        y: 1,
        duration: 1.2,
        ease: 'power2.inOut'
      }, `-=${1.0}`);
    });

    // 3. Interconnecting pipelines grow length-wise
    this.pipes.forEach((pipe, i) => {
      tl.to(pipe.scale, {
        y: 1,
        duration: 1.0,
        ease: 'power1.inOut'
      }, `-=${0.8}`);
    });
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    // Subtle rotation during scroll focus
    if (this.mesh) {
      this.mesh.rotation.y = time * 0.05;
    }
  }

  dispose() {
    this.columns.forEach(col => {
      col.traverse(child => SceneLifecycle.disposeObject(child));
    });
    this.structures.forEach(struct => SceneLifecycle.disposeObject(struct));
    this.pipes.forEach(pipe => SceneLifecycle.disposeObject(pipe));
    this.mesh.clear();
  }
}

export default new Refinery();
