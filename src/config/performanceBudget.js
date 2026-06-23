export const PERFORMANCE_BUDGET = {
  desktop: {
    maxVertices: 100000,
    maxDrawCalls: 60,
    warnFPS: 45,
    criticalFPS: 30,
    particles: {
      hero: 2000,
      pipelines: 3000,
      wave: 5000
    }
  },
  mobile: {
    maxVertices: 25000,
    maxDrawCalls: 20,
    warnFPS: 35,
    criticalFPS: 20,
    particles: 1000 // Generic mobile particle limit
  },
  general: {
    heapLimitMB: 150,
    contextLossThreshold: 3 // Max retries before stopping WebGL completely
  }
};
export default PERFORMANCE_BUDGET;
