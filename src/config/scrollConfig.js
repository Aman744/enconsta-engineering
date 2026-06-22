export const SCROLL_CONFIG = {
  lenis: {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // OutExpo
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    infinite: false
  },
  scrollTriggers: {
    hero: { start: 'top top', end: 'bottom top', scrub: true },
    universe: { start: 'top bottom', end: 'bottom top', scrub: 1 },
    capabilities: { start: 'top top', end: '+=300%', scrub: 1, pin: true }
  }
};
