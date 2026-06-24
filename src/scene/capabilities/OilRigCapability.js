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

    // Ocean components
    this.ocean = null;
    this.oceanGeometry = null;
    this.oceanInitialPositions = null;
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

    // 3. Create ocean surface
    this.createOceanSurface();

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

    // Vertical drill string (pipe string) inside derrick
    const drillStringGeom = new THREE.CylinderGeometry(0.18, 0.18, 17, 4);
    const drillStringMesh = new THREE.Mesh(drillStringGeom, deckFillMat);
    drillStringMesh.position.y = 8.5; // centered vertically in derrick
    const drillStringWire = new THREE.LineSegments(new THREE.EdgesGeometry(drillStringGeom), blueLineMat);
    drillStringWire.position.y = 8.5;
    derrickGroup.add(drillStringMesh);
    derrickGroup.add(drillStringWire);

    rigGroup.add(derrickGroup);
    this.derrick = derrickGroup;

    // F. Blueprint Cranes (Lattice truss style)
    const cranePositions = [
      { x: -6.5, y: 13.8, z: 5.5, rotY: -Math.PI / 4, length: 8 },
      { x: 6.5, y: 13.8, z: -5.5, rotY: Math.PI * 0.75, length: 7 }
    ];

    this.cranes = [];
    cranePositions.forEach(c => {
      const crane = new THREE.Group();
      crane.position.set(c.x, c.y, c.z);
      crane.rotation.y = c.rotY;

      const baseGeom = new THREE.CylinderGeometry(0.4, 0.5, 2, 6);
      const baseWire = new THREE.LineSegments(new THREE.EdgesGeometry(baseGeom), blueLineMat);
      baseWire.position.y = 1;
      crane.add(baseWire);

      // Truss Boom (box structure with segments)
      const segments = 6;
      const boomGeom = new THREE.BoxGeometry(0.5, 0.5, c.length, 1, 1, segments);
      // Shift pivot so rotation point is at start of boom
      boomGeom.translate(0, 0, c.length / 2);
      const boomWire = new THREE.LineSegments(new THREE.EdgesGeometry(boomGeom), blueLineMat);
      
      // Angle the boom up
      boomWire.rotation.x = -Math.PI / 4; // angle up
      boomWire.position.set(0, 2, 0);
      crane.add(boomWire);

      // Add diagonal bracing inside boom segments for high-fidelity look
      const diagGeom = new THREE.BufferGeometry();
      const diagVertices = [];
      const segLength = c.length / segments;
      for (let i = 0; i < segments; i++) {
        const z0 = i * segLength;
        const z1 = (i + 1) * segLength;
        // X-axis braces
        diagVertices.push(-0.25, -0.25, z0,  0.25, 0.25, z1);
        diagVertices.push( 0.25, -0.25, z0, -0.25, 0.25, z1);
        // Y-axis braces
        diagVertices.push(-0.25,  0.25, z0,  0.25, -0.25, z1);
        diagVertices.push( 0.25,  0.25, z0, -0.25, -0.25, z1);
      }
      diagGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(diagVertices), 3));
      const diagWire = new THREE.LineSegments(diagGeom, blueLineMat);
      diagWire.rotation.x = -Math.PI / 4;
      diagWire.position.set(0, 2, 0);
      crane.add(diagWire);

      // Cable hanging from the end
      const endX = 0;
      const endY = 2 + Math.sin(Math.PI / 4) * c.length;
      const endZ = Math.cos(Math.PI / 4) * c.length;
      
      const cableGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(endX, endY, endZ),
        new THREE.Vector3(endX, endY - 4, endZ)
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

    // H. Helideck (Helipad)
    const helideck = new THREE.Group();
    helideck.position.set(-10, 13.8, 0); // Extended off the left side of the main deck

    const padGeom = new THREE.BoxGeometry(6, 0.3, 6);
    const padMesh = new THREE.Mesh(padGeom, deckFillMat);
    const padEdges = new THREE.EdgesGeometry(padGeom);
    const padWire = new THREE.LineSegments(padEdges, blueLineMat);
    helideck.add(padMesh);
    helideck.add(padWire);

    // Support braces extending from the hull below to the pad
    const braceGeom = new THREE.BufferGeometry();
    const braceVertices = new Float32Array([
      -3, -0.15, -3, 0, -4, 0,
      3, -0.15, -3, 0, -4, 0,
      -3, -0.15, 3, 0, -4, 0,
      3, -0.15, 3, 0, -4, 0
    ]);
    braceGeom.setAttribute('position', new THREE.BufferAttribute(braceVertices, 3));
    const braces = new THREE.LineSegments(braceGeom, blueLineMat);
    helideck.add(braces);

    // The 'H' landing mark
    const hGeom = new THREE.BufferGeometry();
    const hVertices = new Float32Array([
      -1, 0.16, -1.5, -1, 0.16, 1.5,  // Left bar
      1, 0.16, -1.5, 1, 0.16, 1.5,    // Right bar
      -1, 0.16, 0, 1, 0.16, 0         // Crossbar
    ]);
    hGeom.setAttribute('position', new THREE.BufferAttribute(hVertices, 3));
    const hMark = new THREE.LineSegments(hGeom, new THREE.LineBasicMaterial({
      color: 0x10b981, // Green landing mark
      linewidth: 2
    }));
    helideck.add(hMark);
    rigGroup.add(helideck);

    // I. Drill Pipe Racks
    const pipeRack = new THREE.Group();
    pipeRack.position.set(4, 13.8, 3); // Stacked on the right-front deck

    const pipeGeom = new THREE.CylinderGeometry(0.2, 0.2, 6, 6);
    pipeGeom.rotateZ(Math.PI / 2); // Lay horizontal
    const pipeEdges = new THREE.EdgesGeometry(pipeGeom);

    // Stack them in a pyramid (3 at base, 2 middle, 1 top)
    const stackOffsets = [
      { x: 0, y: 0.2, z: -0.6 },
      { x: 0, y: 0.2, z: 0 },
      { x: 0, y: 0.2, z: 0.6 },
      { x: 0, y: 0.55, z: -0.3 },
      { x: 0, y: 0.55, z: 0.3 },
      { x: 0, y: 0.9, z: 0 }
    ];

    stackOffsets.forEach(offset => {
      const pMesh = new THREE.Mesh(pipeGeom, deckFillMat);
      pMesh.position.set(offset.x, offset.y, offset.z);
      const pWire = new THREE.LineSegments(pipeEdges, blueLineMat);
      pWire.position.set(offset.x, offset.y, offset.z);
      pipeRack.add(pMesh);
      pipeRack.add(pWire);
    });

    // Pipe rack supports (frame holding them)
    const frameGeom = new THREE.BoxGeometry(0.2, 1.2, 1.8);
    const frameEdges = new THREE.EdgesGeometry(frameGeom);
    
    // Front and back supports
    [-2.8, 2.8].forEach(x => {
      const fMesh = new THREE.Mesh(frameGeom, deckFillMat);
      fMesh.position.set(x, 0.6, 0);
      const fWire = new THREE.LineSegments(frameEdges, blueLineMat);
      fWire.position.set(x, 0.6, 0);
      pipeRack.add(fMesh);
      pipeRack.add(fWire);
    });
    rigGroup.add(pipeRack);

    // J. Piping / Manifold lines along the platform sides and down pillars
    const manifold = new THREE.Group();

    // Draw some pipelines running along the deck perimeter and down the pillars
    const manifoldGeom = new THREE.BufferGeometry();
    const manifoldVertices = new Float32Array([
      // Line 1: Main intake line down pillar 1 and along deck
      -5, 0, -5,  -5, 12, -5, // Up pillar
      -5, 12, -5, -5, 12.9, -4.5, // Bend to deck
      -5, 12.9, -4.5, -5, 12.9, 5, // Along deck edge
      -5, 12.9, 5, -2, 13.8, 5, // Up to cabins/derrick

      // Line 2: Output discharge line
      5, 12.9, -5, 5, 12.9, 5, // Along right deck edge
      5, 12.9, 5, 6, 13.8, 6,  // Connecting to flare stack
      
      // Line 3: Cross deck manifold
      -5, 12.9, 2, 5, 12.9, 2
    ]);
    manifoldGeom.setAttribute('position', new THREE.BufferAttribute(manifoldVertices, 3));
    
    const pipingLineMat = new THREE.LineBasicMaterial({
      color: 0x00b4d8,
      transparent: true,
      opacity: 0.95
    });
    
    const pipes = new THREE.LineSegments(manifoldGeom, pipingLineMat);
    manifold.add(pipes);

    // Valve wheel on the deck manifold
    const valveGroup = new THREE.Group();
    valveGroup.position.set(0, 12.9, 2);
    const vWheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 8);
    const vWheel = new THREE.LineSegments(new THREE.EdgesGeometry(vWheelGeom), blueLineMat);
    vWheel.rotation.x = Math.PI / 2;
    valveGroup.add(vWheel);
    
    const vStemGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.4, 0)
    ]);
    const vStem = new THREE.Line(vStemGeom, blueLineMat);
    valveGroup.add(vStem);
    manifold.add(valveGroup);
    rigGroup.add(manifold);

    // K. Satellite Dome & Antenna Tower on cabin roof
    const telecom = new THREE.Group();
    telecom.position.set(-4, 16.8, -3); // Placed on top of the cabins

    // Spherical radome dome
    const domeGeom = new THREE.SphereGeometry(1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeom, deckFillMat);
    const domeEdges = new THREE.EdgesGeometry(domeGeom);
    const domeWire = new THREE.LineSegments(domeEdges, blueLineMat);
    telecom.add(domeMesh);
    telecom.add(domeWire);

    // Small lattice tower for communications
    const antennaTowerGeom = new THREE.CylinderGeometry(0.1, 0.4, 4, 3, 2, true);
    const antennaTower = new THREE.LineSegments(new THREE.EdgesGeometry(antennaTowerGeom), blueLineMat);
    antennaTower.position.set(2, 2, 1);
    telecom.add(antennaTower);

    // Whip antenna line
    const whipAntennaGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(2, 4, 1),
      new THREE.Vector3(2, 6.5, 1)
    ]);
    const whip = new THREE.Line(whipAntennaGeom, blueLineMat);
    telecom.add(whip);
    rigGroup.add(telecom);

    // L. Lifeboat Capsules
    const lifeboats = new THREE.Group();

    // Two lifeboats, one on left, one on right side of cabins
    const boatGeom = new THREE.BoxGeometry(1.2, 0.8, 2.5);
    const boatEdges = new THREE.EdgesGeometry(boatGeom);

    const davitGeom = new THREE.BufferGeometry();
    const davitVertices = new Float32Array([
      0, 0, -1.2, -0.6, 0.8, -1.2,
      -0.6, 0.8, -1.2, -0.6, 0.4, -1.2,
      0, 0, 1.2, -0.6, 0.8, 1.2,
      -0.6, 0.8, 1.2, -0.6, 0.4, 1.2
    ]);
    davitGeom.setAttribute('position', new THREE.BufferAttribute(davitVertices, 3));

    const boatPositions = [
      { x: -7.6, y: 12.5, z: -3, rotY: 0 },
      { x: 7.6, y: 12.5, z: -3, rotY: Math.PI }
    ];

    boatPositions.forEach(pos => {
      const bGroup = new THREE.Group();
      bGroup.position.set(pos.x, pos.y, pos.z);
      bGroup.rotation.y = pos.rotY;

      // Capsule mesh & outline
      const bMesh = new THREE.Mesh(boatGeom, deckFillMat);
      bMesh.position.set(-0.6, -0.4, 0);
      const bWire = new THREE.LineSegments(boatEdges, blueLineMat);
      bWire.position.set(-0.6, -0.4, 0);
      bGroup.add(bMesh);
      bGroup.add(bWire);

      // Support davits
      const davits = new THREE.LineSegments(davitGeom, blueLineMat);
      bGroup.add(davits);

      lifeboats.add(bGroup);
    });
    rigGroup.add(lifeboats);

    // M. Exhaust Stack Chimneys (Group of 4 tall pipes)
    const chimneys = new THREE.Group();
    chimneys.position.set(-3, 13.8, -4); // Deck placement

    const chimneyGeom = new THREE.CylinderGeometry(0.25, 0.25, 8, 6, 2, true);
    const chimneyEdges = new THREE.EdgesGeometry(chimneyGeom);
    
    for (let i = 0; i < 4; i++) {
      const offsetZ = i * 0.9;
      const heightOffset = i * 0.5; // Staggered heights

      const cMesh = new THREE.Mesh(chimneyGeom, deckFillMat);
      cMesh.position.set(0, 4 + heightOffset/2, offsetZ);
      cMesh.scale.y = 1 + heightOffset/8;

      const cWire = new THREE.LineSegments(chimneyEdges, blueLineMat);
      cWire.position.set(0, 4 + heightOffset/2, offsetZ);
      cWire.scale.y = 1 + heightOffset/8;

      chimneys.add(cMesh);
      chimneys.add(cWire);
    }
    rigGroup.add(chimneys);

    // N. Guardrails / Handrails around the deck perimeter
    const rails = new THREE.Group();
    rails.position.set(0, 13.8, 0); // relative to deck level

    const railPoints = [
      { x: -7.5, z: -7.5 },
      { x: 7.5, z: -7.5 },
      { x: 7.5, z: 7.5 },
      { x: -7.5, z: 7.5 },
      { x: -7.5, z: -7.5 } // close loop
    ];

    const railMat = new THREE.LineBasicMaterial({
      color: 0x00b4d8,
      transparent: true,
      opacity: 0.6
    });

    const stanchionGeom = new THREE.BufferGeometry();
    const stanchionVertices = [];
    const topRailPoints = [];
    const midRailPoints = [];

    for (let i = 0; i < railPoints.length - 1; i++) {
      const p1 = railPoints[i];
      const p2 = railPoints[i + 1];
      
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const len = Math.sqrt(dx*dx + dz*dz);
      const divisions = Math.ceil(len / 2.5);
      
      for (let j = 0; j <= divisions; j++) {
        const t = j / divisions;
        const x = p1.x + dx * t;
        const z = p1.z + dz * t;
        
        if (x < -6.5 && z > -3 && z < 3) continue; // Skip helideck attachment point area

        stanchionVertices.push(x, 0, z,  x, 0.9, z);
        
        if (j < divisions) {
          const nextT = (j + 1) / divisions;
          const nextX = p1.x + dx * nextT;
          const nextZ = p1.z + dz * nextT;
          
          topRailPoints.push(new THREE.Vector3(x, 0.9, z));
          topRailPoints.push(new THREE.Vector3(nextX, 0.9, nextZ));
          
          midRailPoints.push(new THREE.Vector3(x, 0.45, z));
          midRailPoints.push(new THREE.Vector3(nextX, 0.45, nextZ));
        }
      }
    }

    stanchionGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(stanchionVertices), 3));
    const stanchions = new THREE.LineSegments(stanchionGeom, railMat);
    rails.add(stanchions);

    const topRailGeom = new THREE.BufferGeometry().setFromPoints(topRailPoints);
    const topRail = new THREE.LineSegments(topRailGeom, railMat);
    rails.add(topRail);

    const midRailGeom = new THREE.BufferGeometry().setFromPoints(midRailPoints);
    const midRail = new THREE.LineSegments(midRailGeom, railMat);
    rails.add(midRail);
    rigGroup.add(rails);

    this.mesh.add(rigGroup);
  }

  createOceanSurface() {
    const size = 120;
    const segments = 24;
    const oceanGeom = new THREE.PlaneGeometry(size, size, segments, segments);
    oceanGeom.rotateX(-Math.PI / 2);

    const oceanMat = new THREE.LineBasicMaterial({
      color: 0x0077b6,
      transparent: true,
      opacity: 0.25
    });

    this.ocean = new THREE.LineSegments(oceanGeom, oceanMat);
    this.ocean.position.y = -10;
    
    this.oceanGeometry = oceanGeom;
    this.oceanInitialPositions = oceanGeom.attributes.position.clone();
    
    this.mesh.add(this.ocean);
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

    // 2. Spotlights (Dense placement of warm lights matching reference image)
    const lightPositions = [
      // Deck corners and perimeters
      [-7, 3.8, -7], [7, 3.8, -7], [-7, 3.8, 7], [7, 3.8, 7],
      [-7, 3.8, 0], [7, 3.8, 0], [0, 3.8, -7], [0, 3.8, 7],
      [-7, 3.8, -3.5], [-7, 3.8, 3.5], [7, 3.8, -3.5], [7, 3.8, 3.5],
      [-3.5, 3.8, -7], [3.5, 3.8, -7], [-3.5, 3.8, 7], [3.5, 3.8, 7],
      
      // Helipad perimeter
      [-10, 3.8, -3], [-10, 3.8, 3], [-13, 3.8, 0], [-7, 3.8, 0],
      [-12, 3.8, -2], [-12, 3.8, 2], [-8, 3.8, -2], [-8, 3.8, 2],

      // Cabins and sub-decks
      [-2, 6.8, -2], [1, 6.8, -3], [-5, 6.8, -3], [-3, 6.8, -1],
      [-0.8, 6.8, 2.8], [0.8, 6.8, 1.2],

      // Derrick interior vertical lighting (tapering upward)
      [-0.5, 12.8, 2.5], [0.5, 12.8, 1.5], [0, 5.8, 2], [0, 8.8, 2],
      [0, 11.8, 2], [0, 14.8, 2], [0, 18.3, 2],

      // Under-deck structural supports
      [-5, 1.8, -5], [5, 1.8, -5], [-5, 1.8, 5], [5, 1.8, 5]
    ];

    const lightsGeometry = new THREE.BufferGeometry();
    const lightsPositionsArray = new Float32Array(lightPositions.length * 3);
    const colorsArray = new Float32Array(lightPositions.length * 3);

    lightPositions.forEach((pos, idx) => {
      lightsPositionsArray[idx * 3] = pos[0];
      lightsPositionsArray[idx * 3 + 1] = pos[1];
      lightsPositionsArray[idx * 3 + 2] = pos[2];

      colorsArray[idx * 3] = 1.0;
      colorsArray[idx * 3 + 1] = 0.75;
      colorsArray[idx * 3 + 2] = 0.2; // slightly warmer yellow-orange
    });

    lightsGeometry.setAttribute('position', new THREE.BufferAttribute(lightsPositionsArray, 3));
    lightsGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const lightsMaterial = new THREE.PointsMaterial({
      size: 1.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
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

    // Counter-rotate ocean to keep it static while rig rotates
    if (this.ocean && this.mesh) {
      this.ocean.rotation.y = -this.mesh.rotation.y;
    }

    // 2. Pulse the red warning beacon
    if (this.redBeacon) {
      const pulse = 0.65 + Math.sin(time * 3.5) * 0.35;
      this.redBeacon.material.opacity = pulse;
      this.redBeacon.scale.setScalar(0.75 + pulse * 0.25);
    }

    // 3. Flicker spotlights
    if (this.spotlights) {
      this.spotlights.material.size = 1.3 + Math.sin(time * 5.0) * 0.15;
    }

    // 4. Update ocean waves
    if (this.ocean && this.oceanGeometry) {
      const positionAttr = this.oceanGeometry.attributes.position;
      const initial = this.oceanInitialPositions;
      const timeScale = time * 1.5;
      
      for (let i = 0; i < positionAttr.count; i++) {
        const x = initial.getX(i);
        const z = initial.getZ(i);
        
        // Complex wave formula using multiple sine/cosine frequencies
        const wave1 = Math.sin(x * 0.08 + timeScale) * Math.cos(z * 0.08 + timeScale * 0.8) * 0.8;
        const wave2 = Math.sin(x * 0.15 - timeScale * 1.2) * 0.4;
        const y = wave1 + wave2;
        
        positionAttr.setY(i, y);
      }
      positionAttr.needsUpdate = true;
    }
  }

  adjustPositionForSection() {
    const currentSection = StateManager.get('currentSection');
    if (currentSection === 'hero' || currentSection === 'universe') {
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
    if (this.ocean) {
      SceneLifecycle.disposeObject(this.ocean);
      this.ocean = null;
      this.oceanGeometry = null;
      this.oceanInitialPositions = null;
    }
  }
}

export default new OilRigCapability();
