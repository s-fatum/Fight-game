import * as PIXI from 'pixi.js';

export class GameEngine {
    private app: PIXI.Application;
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.app = new PIXI.Application();
    }

    async init() {
        await this.app.init({
            resizeTo: this.container,
            backgroundColor: 0x000000
        });
        this.container.appendChild(this.app.canvas);
    }

    // Метод, который будет вызывать Vue после получения данных от BattleService
    async playBattle(scenario: any) {
        // Тут логика отрисовки на основе пришедшего JSON
    }

    destroy() {
        this.app.destroy(true, { children: true, texture: true });
    }
}