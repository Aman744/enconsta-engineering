class AssetLoader {
  constructor() {
    this.assetsToLoad = [];
    this.loadedCount = 0;
    this.progressCallbacks = [];
    this.completeCallbacks = [];
    this.errorCallbacks = [];
    this.cache = {};
  }

  add(type, id, url) {
    this.assetsToLoad.push({ type, id, url });
  }

  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }

  onComplete(callback) {
    this.completeCallbacks.push(callback);
  }

  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  async loadAll() {
    if (this.assetsToLoad.length === 0) {
      this.triggerComplete();
      return;
    }

    const promises = this.assetsToLoad.map(asset => this.loadAsset(asset));
    await Promise.all(promises);
  }

  async loadAsset(asset) {
    try {
      let data;
      if (asset.type === 'image') {
        data = await this.loadImage(asset.url);
      } else if (asset.type === 'svg') {
        data = await this.loadSVG(asset.url);
      } else if (asset.type === 'font') {
        data = await this.loadFont(asset.id, asset.url);
      }
      this.cache[asset.id] = data;
      this.loadedCount++;
      this.triggerProgress();
    } catch (err) {
      console.error(`Error loading asset ${asset.id}:`, err);
      this.triggerError(asset.id, err);
    }
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  async loadSVG(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load SVG from ${url}`);
    return await res.text();
  }

  async loadFont(name, url) {
    // If the font is defined via standard CSS/Google Fonts, we can wait for document.fonts
    if (url.startsWith('http') || url.endsWith('.woff') || url.endsWith('.woff2') || url.endsWith('.ttf')) {
      const font = new FontFace(name, `url(${url})`);
      const loadedFont = await font.load();
      document.fonts.add(loadedFont);
      return loadedFont;
    } else {
      // Just check font readiness
      await document.fonts.ready;
      return true;
    }
  }

  triggerProgress() {
    const progress = this.loadedCount / this.assetsToLoad.length;
    this.progressCallbacks.forEach(cb => cb(progress));
    if (this.loadedCount === this.assetsToLoad.length) {
      this.triggerComplete();
    }
  }

  triggerComplete() {
    this.completeCallbacks.forEach(cb => cb(this.cache));
  }

  triggerError(id, error) {
    this.errorCallbacks.forEach(cb => cb({ id, error }));
  }

  get(id) {
    return this.cache[id];
  }
}

export default new AssetLoader();
