import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { toRaw } from 'vue';
import type { DiceValue } from '@/types';
import imgHeart from '@/assets/dice/dice_heart.png';
import imgFist from '@/assets/dice/dice_fist.png';
import imgCrit from '@/assets/dice/dice_crit.png';
import imgBackground from '@/assets/dice/dice_bg.jpg';

interface DiceSprite extends PIXI.Sprite {
    diceType: string;
    shadow: PIXI.Graphics;
}

export class DiceCore {
    private gameLayer: PIXI.Container;
    private readonly areaWidth: number;
    private readonly areaHeight: number;
    private diceSprites: DiceSprite[] = [];
    private textures: Record<string, PIXI.Texture> = {};
    private backgroundSprite: PIXI.Sprite | null = null;

    constructor(gameLayer: PIXI.Container, areaWidth: number, areaHeight: number) {
        this.gameLayer = gameLayer;
        this.areaWidth = areaWidth;
        this.areaHeight = areaHeight;
    }

    async loadAssets() {
        this.textures = await PIXI.Assets.load([
            { alias: 'heart', src: imgHeart },
            { alias: 'fist', src: imgFist },
            { alias: 'crit', src: imgCrit },
            { alias: 'floorBg', src: imgBackground }
        ]);
    }

    spawnDiceGrid(values: DiceValue[]) {
        const width = this.areaWidth;
        const height = this.areaHeight;

        this.gameLayer.removeChildren();

        // Фон
        if (this.textures['floorBg']) {
            if (this.backgroundSprite) this.backgroundSprite.destroy();
            this.backgroundSprite = new PIXI.Sprite(this.textures['floorBg']);
            const bg = this.backgroundSprite;
            bg.anchor.set(0.5);
            bg.x = width / 2;
            bg.y = height / 2;
            const scale = Math.max(width / bg.width, height / bg.height);
            bg.scale.set(scale);
            bg.zIndex = 0;
            this.gameLayer.addChild(bg);
        }

        const columns = 3;
        const total = values.length;
        let createdCount = 0;

        values.forEach((type, index) => {
            const texture = this.textures[type];
            if (!texture) return;
            const dice = new PIXI.Sprite(texture) as DiceSprite;
            dice.anchor.set(0.5);
            dice.scale.set(0.4);
            dice.diceType = type;
            dice.zIndex = 20;

            // Используем areaWidth/areaHeight для расчётов
            const spacingX = dice.width * 1.1;
            const spacingY = dice.height * 0.9;
            const cols = columns;
            const rows = Math.ceil(total / cols);
            const fullWidth = (cols - 1) * spacingX;
            const fullHeight = (rows - 1) * spacingY;
            const startX = (width / 2) - (fullWidth / 2);
            const startY = (height / 2) - (fullHeight / 2);
            const finalX = startX + (index % cols) * spacingX;
            const finalY = startY + Math.floor(index / cols) * spacingY;

            // Тень
            const shadow = new PIXI.Graphics()
                .ellipse(0, 0, dice.width * 0.6, dice.height * 0.35)
                .fill({ color: 0x000000, alpha: 0.3 });
            const blur = new PIXI.BlurFilter();
            blur.strength = 8;
            shadow.filters = [blur];
            shadow.x = finalX;
            shadow.y = finalY + 15;
            shadow.alpha = 0.5;
            shadow.zIndex = 10;
            dice.shadow = shadow;

            dice.x = finalX;
            dice.y = -150;
            dice.rotation = Math.random() * 2;

            this.gameLayer.addChild(shadow);
            this.gameLayer.addChild(dice);
            this.diceSprites.push(dice);
            createdCount++;

            gsap.to(dice, {
                y: finalY,
                rotation: (Math.random() * 0.4) - 0.2,
                duration: 1.2,
                delay: index * 0.08,
                ease: "bounce.out"
            });
        });

        this.gameLayer.sortChildren();
    }

    async collectDices(onGroupCollected?: (type: DiceValue, count: number) => void) {
        const groups: Record<string, DiceSprite[]> = { heart: [], fist: [], crit: [] };
        const colors: Record<string, number> = { heart: 0xFF3232, fist: 0x3296FF, crit: 0xFFD232 };

        this.diceSprites.forEach(s => {
            if (s && !s.destroyed && groups[s.diceType]) groups[s.diceType]!.push(s);
        });

        let timelineDelay = 0;

        for (const [type, sprites] of Object.entries(groups) as [DiceValue, DiceSprite[]][]) {
            if (sprites.length === 0) continue;

            const rawSprites = sprites.map(s => toRaw(s));
            const rawShadows = sprites.map(s => toRaw(s.shadow)).filter(sh => sh);
            const color = colors[type] ?? 0xFFFFFF;

            rawSprites.forEach(s => { s.zIndex = 100; });
            this.gameLayer.sortChildren();

            const tl = gsap.timeline({ delay: timelineDelay });

            if (rawShadows.length) {
                tl.to(rawShadows, { alpha: 0.8, tint: color, duration: 0.3, ease: "power2.out" }, 0);
                tl.to(rawShadows.map(sh => sh.scale), { x: 1.2, y: 1.2, duration: 0.3, ease: "power2.out" }, 0);
            }
            tl.to(rawSprites, { y: "-=25", duration: 0.4, ease: "power2.out", stagger: 0.05 }, 0);
            tl.add(() => { if (onGroupCollected) onGroupCollected(type, sprites.length); }, "+=0.4");

            const allInGroup = [...rawSprites, ...rawShadows];
            tl.to(allInGroup, {
                alpha: 0,
                y: (_, target) => (target instanceof PIXI.Sprite) ? "-=150" : "-=100",
                duration: 0.6,
                ease: "power2.in",
                stagger: 0.02
            }, "+=0.1");

            allInGroup.forEach(obj => {
                if (obj?.scale) {
                    tl.to(obj.scale, { x: 0.01, y: 0.01, duration: 0.5, ease: "power2.in" }, "-=0.5");
                }
            });

            tl.add(() => {
                sprites.forEach(s => {
                    if (s.shadow && !s.shadow.destroyed) s.shadow.destroy();
                    if (!s.destroyed) s.destroy();
                });
            });

            timelineDelay += 1.2;
        }

        setTimeout(() => { this.diceSprites = []; }, (timelineDelay + 1) * 1000);
    }

    destroy() {
        if (this.backgroundSprite) {
            if (this.backgroundSprite.parent) this.backgroundSprite.parent.removeChild(this.backgroundSprite);
            this.backgroundSprite.destroy({ children: true, texture: false });
            this.backgroundSprite = null;
        }
        this.diceSprites.forEach(s => {
            gsap.killTweensOf(s);
            if (s.shadow) {
                gsap.killTweensOf(s.shadow);
                if (s.shadow.parent) s.shadow.parent.removeChild(s.shadow);
                s.shadow.destroy();
            }
            if (s.parent) s.parent.removeChild(s);
            s.destroy();
        });
        this.diceSprites = [];
    }
}