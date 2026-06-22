export class Counters {
  constructor() {
    this.counterCards = document.querySelectorAll('.counter-card');
    this.observer = null;
    this.init();
  }

  init() {
    if (this.counterCards.length === 0) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const numberEl = card.querySelector('.counter-number');
          if (numberEl && !card.classList.contains('counted')) {
            card.classList.add('counted');
            this.animateCounter(numberEl);
          }
        }
      });
    }, { threshold: 0.2 });

    this.counterCards.forEach(card => this.observer.observe(card));
  }

  animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1500; // ms
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing outQuad
      const easedProgress = progress * (2 - progress);
      const current = Math.floor(easedProgress * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(update);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export default Counters;
