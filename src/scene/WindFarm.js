import * as THREE from 'three';
import { Colors } from '../assets/Colors.js';
import { Materials } from '../assets/Materials.js';

class WindFarm {
  constructor() {
    this.mesh = new THREE.Group();
    this.rotors = [];
    this.turbines = [];
    this.solarPanels = [];
    this.sunLight = null;
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // 1. Create moving sunlight point light source
    this.sunLight = new THREE.PointLight(0xfff0d0, 5, 80);
    this.sunLight.position.set(-30, 20, 10);
    this.mesh.add(this.sunLight);

    // 2. Create wind turbines
    this.createWindTurbines();

    // 3. Create solar panel grids
    this.createSolarPanels();

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  createWindTurbines() {
    const specs = [
      { x: -15, z: -10, scale: 1.0 },
      { x: 0, z: -15, scale: 1.2 },
      { x: 15, z: -8, scale: 0.9 }
    ];

    const towerMat = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      specular: 0x999999,
      shininess: 40
    });

    const bladeMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xcccccc,
      shininess: 30
    });

    specs.forEach(spec => {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(spec.x, -12, spec.z);
      turbineGroup.scale.multiplyScalar(spec.scale);

      // Tower shaft
      const height = 15;
      const towerGeom = new THREE.CylinderGeometry(0.2, 0.4, height, 8);
      const tower = new THREE.Mesh(towerGeom, towerMat);
      tower.position.y = height / 2;
      turbineGroup.add(tower);

      // Head Group (Nacelle + Rotor)
      const headGroup = new THREE.Group();
      headGroup.position.y = height;
      turbineGroup.add(headGroup);

      // Nacelle (generator box on top)
      const nacelleGeom = new THREE.BoxGeometry(0.8, 0.6, 1.5);
      const nacelle = new THREE.Mesh(nacelleGeom, towerMat);
      nacelle.position.set(0, 0, 0.2);
      headGroup.add(nacelle);

      // Rotor blade assembly
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, 0, 0.95);
      headGroup.add(rotorGroup);

      // Central cap
      const capGeom = new THREE.SphereGeometry(0.4, 8, 8);
      const cap = new THREE.Mesh(capGeom, towerMat);
      rotorGroup.add(cap);

      // 3 Blades (120 degrees apart)
      const bladeLength = 6;
      for (let b = 0; b < 3; b++) {
        const bladeHolder = new THREE.Group();
        bladeHolder.rotation.z = (b * Math.PI * 2) / 3;

        const bladeGeom = new THREE.BoxGeometry(0.25, bladeLength, 0.05);
        const blade = new THREE.Mesh(bladeGeom, bladeMat);
        blade.position.y = bladeLength / 2;
        
        bladeHolder.add(blade);
        rotorGroup.add(bladeHolder);
      }

      this.mesh.add(turbineGroup);
      
      this.turbines.push(turbineGroup);
      this.rotors.push({
        group: rotorGroup,
        head: headGroup,
        yawSpeed: 0.08 + Math.random() * 0.08,
        yawOffset: Math.random() * Math.PI,
        speed: 2.2 + Math.random() * 0.8 // Rotating blade speed
      });
    });
  }

  createSolarPanels() {
    const rows = 3;
    const cols = 4;
    const startX = -8;
    const startZ = 2;

    const panelGeom = new THREE.BoxGeometry(2.5, 1.5, 0.08);
    const panelMat = new THREE.MeshPhongMaterial({
      color: 0x0a1e3f,
      emissive: 0x010515,
      specular: 0x00b4d8,
      shininess: 90
    });

    const standGeom = new THREE.CylinderGeometry(0.08, 0.08, 1, 6);
    const standMat = new THREE.MeshBasicMaterial({ color: 0x333333 });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * 5;
        const z = startZ + r * 4;

        const group = new THREE.Group();
        group.position.set(x, -11.5, z);

        // Panel face tilted back 30 degrees
        const panel = new THREE.Mesh(panelGeom, panelMat);
        panel.rotation.x = -Math.PI / 6;
        panel.position.y = 0.5;
        group.add(panel);

        // Support stand
        const stand = new THREE.Mesh(standGeom, standMat);
        stand.position.y = -0.2;
        group.add(stand);

        this.mesh.add(group);
        this.solarPanels.push(group);
      }
    }
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    if (!this.initialized) return;

    // 1. Rotate wind turbine rotors & yaw heads
    this.rotors.forEach(r => {
      // Blade spin
      r.group.rotation.z += r.speed * delta;

      // Head yaw oscillation (slowly face slightly different wind directions)
      r.head.rotation.y = Math.sin(time * r.yawSpeed + r.yawOffset) * 0.15;
    });

    // 2. Move sunLight to simulate solar sweeps
    if (this.sunLight) {
      this.sunLight.position.x = Math.sin(time * 0.3) * 35;
      this.sunLight.position.z = Math.cos(time * 0.3) * 15 + 5;
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
    this.initialized = false;
    this.rotors = [];
    this.turbines = [];
    this.solarPanels = [];
  }
}

export default new WindFarm();
