export const PERFORMANCE_BUDGET = {
  desktop: {
    maxVertices: 100000,
    maxDrawCalls: 60,
    warnFPS: 45,
    criticalFPS: 30
  },
  mobile: {
    maxVertices: 25000,
    maxDrawCalls: 20,
    warnFPS: 35,
    criticalFPS: 20
  },
  general: {
    heapLimitMB: 150,
    contextLossThreshold: 3 // Max retries before stopping WebGL completely
  }
};
export default PERFORMANCE_BUDGET;
