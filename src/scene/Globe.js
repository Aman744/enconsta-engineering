import * as THREE from 'three';
import { Colors } from '../assets/Colors.js';
import { Materials } from '../assets/Materials.js';
import { offices } from '../content/offices.js';

class Globe {
  constructor() {
    this.mesh = new THREE.Group();
    this.radius = 16;
    this.dots = null;
    this.arcs = [];
    this.officePoints = [];
    this.initialized = false;
  }

  mount(parentGroup) {
    if (this.initialized) {
      parentGroup.add(this.mesh);
      return;
    }

    // 1. Create dotted globe sphere
    this.createDottedSphere();

    // 2. Plot office coordinates
    this.plotOffices();

    // 3. Connect offices with arcs
    this.createConnectionArcs();

    parentGroup.add(this.mesh);
    this.initialized = true;
  }

  latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    return new THREE.Vector3(x, y, z);
  }

  createDottedSphere() {
    const density = 600; // Number of points
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(density * 3);

    for (let i = 0; i < density; i++) {
      // Golden spiral distribution on sphere for uniform look
      const k = i + 0.5;
      const phi = Math.acos(1 - (2 * k) / density);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;

      const x = this.radius * Math.sin(phi) * Math.cos(theta);
      const y = this.radius * Math.sin(phi) * Math.sin(theta);
      const z = this.radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Dotted globe material
    const mat = new THREE.PointsMaterial({
      color: Colors.three.secondary,
      size: 1.2,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true
    });

    this.dots = new THREE.Points(geometry, mat);
    this.mesh.add(this.dots);
  }

  plotOffices() {
    const pinGeom = new THREE.SphereGeometry(0.4, 8, 8);
    const pinMat = new THREE.MeshBasicMaterial({
      color: Colors.three.accent,
      transparent: true,
      opacity: 0.9
    });

    offices.forEach(office => {
      const pos = this.latLngToVector3(office.coords.lat, office.coords.lng, this.radius);
      
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(pos);
      this.mesh.add(pin);
      this.officePoints.push({ id: office.id, pos });
    });
  }

  createConnectionArcs() {
    const dubai = this.officePoints.find(o => o.id === 'dubai');
    const indiaCenters = this.officePoints.filter(o => o.id !== 'dubai');

    if (!dubai) return;

    indiaCenters.forEach(target => {
      const start = dubai.pos;
      const end = target.pos;

      // Generate curved bezier line arched outwards from globe
      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      midPoint.normalize().multiplyScalar(this.radius + distance * 0.25); // Arch height relative to distance

      const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
      const points = curve.getPoints(30);
      const geom = new THREE.BufferGeometry().setFromPoints(points);

      const line = new THREE.Line(geom, Materials.blueprintLine);
      this.mesh.add(line);

      // Create glowing connection particle travelling along path
      const pGeom = new THREE.BufferGeometry();
      const pPos = new Float32Array(3);
      pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

      const particle = new THREE.Points(pGeom, Materials.energyParticle);
      this.mesh.add(particle);

      this.arcs.push({
        curve,
        particle,
        progress: Math.random(), // Randomize starting progress
        speed: 0.4 + Math.random() * 0.2
      });
    });
  }

  unmount(parentGroup) {
    parentGroup.remove(this.mesh);
  }

  update(time, delta) {
    if (!this.initialized) return;

    // Rotate globe slowly
    this.mesh.rotation.y = time * 0.08;
    this.mesh.rotation.x = 0.2; // Tilted angle for beauty

    // Animate arc tracer particles
    this.arcs.forEach(arc => {
      arc.progress += arc.speed * delta;
      if (arc.progress > 1) arc.progress = 0;

      const pos = arc.curve.getPointAt(arc.progress);
      const pArray = arc.particle.geometry.attributes.position.array;
      pArray[0] = pos.x;
      pArray[1] = pos.y;
      pArray[2] = pos.z;
      arc.particle.geometry.attributes.position.needsUpdate = true;
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

export default new Globe();
