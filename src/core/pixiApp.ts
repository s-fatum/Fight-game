import { Application } from 'pixi.js';
import { markRaw } from 'vue';

class PixiManager {
    public app: Application | null = null;
    private initialized = false;

    async init() {
        if (this.initialized && this.app) return this.app;

        const app = new Application();
        await app.init({
            resizeTo: window,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundAlpha: 0,
            antialias: true,
        });

        // Ключевой момент: защищаем объект от Vue Proxy
        this.app = markRaw(app);
        this.initialized = true;

        return this.app;
    }

    // Метод для "вправления" размеров, если Pixi промахнулся при старте
    forceResize() {
        if (this.app) {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        }
    }

    // Очистка только контента, без уничтожения самого инстанса
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