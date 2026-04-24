import { Application } from 'pixi.js';
import { markRaw } from 'vue';

class PixiManager {
    public app: Application | null = null;
    private initialized = false;

    // Единая точка управления дебагом
    private isDebug = import.meta.env.DEV;

    async init() {
        if (this.initialized && this.app) return this.app;

        const app = new Application();
        await app.init({
            preference: 'canvas', //- если красота не нужна
            resizeTo: window,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundAlpha: 0,
            antialias: true,
            hello: this.isDebug,
        });

        app.ticker.minFPS = 30;
        app.ticker.maxFPS = 60;

        app.canvas.style.width = '100vw';
        app.canvas.style.height = '100vh';
        app.canvas.style.position = 'fixed';
        app.canvas.style.top = '0';
        app.canvas.style.left = '0'

        this.app = markRaw(app);
        this.initialized = true;

        // Подключение дебаг-панели
        if (this.isDebug) {
            (globalThis as any).__PIXI_APP__ = this.app;
            console.log('🚀 PixiManager: Debug mode active');
        }

        return this.app;
    }

    forceResize() {
        if (this.app) {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        }
    }

    purge() {
        if (this.app) {
            this.app.stage.removeChildren();
            this.app.ticker.stop();
        }
    }

    resume() {
        if (this.app) this.app.ticker.start();
    }
}

export const pixiManager = new PixiManager();