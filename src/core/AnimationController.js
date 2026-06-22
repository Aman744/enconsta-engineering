import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class AnimationController {
  constructor() {
    this.timelines = {};
    this.triggers = [];
  }

  createTimeline(name, vars = {}) {
    if (this.timelines[name]) {
      this.timelines[name].kill();
    }
    const tl = gsap.timeline(vars);
    this.timelines[name] = tl;
    return tl;
  }

  getTimeline(name) {
    return this.timelines[name];
  }

  registerTrigger(triggerConfig) {
    const trigger = ScrollTrigger.create(triggerConfig);
    this.triggers.push(trigger);
    return trigger;
  }

  refresh() {
    ScrollTrigger.refresh();
  }

  clearAll() {
    this.triggers.forEach(t => t.kill());
    this.triggers = [];
    Object.values(this.timelines).forEach(tl => tl.kill());
    this.timelines = {};
  }
}

export default new AnimationController();
export { gsap, ScrollTrigger };
