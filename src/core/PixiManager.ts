import { Application, Container } from 'pixi.js';
import type { ApplicationOptions } from 'pixi.js';
import { markRaw } from 'vue';
import { NeonLogo } from './NeonLogo';
import gsap from 'gsap';
import { delay } from '@/utils/time';
import { useGameStore } from '@/store/GameStore';
import { DiceCore } from './DiceCore';
import type { DiceValue } from '@/types';

export class PixiManager {
    public app: Application | null = null;
    public gameLayer: Container | null = null;
    public uiLayer: Container | null = null;

    private onIntroFinished: (() => void) | null = null;
    private currentContainer: HTMLElement | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private miniLogo: NeonLogo | null = null;
    private isDebug = import.meta.env.DEV;

    constructor() {}

    async init(container: HTMLElement, options: Partial<ApplicationOptions> = {}) {
        if (this.app) return this.app;
        this.currentContainer = container;

        const app = new Application();
        const defaultOptions: Partial<ApplicationOptions> = {
            resizeTo: container,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundAlpha: 0,
            antialias: true,
            hello: this.isDebug,
            width: container.clientWidth,
            height: container.clientHeight,
            preference: 'webgl',
        };
        const finalOptions = { ...defaultOptions, ...options };
        try {
            await app.init(finalOptions);
        } catch (error) {
            console.error('WebGL failed, trying canvas...', error);
            await app.init({ ...finalOptions, preference: 'canvas' });
        }

        container.innerHTML = '';
        container.appendChild(app.canvas);
        app.canvas.style.width = '100%';
        app.canvas.style.height = '100%';
        app.canvas.style.display = 'block';
        app.canvas.style.position = 'relative';
        app.canvas.style.pointerEvents = 'none';

        this.app = markRaw(app);
        this.initLayers();

        if (this.isDebug) {
            (globalThis as any).__PIXI_APP__ = this.app;
            console.log('PixiManager initialized');
        }

        if (this.resizeObserver) this.resizeObserver.disconnect();
        this.resizeObserver = new ResizeObserver(() => {
            if (this.app && this.currentContainer) {
                const { clientWidth, clientHeight } = this.currentContainer;
                if (clientWidth && clientHeight) {
                    this.app.renderer.resize(clientWidth, clientHeight);
                    if (this.miniLogo) this.miniLogo.container.x = clientWidth / 2;
                }
            }
        });
        this.resizeObserver.observe(container);

        return this.app;
    }

    private initLayers() {
        if (!this.app) return;
        this.gameLayer = new Container();
        this.uiLayer = new Container();
        this.app.stage.addChild(this.gameLayer);
        this.app.stage.addChild(this.uiLayer);
    }

    public resetGameLayer() {
        if (this.gameLayer) {
            gsap.killTweensOf(this.gameLayer.children);
            this.gameLayer.removeChildren();
        }
    }

    public fullDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.miniLogo) {
            this.miniLogo.destroy();
            this.miniLogo = null;
        }
        if (this.app) {
            gsap.killTweensOf(this.app.stage.children);
            this.app.destroy(true, { children: true });
            this.app = null;
        }
        this.gameLayer = null;
        this.uiLayer = null;
        this.currentContainer = null;
    }

    public async startIntro() {
        if (!this.app) return;
        this.resetGameLayer();
        this.app.renderer.resize(this.currentContainer!.clientWidth, this.currentContainer!.clientHeight);
        await document.fonts.load('1em Oswald');
        await document.fonts.ready;

        const logo = new NeonLogo(this.app);
        this.uiLayer?.addChild(logo.container);
        this.miniLogo = logo;

        const ticker = () => logo.update();
        this.app.ticker.add(ticker);

        await delay(2500);
        logo.flyToTop();
        if (this.onIntroFinished) this.onIntroFinished();

        await delay(1200);
        useGameStore().setScreen('main');
    }

    public setCallback(fn: () => void) {
        this.onIntroFinished = fn;
    }

    public async showDiceScene(diceSet: DiceValue[], onCollect: (type: DiceValue, count: number) => void) {
        if (!this.app || !this.gameLayer) return;
        this.gameLayer.removeChildren();

        const diceCore = new DiceCore(this.app, this.gameLayer);
        await diceCore.loadAssets();
        diceCore.spawnDiceGrid(diceSet);
        setTimeout(() => diceCore.collectDices(onCollect), 2000);
        return diceCore;
    }
}