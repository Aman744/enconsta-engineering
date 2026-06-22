export const Careers = {
  initialized: false,
  init() {
    this.initialized = true;
    console.log('[Future Module] Careers initialized. Ready for sifting CV uploads.');
  },
  routes: {
    list: '/careers',
    submit: '/careers/apply'
  }
};
export default Careers;
