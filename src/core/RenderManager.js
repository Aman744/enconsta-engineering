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
      this.renderer.render(this.scene, this.camera);
    }
  }
}

export default new RenderManager();
