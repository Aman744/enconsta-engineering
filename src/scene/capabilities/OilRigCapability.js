import * as THREE from 'three';
import { SceneLifecycle } from '../../core/SceneLifecycle.js';
import StateManager from '../../core/StateManager.js';

class OilRigCapability {
  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.position.set(32, 0, 0); // Positioned further right to prevent text overlap
    this.mesh.scale.setScalar(0.82); // Scaled down slightly to fit the visual column
    this.initialized = false;

    // Rig components
    this.columns = [];
    this.trusses = null;
    this.deck = null;
    this.cabins = null;
    this.derrick = null;
    this.cranes = [];
    this.flareStack = null;
    this.redBeacon = null;
    this.spotlights = null;
  }

  mount(parentGroup) {
    console.log('[OilRigCapability] mount() called, initialized =', this.initialized);
    if (this.initialized) {
      parentGroup.add(this.mesh);
      this.adjustPositionForSection();
      return;
    }

    console.log('[OilRigCapability] Generating complete offshore oil platform for Capabilities...');

    // 1. Create oil rig structure (columns, deck, trusses, derrick, cranes)
    this.createRigStructure();

    // 2. Create spotlights and beacons
    this.createRigLights();

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  createRigStructure() {
    const rigGroup = new THREE.Group();
    rigGroup.position.y = -10; // Position relative to sea level

    // Blueprint line material
    const blueLineMat = new THREE.LineBasicMaterial({
      color: 0x00b4d8,
      transparent: true,
      opacity: 0.8
    });

    // Dark semi-transparent deck solid fill
    const deckFillMat = new THREE.MeshBasicMaterial({
      color: 0x03071e,
      transparent: true,
      opacity: 0.85
    });

    // A. Four Main Pillars (glowing blueprint columns)
    const pillarGeom = new THREE.BoxGeometry(2.5, 12, 2.5);
    const pillarPositions = [
      { x: -5, z: -5 },
      { x: 5, z: -5 },
      { x: -5, z: 5 },
      { x: 5, z: 5 }
    ];

    pillarPositions.forEach(pos => {
      const pGroup = new THREE.Group();
      pGroup.position.set(pos.x, 6, pos.z); // resting on sea level

      const mesh = new THREE.Mesh(pillarGeom, deckFillMat);
      pGroup.add(mesh);

      const edges = new THREE.EdgesGeometry(pillarGeom);
      const wire = new THREE.LineSegments(edges, blueLineMat);
      pGroup.add(wire);

      rigGroup.add(pGroup);
      this.columns.push(pGroup);
    });

    // B. Diagonal truss bracing between pillars
    const trussGeom = new THREE.BufferGeometry();
    const trussVertices = new Float32Array([
      -5, 2, -5, 5, 10, -5,
      -5, 10, -5, 5, 2, -5,
      -5, 2, 5, 5, 10, 5,
      -5, 10, 5, 5, 2, 5,
      -5, 2, -5, -5, 10, 5,
      -5, 10, -5, -5, 2, 5,
      5, 2, -5, 5, 10, 5,
      5, 10, -5, 5, 2, 5
    ]);
    trussGeom.setAttribute('position', new THREE.BufferAttribute(trussVertices, 3));
    const sideTrusses = new THREE.LineSegments(trussGeom, blueLineMat);
    rigGroup.add(sideTrusses);
    this.trusses = sideTrusses;

    // C. Main Deck Platform
    const deckGroup = new THREE.Group();
    deckGroup.position.set(0, 12.9, 0); // 12 + 0.9 = 12.9

    const deckGeom = new THREE.BoxGeometry(15, 1.8, 15);
    const deckMesh = new THREE.Mesh(deckGeom, deckFillMat);
    const deckEdges = new THREE.EdgesGeometry(deckGeom);
    const deckWire = new THREE.LineSegments(deckEdges, blueLineMat);
    deckGroup.add(deckMesh);
    deckGroup.add(deckWire);
    rigGroup.add(deckGroup);
    this.deck = deckGroup;

    // D. Multi-level Sub-decks and cabins
    const cabinsGroup = new THREE.Group();
    cabinsGroup.position.set(-2, 15.3, -2); // 12 + 1.8 + 1.5 = 15.3

    const cabinGeom = new THREE.BoxGeometry(8, 3, 5);
    const cabinMesh = new THREE.Mesh(cabinGeom, deckFillMat);
    const cabinEdges = new THREE.EdgesGeometry(cabinGeom);
    const cabinWire = new THREE.LineSegments(cabinEdges, blueLineMat);
    cabinsGroup.add(cabinMesh);
    cabinsGroup.add(cabinWire);
    rigGroup.add(cabinsGroup);
    this.cabins = cabinsGroup;

    // E. Central Drilling Derrick
    const derrickGroup = new THREE.Group();
    derrickGroup.position.set(0, 13.8, 2); // 12 + 1.8 = 13.8
    derrickGroup.rotation.y = Math.PI / 4;

    // Layer 1
    const baseTowerGeom = new THREE.CylinderGeometry(1.6, 2.5, 6, 4, 1, true);
    const baseTowerWire = new THREE.LineSegments(new THREE.EdgesGeometry(baseTowerGeom), blueLineMat);
    baseTowerWire.position.y = 3;
    derrickGroup.add(baseTowerWire);

    // Layer 2
    const midTowerGeom = new THREE.CylinderGeometry(0.9, 1.6, 6, 4, 1, true);
    const midTowerWire = new THREE.LineSegments(new THREE.EdgesGeometry(midTowerGeom), blueLineMat);
    midTowerWire.position.y = 9;
    derrickGroup.add(midTowerWire);

    // Layer 3
    const topTowerGeom = new THREE.CylinderGeometry(0.3, 0.9, 5, 4, 1, true);
    const topTowerWire = new THREE.LineSegments(new THREE.EdgesGeometry(topTowerGeom), blueLineMat);
    topTowerWire.position.y = 14.5;
    derrickGroup.add(topTowerWire);

    // Custom derrick diagonal lattice lines
    const derrickLatticeGeom = new THREE.BufferGeometry();
    const derrickLatticeVertices = new Float32Array([
      -2, 0, -2, 1.3, 6, -1.3,
      2, 0, -2, -1.3, 6, -1.3,
      -2, 0, 2, 1.3, 6, 1.3,
      2, 0, 2, -1.3, 6, 1.3,

      -1.3, 6, -1.3, 0.8, 12, -0.8,
      1.3, 6, -1.3, -0.8, 12, -0.8,
      -1.3, 6, 1.3, 0.8, 12, 0.8,
      1.3, 6, 1.3, -0.8, 12, 0.8
    ]);
    derrickLatticeGeom.setAttribute('position', new THREE.BufferAttribute(derrickLatticeVertices, 3));
    const derrickLattice = new THREE.LineSegments(derrickLatticeGeom, blueLineMat);
    derrickLattice.position.y = 0;
    derrickGroup.add(derrickLattice);

    rigGroup.add(derrickGroup);
    this.derrick = derrickGroup;

    // F. Blueprint Cranes
    const cranePositions = [
      { x: -6.5, y: 13.8, z: 5.5, rotY: -Math.PI / 4, length: 7 },
      { x: 6.5, y: 13.8, z: -5.5, rotY: Math.PI * 0.75, length: 6 }
    ];

    this.cranes = [];
    cranePositions.forEach(c => {
      const crane = new THREE.Group();
      crane.position.set(c.x, c.y, c.z);
      crane.rotation.y = c.rotY;

      const baseGeom = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 5);
      const baseWire = new THREE.LineSegments(new THREE.EdgesGeometry(baseGeom), blueLineMat);
      baseWire.position.y = 0.75;
      crane.add(baseWire);

      const boomGeom = new THREE.CylinderGeometry(0.1, 0.3, c.length, 3);
      const boomWire = new THREE.LineSegments(new THREE.EdgesGeometry(boomGeom), blueLineMat);
      boomWire.rotation.z = Math.PI / 3;
      boomWire.position.set(c.length * 0.25, c.length * 0.4, 0);
      crane.add(boomWire);

      const cableGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(c.length * 0.5, c.length * 0.8, 0),
        new THREE.Vector3(c.length * 0.5, c.length * 0.2, 0)
      ]);
      const cable = new THREE.Line(cableGeom, blueLineMat);
      crane.add(cable);

      rigGroup.add(crane);
      this.cranes.push(crane);
    });

    // G. Flare Stack
    const stack = new THREE.Group();
    stack.position.set(6, 13.8, 6);
    stack.rotation.z = -Math.PI / 8;

    const stackGeom = new THREE.CylinderGeometry(0.2, 0.35, 9, 5);
    const stackWire = new THREE.LineSegments(new THREE.EdgesGeometry(stackGeom), blueLineMat);
    stackWire.position.y = 4.5;
    stack.add(stackWire);

    rigGroup.add(stack);
    this.flareStack = stack;

    this.mesh.add(rigGroup);
  }

  createRigLights() {
    // 1. Warning Beacon
    const beaconGeom = new THREE.SphereGeometry(0.35, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xff0033,
      transparent: true,
      opacity: 1.0
    });
    this.redBeacon = new THREE.Mesh(beaconGeom, beaconMat);
    this.redBeacon.position.set(0, 20.8, 2); // 20.8 absolute relative to this.mesh (rigGroup y=-10)
    this.mesh.add(this.redBeacon);

    // 2. Spotlights
    const lightPositions = [
      [-7, 3.8, -7], [7, 3.8, -7], [-7, 3.8, 7], [7, 3.8, 7],
      [-7, 3.8, 0], [7, 3.8, 0], [0, 3.8, -7],
      [-2, 6.8, -2], [1, 6.8, -3],
      [-0.8, 6.8, 2.8], [0.8, 6.8, 1.2],
      [-0.5, 12.8, 2.5], [0.5, 12.8, 1.5],
      [0, 18.3, 2]
    ];

    const lightsGeometry = new THREE.BufferGeometry();
    const lightsPositionsArray = new Float32Array(lightPositions.length * 3);
    const colorsArray = new Float32Array(lightPositions.length * 3);

    lightPositions.forEach((pos, idx) => {
      lightsPositionsArray[idx * 3] = pos[0];
      lightsPositionsArray[idx * 3 + 1] = pos[1];
      lightsPositionsArray[idx * 3 + 2] = pos[2];

      colorsArray[idx * 3] = 1.0;
      colorsArray[idx * 3 + 1] = 0.7;
      colorsArray[idx * 3 + 2] = 0.15;
    });

    lightsGeometry.setAttribute('position', new THREE.BufferAttribute(lightsPositionsArray, 3));
    lightsGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const lightsMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.spotlights = new THREE.Points(lightsGeometry, lightsMaterial);
    this.mesh.add(this.spotlights);
  }

  unmount(parentGroup) {
    console.log('[OilRigCapability] unmount() called');
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    if (!this.initialized) return;

    // Dynamically adjust position/scale for the active section
    this.adjustPositionForSection();

    // 1. Rotate the whole model slowly for dynamic capability presentation
    if (this.mesh) {
      this.mesh.rotation.y = time * 0.15;
    }

    // 2. Pulse the red warning beacon
    if (this.redBeacon) {
      const pulse = 0.65 + Math.sin(time * 3.5) * 0.35;
      this.redBeacon.material.opacity = pulse;
      this.redBeacon.scale.setScalar(0.75 + pulse * 0.25);
    }

    // 3. Flicker spotlights
    if (this.spotlights) {
      this.spotlights.material.size = 1.2 + Math.sin(time * 5.0) * 0.15;
    }
  }

  adjustPositionForSection() {
    const currentSection = StateManager.get('currentSection');
    if (currentSection === 'hero') {
      const camera = window.camera;
      let targetX = 13;
      if (camera) {
        // Dynamically adjust X position based on camera Z zoom to keep it visible on the right side
        targetX = camera.position.z * 0.26;
      }
      this.mesh.position.set(targetX, -5, 0);  // Positioned on the right side in Hero section, slightly lowered
      this.mesh.scale.setScalar(0.72);   // Scaled nicely to fit behind text
    } else {
      this.mesh.position.set(32, 0, 0);  // Positioned for Capabilities Panel 3
      this.mesh.scale.setScalar(0.82);   // Adjusted scale to prevent text overlap
    }
  }

  dispose() {
    this.mesh.traverse(child => {
      SceneLifecycle.disposeObject(child);
    });
    this.mesh.clear();
  }
}

export default new OilRigCapability();
