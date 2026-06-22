import StateManager from '../core/StateManager.js';
import { PERFORMANCE_BUDGET } from '../config/performanceBudget.js';

class PerformanceService {
  constructor() {
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.fpsHistory = [];
    this.isTracking = false;
  }

  startTracking() {
    if (this.isTracking) return;
    this.isTracking = true;
    this.lastFpsUpdate = performance.now();
    this.trackLoop();
  }

  trackLoop() {
    if (!this.isTracking) return;

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsUpdate;

    if (elapsed >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / elapsed);
      this.recordFps(fps);

      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    requestAnimationFrame(() => this.trackLoop());
  }

  recordFps(fps) {
    StateManager.set('fps', fps);

    // Keep last 10 entries of FPS history
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 10) {
      this.fpsHistory.shift();
    }

    // Trigger low power mode if average FPS is consistently below budget thresholds
    const averageFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    const threshold = StateManager.get('lowPowerMode') 
      ? PERFORMANCE_BUDGET.mobile.criticalFPS 
      : PERFORMANCE_BUDGET.desktop.warnFPS;

    if (this.fpsHistory.length >= 5 && averageFps < threshold) {
      console.warn(`[PerformanceService] Low frame rate observed (${Math.round(averageFps)} FPS). Activating low-power mode optimizations...`);
      StateManager.setLowPower(true);
    }
  }

  stopTracking() {
    this.isTracking = false;
  }
}

export const performanceService = new PerformanceService();
export default performanceService;
