class SceneLifecycle {
  constructor() {
    this.activeScenes = new Map();
  }

  register(id, sceneModule) {
    // sceneModule must implement mount(), unmount(), dispose(), update()
    this.activeScenes.set(id, {
      module: sceneModule,
      mounted: false,
      paused: false
    });
  }

  mount(id, parentGroup) {
    const item = this.activeScenes.get(id);
    if (!item || item.mounted) return;

    if (typeof item.module.mount === 'function') {
      item.module.mount(parentGroup);
    }
    item.mounted = true;
    item.paused = false;
    console.log(`[SceneLifecycle] Mounted scene: ${id}`);
  }

  unmount(id, parentGroup) {
    const item = this.activeScenes.get(id);
    if (!item || !item.mounted) return;

    if (typeof item.module.unmount === 'function') {
      item.module.unmount(parentGroup);
    }
    item.mounted = false;
    console.log(`[SceneLifecycle] Unmounted scene: ${id}`);
  }

  pause(id) {
    const item = this.activeScenes.get(id);
    if (!item || item.paused) return;
    if (typeof item.module.pause === 'function') {
      item.module.pause();
    }
    item.paused = true;
  }

  resume(id) {
    const item = this.activeScenes.get(id);
    if (!item || !item.paused) return;
    if (typeof item.module.resume === 'function') {
      item.module.resume();
    }
    item.paused = false;
  }

  update(id, time, delta) {
    const item = this.activeScenes.get(id);
    if (item && item.mounted && !item.paused && typeof item.module.update === 'function') {
      item.module.update(time, delta);
    }
  }

  disposeScene(id) {
    const item = this.activeScenes.get(id);
    if (!item) return;

    if (typeof item.module.dispose === 'function') {
      item.module.dispose();
    }
    this.activeScenes.delete(id);
    console.log(`[SceneLifecycle] Disposed scene: ${id}`);
  }

  // General utility for disposing geometries/materials/textures in Three.js
  static disposeObject(obj) {
    if (!obj) return;

    if (obj.geometry) {
      obj.geometry.dispose();
    }

    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => mat.dispose());
      } else {
        obj.material.dispose();
      }
    }

    if (obj.texture) {
      obj.texture.dispose();
    }
  }
}

export default new SceneLifecycle();
export { SceneLifecycle };
