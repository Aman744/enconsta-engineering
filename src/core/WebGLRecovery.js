import EventBus from './EventBus.js';

class WebGLRecovery {
  constructor() {
    this.canvas = null;
    this.rebuildCallback = null;
  }

  monitor(canvas, rebuildCallback) {
    this.canvas = canvas;
    this.rebuildCallback = rebuildCallback;

    this.onContextLost = this.onContextLost.bind(this);
    this.onContextRestored = this.onContextRestored.bind(this);

    canvas.addEventListener('webglcontextlost', this.onContextLost, false);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored, false);
  }

  onContextLost(event) {
    event.preventDefault();
    console.warn('[WebGLRecovery] WebGL context lost. Suspending renderer...');
    EventBus.emit('webgl:contextlost');
  }

  onContextRestored() {
    console.warn('[WebGLRecovery] WebGL context restored. Rebuilding scene elements...');
    if (typeof this.rebuildCallback === 'function') {
      try {
        this.rebuildCallback();
        EventBus.emit('webgl:contextrestored');
      } catch (err) {
        console.error('[WebGLRecovery] Error rebuilding WebGL context:', err);
      }
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
      this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
    }
  }
}

export default new WebGLRecovery();
