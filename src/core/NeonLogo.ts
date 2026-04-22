import * as PIXI from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import { gsap } from 'gsap';

export class NeonLogo {
    public container: PIXI.Container;

    private borderGraphics!: PIXI.Graphics;
    private textContainer!: PIXI.Container;

    // Ссылки на фильтры для анимации
    private textGlow!: GlowFilter;
    private borderGlowFar!: GlowFilter;

    constructor(app: PIXI.Application) {
        this.container = new PIXI.Container();
        this.setupElements();

        this.container.x = app.screen.width / 2;
        this.container.y = app.screen.height / 2;

        app.stage.addChild(this.container);
    }

    private setupElements() {
        const mainNeonColor = 0x1e88e5;
        const textColor = 0xea9937;

        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Oswald, sans-serif',
            fontSize: 80,
            fill: 'transparent',
            stroke: { color: '#ffffff', width: 1, alpha: 1 },
            fontWeight: 'bold',
            letterSpacing: 1,
        });

        this.textContainer = new PIXI.Container();
        const textTop = new PIXI.Text({ text: 'БИТВА', style: textStyle });
        const textBottom = new PIXI.Text({ text: 'ПОЛИГРАФИИ', style: textStyle });

        textTop.anchor.set(0.5);
        textTop.y = -35;
        textBottom.anchor.set(0.5);
        textBottom.y = 35;
        this.textContainer.addChild(textTop, textBottom);

        this.textGlow = new GlowFilter({
            distance: 15,
            outerStrength: 2.5,
            innerStrength: 1,
            color: textColor,
            quality: 0.5,
        });
        this.textContainer.filters = [this.textGlow];

        this.borderGraphics = new PIXI.Graphics();
        const innerPadding = 30;
        const curveRadius = 20;

        const totalWidth = this.textContainer.width + innerPadding * 2;
        const totalHeight = this.textContainer.height + innerPadding * 2;
        const halfW = totalWidth / 2;
        const halfH = totalHeight / 2;

        this.borderGraphics.context
            .roundRect(-halfW, -halfH, totalWidth, totalHeight, curveRadius);
        this.borderGraphics.stroke({ width: 3, color: 0xffffff });

        const borderGlowInner = new GlowFilter({
            distance: 10, outerStrength: 2, innerStrength: 3, color: 0xffffff, quality: 0.5, alpha: 0.5,
        });
        const borderGlowMain = new GlowFilter({
            distance: 30, outerStrength: 5, innerStrength: 0, color: mainNeonColor, quality: 0.5
        });
        this.borderGlowFar = new GlowFilter({
            distance: 60, outerStrength: 1.5, innerStrength: 0, color: mainNeonColor, quality: 0.3
        });

        this.borderGraphics.filters = [borderGlowInner, borderGlowMain, this.borderGlowFar];

        this.container.addChild(this.borderGraphics, this.textContainer);

        // Мягкое появление из темноты
        gsap.to(this.container, { alpha: 1, duration: 0.8 });
    }

    public update() {
        const basePulse = Math.sin(Date.now() * 0.003);
        this.borderGlowFar.outerStrength = 1.5 + basePulse * 0.1;

        if (Math.random() > 0.99) {
            const drop = Math.random();
            this.borderGraphics.alpha = 1 - (drop * 0.1);
            this.textGlow.outerStrength = (1 - drop);
        } else {
            this.borderGraphics.alpha += (1 - this.borderGraphics.alpha) * 0.2;
            const targetGlow = 2.5;
            this.textGlow.outerStrength += (targetGlow - this.textGlow.outerStrength) * 0.1;
        }
    }

    public flyToTop() {
        gsap.to(this.container, {
            y: 160,
            scale: 0.6,
            duration: 1.2,
            ease: "expo.out",
            force3D: true
        });
    }
}