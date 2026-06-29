import StateManager from './StateManager.js';
import SceneLifecycle from './SceneLifecycle.js';

class RenderManager {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;
    this.animationFrameId = null;
    this.isRendering = false;
    this.lastTime = 0;
    this.activeModules = []; // List of registered scene IDs to update
  }

  init(renderer, scene, camera, clock) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.clock = clock;
    this.lastTime = clock.getElapsedTime();

    this.setupVisibilityListeners();
  }

  setupVisibilityListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  registerModule(id) {
    if (!this.activeModules.includes(id)) {
      this.activeModules.push(id);
    }
  }

  unregisterModule(id) {
    this.activeModules = this.activeModules.filter(m => m !== id);
  }

  start() {
    if (this.isRendering) return;
    this.isRendering = true;
    this.clock.getDelta(); // Reset clock delta
    this.lastTime = this.clock.getElapsedTime();
    this.renderLoop();
    console.log('[RenderManager] Render loop started');
  }

  stop() {
    if (!this.isRendering) return;
    this.isRendering = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('[RenderManager] Render loop stopped');
  }

  renderLoop() {
    if (!this.isRendering) return;

    this.animationFrameId = requestAnimationFrame(() => this.renderLoop());

    const time = this.clock.getElapsedTime();

    // Throttled update for low-power mode (skip frames or cap animations)
    const lowPower = StateManager.get('lowPowerMode');
    if (lowPower) {
      const elapsedSinceLastRender = time - this.lastTime;
      if (elapsedSinceLastRender < 0.033) {
        // Limit to ~30fps in low power mode to save battery
        return;
      }
    }

    this.lastTime = time;
    const delta = this.clock.getDelta();

    // Update active visual elements registered via lifecycle
    this.activeModules.forEach(id => {
      SceneLifecycle.update(id, time, delta);
    });

    if (this.renderer && this.scene && this.camera) {
      const placeholders = document.querySelectorAll('.webgl-placeholder');

      if (placeholders.length > 0) {
        // Scissor rendering for Capabilities page placeholders
        this.renderer.autoClear = false;
        this.renderer.setClearColor(0x030c1e, 0); // Transparent background
        this.renderer.clear();

        placeholders.forEach(el => {
          const rect = el.getBoundingClientRect();
          const width = rect.right - rect.left;
          const height = rect.bottom - rect.top;

          // Skip rendering if offscreen to save GPU cycles
          if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
            return;
          }

          const left = rect.left;
          const bottom = this.renderer.domElement.clientHeight - rect.bottom;

          this.renderer.setViewport(left, bottom, width, height);
          this.renderer.setScissor(left, bottom, width, height);
          this.renderer.setScissorTest(true);

          // Update camera aspect ratio for this scissor box
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();

          // Set camera position right in front of the target model
          const sceneType = el.getAttribute('data-scene');
          let modelX = -90;
          if (sceneType === 'process') modelX = -90;
          else if (sceneType === 'pipeline') modelX = -30;
          else if (sceneType === 'electrical') modelX = 30;
          else if (sceneType === 'digital') modelX = 90;

          this.camera.position.x = modelX;
          this.camera.position.y = 0;
          this.camera.position.z = 25;

          // Render this scissor region
          this.renderer.render(this.scene, this.camera);
        });

        this.renderer.setScissorTest(false);
      } else {
        // Standard fullscreen rendering (homepage, etc.)
        this.renderer.autoClear = true;
        this.renderer.setViewport(0, 0, this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight);
        this.renderer.setScissor(0, 0, this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight);
        this.renderer.setScissorTest(false);
        this.renderer.render(this.scene, this.camera);
      }
    }
  }
}

export default new RenderManager();
