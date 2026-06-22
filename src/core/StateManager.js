import EventBus from './EventBus.js';

class StateManager {
  constructor() {
    this.state = {
      bootComplete: false,
      currentSection: 'hero', // e.g. 'hero', 'universe', 'about', etc.
      lowPowerMode: false,
      activeCapability: 'engineering', // 'engineering', 'infrastructure', 'systems', 'digital'
      selectedExecutive: null,
      scrollProgress: 0,
      fps: 60
    };
  }

  set(key, value) {
    if (this.state[key] === value) return;
    const oldValue = this.state[key];
    this.state[key] = value;
    
    EventBus.emit(`state:${key}`, { value, oldValue });
    EventBus.emit('state:change', { key, value, oldValue });
  }

  get(key) {
    return this.state[key];
  }

  setLowPower(enabled) {
    this.set('lowPowerMode', enabled);
  }

  setCurrentSection(section) {
    this.set('currentSection', section);
  }

  setCapability(cap) {
    this.set('activeCapability', cap);
  }
}

export default new StateManager();
