import { Application } from 'pixi.js';
import type { ApplicationOptions } from 'pixi.js';
import { markRaw } from 'vue';

interface ExtraOptions {
    useFixedOverlay?: boolean;
}

type PixiInitOptions = Partial<ApplicationOptions> & ExtraOptions;

class PixiManager {
    public app: Application | null = null;
    private initialized = false;
    private isDebug = import.meta.env.DEV;

    async init(options: PixiInitOptions = {}) {
        if (this.initialized && this.app) return this.app;

        const app = new Application();

        const defaultOptions: PixiInitOptions = {
            resizeTo: window,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundAlpha: 0,
            antialias: true,
            hello: this.isDebug,
            useFixedOverlay: true
        };

        const finalOptions = { ...defaultOptions, ...options };

        await app.init(finalOptions);

        app.ticker.minFPS = 30;
        app.ticker.maxFPS = 60;

        // Если не fixed оверлей, сбрасываем стили, чтобы канвас не улетал
        if (!finalOptions.useFixedOverlay) {
            app.canvas.style.position = 'relative';
            app.canvas.style.width = '100%';
            app.canvas.style.height = '100%';
            app.canvas.style.top = 'auto';
            app.canvas.style.left = 'auto';
        } else {
            app.canvas.style.width = '100vw';
            app.canvas.style.height = '100vh';
            app.canvas.style.position = 'fixed';
            app.canvas.style.top = '0';
            app.canvas.style.left = '0';
        }

        this.app = markRaw(app);
        this.initialized = true;

        if (this.isDebug) {
            (globalThis as any).__PIXI_APP__ = this.app;
            console.log('🚀 PixiManager: Debug mode active');
        }

        return this.app;
    }

    forceResize(width?: number, height?: number) {
        if (!this.app) return;

        if (width && height) {
            this.app.renderer.resize(width, height);
        } else if (this.app.resizeTo && this.app.resizeTo instanceof HTMLElement) {
            // Если привязан к элементу, берем его актуальные размеры
            this.app.renderer.resize(this.app.resizeTo.clientWidth, this.app.resizeTo.clientHeight);
        } else {
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

    reset() {
        if (this.app) {
            this.app.stage.removeChildren(); // Чистим экран
            this.app.ticker.stop();         // Стопаем логику
            // Удаляем все кастомные функции из тикера
            this.app.ticker.addOnce(() => {
                this.app?.ticker.start();   // Сразу запускаем чистым
            });
        }
    }
}

export const pixiManager = new PixiManager();