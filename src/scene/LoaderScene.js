import * as THREE from 'three';
import { Colors } from '../assets/Colors.js';

class LoaderScene {
  constructor() {
    this.canvas = document.getElementById('loader-3d-canvas');
    if (!this.canvas) return;

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.animationFrameId = null;
    this.clock = new THREE.Clock();

    // Progress interpolation
    this.targetProgress = 0;
    this.currentProgress = 0;

    // Groups
    this.refineryGroup = new THREE.Group();
    this.baseGroup = new THREE.Group();
    this.structuresGroup = new THREE.Group();
    this.pipesGroup = new THREE.Group();
    this.lightsGroup = new THREE.Group();
    
    // Scanning laser
    this.scanBeam = null;
    
    // Array of components to grow dynamically
    this.columns = [];
    this.cabins = [];
    this.pipes = [];

    this.init();
  }

  init() {
    // 1. Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power' // Preloader should be lightweight
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // 2. Initialize Scene and Camera
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 9, 20);
    this.camera.lookAt(0, 2.5, 0);

    // 3. Assemble Refinery Groups
    this.refineryGroup.position.set(0, -1, 0);
    this.scene.add(this.refineryGroup);
    
    this.refineryGroup.add(this.baseGroup);
    this.refineryGroup.add(this.structuresGroup);
    this.refineryGroup.add(this.pipesGroup);
    this.refineryGroup.add(this.lightsGroup);

    this.buildRefineryModel();
    this.buildScanningBeam();

    // 4. Start Render Loop
    this.animate();

    // 5. Add Resize Handler
    this.resizeHandler = () => this.onResize();
    window.addEventListener('resize', this.resizeHandler);
    this.onResize();
  }

  buildRefineryModel() {
    const accentColor = Colors.three.accent;
    const secondaryColor = Colors.three.secondary;

    // Blueprint materials
    const lineMat = new THREE.LineBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.45
    });

    const structureMat = new THREE.LineBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: 0.25
    });

    const fillMat = new THREE.MeshBasicMaterial({
      color: 0x030c1e,
      transparent: true,
      opacity: 0.7,
      wireframe: false
    });

    // A. Base circular blueprint pad
    const ringGeomOuter = new THREE.RingGeometry(5.8, 6, 32);
    const ringOuter = new THREE.LineLoop(new THREE.EdgesGeometry(ringGeomOuter), lineMat);
    ringOuter.rotation.x = Math.PI / 2;
    this.baseGroup.add(ringOuter);

    const ringGeomInner = new THREE.RingGeometry(3.8, 4, 32);
    const ringInner = new THREE.LineLoop(new THREE.EdgesGeometry(ringGeomInner), structureMat);
    ringInner.rotation.x = Math.PI / 2;
    this.baseGroup.add(ringInner);

    // Radial grids
    const radialGeom = new THREE.BufferGeometry();
    const radialVertices = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      radialVertices.push(0, 0, 0, Math.cos(angle) * 6, 0, Math.sin(angle) * 6);
    }
    radialGeom.setAttribute('position', new THREE.Float32BufferAttribute(radialVertices, 3));
    const radialLines = new THREE.LineSegments(radialGeom, structureMat);
    this.baseGroup.add(radialLines);

    // B. Distillation Columns (cylinders)
    // Column 1 (Tall Main Column)
    this.createColumn(0.7, 8, new THREE.Vector3(-1.8, 4, 0), lineMat, fillMat);
    // Column 2 (Medium Reactor)
    this.createColumn(1.0, 5.5, new THREE.Vector3(1.8, 2.75, -1), lineMat, fillMat);
    // Column 3 (Short Sphere Vessel)
    this.createSphereVessel(1.3, new THREE.Vector3(0, 1.8, 1.8), lineMat, fillMat);

    // C. Structural support truss around Tall Column
    const trussGeom = new THREE.BoxGeometry(2, 8.5, 2);
    const trussEdges = new THREE.EdgesGeometry(trussGeom);
    const truss = new THREE.LineSegments(trussEdges, structureMat);
    truss.position.set(-1.8, 4.25, 0);
    this.structuresGroup.add(truss);
    this.columns.push({ mesh: truss, targetY: 4.25, startProgress: 0.05, endProgress: 0.45 });

    // D. Structural frame around Medium Reactor
    const frameGeom = new THREE.BoxGeometry(2.6, 6, 2.6);
    const frameEdges = new THREE.EdgesGeometry(frameGeom);
    const frame = new THREE.LineSegments(frameEdges, structureMat);
    frame.position.set(1.8, 3, -1);
    this.structuresGroup.add(frame);
    this.columns.push({ mesh: frame, targetY: 3, startProgress: 0.15, endProgress: 0.55 });

    // E. Connecting Pipeline corridors (represented by tube wireframes)
    // Pipe 1: Column 1 to Column 2
    this.createPipe(
      [new THREE.Vector3(-1.8, 6.5, 0), new THREE.Vector3(0, 6.5, -0.5), new THREE.Vector3(1.8, 4.5, -1)],
      0.15,
      lineMat,
      0.45,
      0.85
    );
    // Pipe 2: Column 2 to Sphere Vessel
    this.createPipe(
      [new THREE.Vector3(1.8, 2, -1), new THREE.Vector3(1.8, 0.5, 1.8), new THREE.Vector3(0, 1.8, 1.8)],
      0.12,
      lineMat,
      0.55,
      0.9
    );
    // Pipe 3: Ground outlet pipe
    this.createPipe(
      [new THREE.Vector3(-1.8, 1.5, 0), new THREE.Vector3(-4, 0.5, 0), new THREE.Vector3(-5, 0.5, 3)],
      0.1,
      structureMat,
      0.3,
      0.7
    );

    // F. Pulse lights / blinking beacons on top of columns
    this.addBeacon(new THREE.Vector3(-1.8, 8, 0), 0x00ffcc);
    this.addBeacon(new THREE.Vector3(1.8, 5.5, -1), 0x00b4d8);
    this.addBeacon(new THREE.Vector3(0, 3.1, 1.8), 0x00ffcc);
  }

  createColumn(radius, height, position, lineMat, fillMat) {
    const colGroup = new THREE.Group();
    colGroup.position.copy(position);

    // Solid base fill
    const geom = new THREE.CylinderGeometry(radius, radius, height, 8, 4, true);
    const mesh = new THREE.Mesh(geom, fillMat);
    colGroup.add(mesh);

    // Wireframe outline
    const edges = new THREE.EdgesGeometry(geom);
    const wire = new THREE.LineSegments(edges, lineMat);
    colGroup.add(wire);

    // Dynamic horizontal banding rings
    const ringCount = Math.floor(height / 1.5);
    for (let i = 0; i <= ringCount; i++) {
      const ringGeom = new THREE.RingGeometry(radius, radius + 0.1, 12);
      const ring = new THREE.LineLoop(new THREE.EdgesGeometry(ringGeom), lineMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -height / 2 + (i / ringCount) * height;
      colGroup.add(ring);
    }

    this.structuresGroup.add(colGroup);
    
    // Track for scaling
    this.columns.push({
      mesh: colGroup,
      targetY: position.y,
      height: height,
      startProgress: 0.2,
      endProgress: 0.7
    });
  }

  createSphereVessel(radius, position, lineMat, fillMat) {
    const sphereGroup = new THREE.Group();
    sphereGroup.position.copy(position);

    // Solid mesh
    const geom = new THREE.SphereGeometry(radius, 8, 8);
    const mesh = new THREE.Mesh(geom, fillMat);
    sphereGroup.add(mesh);

    // Wireframe edges
    const edges = new THREE.EdgesGeometry(geom);
    const wire = new THREE.LineSegments(edges, lineMat);
    sphereGroup.add(wire);

    // Leg supports
    const legGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 4);
    const legMat = lineMat;
    const legPositions = [
      { x: -radius * 0.7, z: -radius * 0.7 },
      { x: radius * 0.7, z: -radius * 0.7 },
      { x: -radius * 0.7, z: radius * 0.7 },
      { x: radius * 0.7, z: radius * 0.7 }
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeom, legMat);
      leg.position.set(pos.x, -1, pos.z);
      sphereGroup.add(leg);
    });

    this.structuresGroup.add(sphereGroup);

    this.columns.push({
      mesh: sphereGroup,
      targetY: position.y,
      height: radius * 2 + 1,
      startProgress: 0.3,
      endProgress: 0.75
    });
  }

  createPipe(points, radius, mat, startProgress, endProgress) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 20, radius, 4, false);
    const edges = new THREE.EdgesGeometry(geom);
    const pipeWire = new THREE.LineSegments(edges, mat);
    
    this.pipesGroup.add(pipeWire);
    this.pipes.push({
      mesh: pipeWire,
      startProgress,
      endProgress
    });
  }

  addBeacon(position, colorHex) {
    const beaconGeom = new THREE.SphereGeometry(0.15, 6, 6);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0
    });
    const beacon = new THREE.Mesh(beaconGeom, beaconMat);
    beacon.position.copy(position);
    this.lightsGroup.add(beacon);
  }

  buildScanningBeam() {
    const beamGeom = new THREE.RingGeometry(0, 6.2, 32);
    const beamMat = new THREE.MeshBasicMaterial({
      color: Colors.three.accent,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    const beam = new THREE.Group();
    const mesh = new THREE.Mesh(beamGeom, beamMat);
    mesh.rotation.x = Math.PI / 2;
    beam.add(mesh);

    // Glowing border ring
    const borderGeom = new THREE.RingGeometry(6.1, 6.2, 32);
    const borderMat = new THREE.MeshBasicMaterial({
      color: Colors.three.accent,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const borderMesh = new THREE.Mesh(borderGeom, borderMat);
    borderMesh.rotation.x = Math.PI / 2;
    beam.add(borderMesh);

    beam.position.y = 0;
    this.refineryGroup.add(beam);
    this.scanBeam = beam;
  }

  updateProgress(progress) {
    this.targetProgress = progress;
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();
    const delta = this.clock.getDelta();

    // 1. Interpolate loading progress for smooth animation
    this.currentProgress += (this.targetProgress - this.currentProgress) * 0.08;

    // 2. Rotate the refinery scene gently
    this.refineryGroup.rotation.y = time * 0.16;

    // 3. Animate Refinery Components based on progress milestones
    // A. Base Pad fades in quickly
    const baseScale = Math.min(1.0, this.currentProgress / 0.15);
    this.baseGroup.scale.set(baseScale, 1, baseScale);
    this.baseGroup.traverse(child => {
      if (child.material) {
        child.material.opacity = baseScale * 0.35;
      }
    });

    // B. Columns & Trusses grow vertically
    this.columns.forEach(col => {
      const p = this.currentProgress;
      const range = col.endProgress - col.startProgress;
      let factor = (p - col.startProgress) / range;
      factor = Math.max(0.001, Math.min(1.0, factor));

      // Ease-out scale
      const scaleY = 0.001 + (1.0 - 0.001) * factor;
      col.mesh.scale.set(1, scaleY, 1);

      // Keep position aligned to growing base
      if (col.height) {
        col.mesh.position.y = col.targetY - (col.height / 2) * (1.0 - scaleY);
      }
    });

    // C. Pipes assemble later
    this.pipes.forEach(pipe => {
      const p = this.currentProgress;
      const range = pipe.endProgress - pipe.startProgress;
      let factor = (p - pipe.startProgress) / range;
      factor = Math.max(0, Math.min(1.0, factor));

      pipe.mesh.scale.setScalar(factor);
      if (pipe.mesh.material) {
        pipe.mesh.material.opacity = factor * 0.45;
      }
    });

    // D. Beacons pulse on complete
    this.lightsGroup.children.forEach((beacon, idx) => {
      const pulseSpeed = 4.0;
      const offset = idx * 1.5;
      const intensity = (Math.sin(time * pulseSpeed + offset) + 1.0) / 2.0;
      
      const p = this.currentProgress;
      const threshold = 0.7 + idx * 0.1;
      const activeFactor = p > threshold ? Math.min(1.0, (p - threshold) / 0.1) : 0;
      
      if (beacon.material) {
        beacon.material.opacity = activeFactor * (0.3 + intensity * 0.7);
        beacon.scale.setScalar(0.7 + intensity * 0.5);
      }
    });

    // 4. Animate Scanning Laser Beam
    if (this.scanBeam) {
      // Beam sweeps up and down columns
      const maxSweepHeight = 7.8;
      const sweepPos = (Math.sin(time * 2.2) + 1.0) / 2.0; // 0 to 1
      
      // Scale sweep vertical range based on current progress
      const targetHeight = sweepPos * maxSweepHeight * Math.min(1.0, this.currentProgress * 1.1);
      this.scanBeam.position.y = targetHeight;
      
      // Sweep fades out when loaded
      if (this.currentProgress > 0.98) {
        const fade = Math.max(0, 1.0 - (this.currentProgress - 0.98) / 0.02);
        this.scanBeam.traverse(child => {
          if (child.material) {
            child.material.opacity *= fade;
          }
        });
      }
    }

    // 5. Render Scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    console.log('[LoaderScene] Disposing WebGL loader resources...');

    // Remove resize listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    // Cancel animation frame loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Traverse and dispose materials and geometries
    if (this.scene) {
      this.scene.traverse(child => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.scene.clear();
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Nullify objects
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;

    // Delete canvas from DOM to free memory
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

export default LoaderScene;
