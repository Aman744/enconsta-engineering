import * as THREE from 'three';
import RenderManager from '../core/RenderManager.js';
import SceneLifecycle from '../core/SceneLifecycle.js';
import WebGLRecovery from '../core/WebGLRecovery.js';
import StateManager from '../core/StateManager.js';
import EventBus from '../core/EventBus.js';

export class SceneManager {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.container = document.body;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;
    this.lights = {};
    
    this.loadedScenes = {};

    this.init();
  }

  init() {
    if (!this.canvas) return;

    // 1. Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !StateManager.get('lowPowerMode'),
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, StateManager.get('lowPowerMode') ? 1 : 2));
    this.renderer.shadowMap.enabled = !StateManager.get('lowPowerMode');
    
    // 2. Initialize Scene and Camera
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(0, 0, 50);

    this.clock = new THREE.Clock();

    // 3. Initialize Lighting
    this.setupLights();

    // 4. Initialize Render Loop and Recovery
    RenderManager.init(this.renderer, this.scene, this.camera, this.clock);
    WebGLRecovery.monitor(this.canvas, () => this.rebuildContext());

    // Start Rendering
    RenderManager.start();

    // Handle Resize
    window.addEventListener('resize', () => this.onResize());

    // Listen for low-power changes to adjust pixel ratios
    EventBus.on('state:lowPowerMode', ({ value }) => {
      this.renderer.setPixelRatio(value ? 1 : Math.min(window.devicePixelRatio, 2));
    });

    // Listen for section entries to trigger lazy-loading of WebGL scenes
    EventBus.on('state:currentSection', ({ value }) => {
      this.handleSectionTransition(value);
    });

    console.log('[SceneManager] WebGL Context Initialized.');
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0x061a40, 1.5);
    this.scene.add(ambientLight);
    this.lights.ambient = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(20, 40, 20);
    this.scene.add(dirLight);
    this.lights.directional = dirLight;

    const pointLight = new THREE.PointLight(0x00b4d8, 3, 100);
    pointLight.position.set(0, 0, 10);
    this.scene.add(pointLight);
    this.lights.point = pointLight;
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  rebuildContext() {
    // Reinitialize Three.js bindings after GPU context loss
    this.scene.clear();
    this.setupLights();
    
    // Clear dynamic scene cache and re-mount active items
    this.loadedScenes = {};
    const activeSection = StateManager.get('currentSection');
    this.handleSectionTransition(activeSection);
  }

  async handleSectionTransition(section) {
    // Lazy-load WebGL scenes only when the viewport approaches their scrolling zones
    try {
      if (section === 'hero' || section === 'universe') {
        await this.loadSceneModule('refinery', () => import('./Refinery.js'));
        await this.loadSceneModule('pipelines', () => import('./Pipelines.js'));
      } else if (section === 'capabilities') {
        await this.loadSceneModule('capabilities_process', () => import('./capabilities/ProcessPlant.js'));
        await this.loadSceneModule('capabilities_pipeline', () => import('./capabilities/PipelineCorridor.js'));
        await this.loadSceneModule('capabilities_electrical', () => import('./capabilities/ElectricalGrid.js'));
        await this.loadSceneModule('capabilities_digital', () => import('./capabilities/DigitalTwin.js'));
      } else if (section === 'ai-engineering') {
        await this.loadSceneModule('ai_command', () => import('./AICommandCenter.js'));
      } else if (section === 'renewables-section') {
        await this.loadSceneModule('windfarm', () => import('./WindFarm.js'));
      } else if (section === 'global-map') {
        await this.loadSceneModule('globe', () => import('./Globe.js'));
      } else if (section === 'energy-transition') {
        await this.loadSceneModule('oilwave', () => import('./OilWave.js'));
      }
    } catch (err) {
      console.error(`[SceneManager] Failed to lazy-load scene for section ${section}:`, err);
    }
  }

  async loadSceneModule(id, importPromise) {
    if (this.loadedScenes[id]) {
      // Re-mount if unmounted previously due to memory management
      SceneLifecycle.mount(id, this.scene);
      RenderManager.registerModule(id);
      return;
    }

    const module = await importPromise();
    const sceneInstance = module.default;
    
    SceneLifecycle.register(id, sceneInstance);
    SceneLifecycle.mount(id, this.scene);
    RenderManager.registerModule(id);

    this.loadedScenes[id] = true;
    console.log(`[SceneManager] Lazy-loaded visual: ${id}`);
  }
}

export default SceneManager;
