<template>
    <div ref="diceOverlay" :class="['dice-overlay', { 'debug-mode': isDebug }]">
        <div ref="pixiContainer" class="pixi-wrapper"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

import imgHeart from '@/assets/dice/dice_heart.png';
import imgFist from '@/assets/dice/dice_fist.png';
import imgCrit from '@/assets/dice/dice_crit.png';

interface DiceSprite extends PIXI.Sprite {
    diceType: string;
    shadow: PIXI.Graphics;
}

export default defineComponent({
    name: 'DiceOverlay',
    props: {
        values: { type: Array as () => string[], default: () => [] }
    },
    data() {
        return {
            app: new PIXI.Application(),
            diceSprites: [] as DiceSprite[],
            isDebug: true // Включил обратно для теста подложки
        };
    },
    async mounted() {
        await this.initPixi();
    },
    methods: {
        async initPixi() {
            await this.app.init({
                resizeTo: window,
                backgroundAlpha: 0,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            if (this.$refs.pixiContainer && this.app.canvas) {
                (this.$refs.pixiContainer as HTMLElement).appendChild(this.app.canvas);
            }

            // Критично для работы zIndex
            this.app.stage.sortableChildren = true;

            const textures = await PIXI.Assets.load([
                { alias: 'heart', src: imgHeart },
                { alias: 'fist', src: imgFist },
                { alias: 'crit', src: imgCrit }
            ]);

            this.values.forEach((val, index) => {
                this.createDice(textures[val] || textures['heart'], index, val);
            });

            setTimeout(() => this.collectDices(), 2500);
        },

        createDice(texture: PIXI.Texture, index: number, type: string) {
            const dice = new PIXI.Sprite(texture) as DiceSprite;
            dice.anchor.set(0.5);
            dice.scale.set(0.4);
            dice.diceType = type;
            dice.zIndex = 20;

            const columns = 3;
            const spacingX = dice.width * 1.1;
            const spacingY = dice.height * 0.9;
            const total = this.values.length;
            const groupW = (Math.min(total, columns) - 1) * spacingX;
            const groupH = (Math.ceil(total / columns) - 1) * spacingY;

            const startX = (this.app.screen.width / 2) - (groupW / 2);
            const startY = (this.app.screen.height / 2) - (groupH / 2);

            const finalX = startX + (index % columns * spacingX);
            const finalY = startY + (Math.floor(index / columns) * spacingY);

            // Создание подложки
            const shadow = new PIXI.Graphics();
            shadow
                .ellipse(0, 0, dice.width * 0.6, dice.height * 0.35)
                .fill({ color: 0xFFFFFF, alpha: 0.15 });

            const blur = new PIXI.BlurFilter();
            blur.strength = 8; // Мягкое облако
            shadow.filters = [blur];

            shadow.x = finalX;
            shadow.y = finalY + 15;
            shadow.alpha = 0;
            shadow.zIndex = 10;

            dice.shadow = shadow;
            dice.x = finalX;
            dice.y = -150;
            dice.rotation = Math.random() * 2;

            this.app.stage.addChild(shadow);
            this.app.stage.addChild(dice);
            this.diceSprites.push(dice);

            gsap.to(dice, {
                y: finalY,
                rotation: (Math.random() * 0.4) - 0.2,
                duration: 1.2,
                delay: index * 0.08,
                ease: "bounce.out"
            });
        },

        collectDices() {
            const groups: Record<string, DiceSprite[]> = { heart: [], fist: [], crit: [] };
            const colors: Record<string, number> = { heart: 0xFF3232, fist: 0x3296FF, crit: 0xFFD232 };

            // 1. Группируем кубики по типу
            this.diceSprites?.forEach(s => {
                const type = s?.diceType;
                if (type && groups[type]) {
                    groups[type].push(s as DiceSprite);
                }
            });

            let timelineDelay = 0;

            Object.entries(groups).forEach(([type, sprites]) => {
                if (sprites.length === 0) return;

                const rawSprites = sprites.map(s => toRaw(s));
                const rawShadows = sprites.map(s => toRaw(s.shadow));
                const color = colors[type] ?? 0xFFFFFF;

                // Подготовка состояния
                rawSprites.forEach(s => {
                    if (!s) return;
                    s.scale.set(0.4);
                    s.alpha = 1;
                    s.renderable = true;
                    s.zIndex = 100;
                });

                rawShadows.forEach(sh => {
                    if (!sh) return;
                    sh.tint = color;
                    sh.scale.set(0.4);
                    sh.alpha = 0;
                    sh.zIndex = 99;
                });

                this.app?.stage.sortChildren();

                // ОБЪЯВЛЯЕМ ТАЙМЛАЙН
                const tl = gsap.timeline({ delay: timelineDelay });

                // 1. Анимация появления кубиков
                rawSprites.forEach((s, index) => {
                    if (!s) return;
                    tl.to(s, {
                        y: "-=25",
                        duration: 0.4,
                        ease: "power2.out"
                    }, index * 0.05);

                    tl.to(s.scale, {
                        x: 0.45,
                        y: 0.45,
                        duration: 0.4,
                        ease: "power2.out"
                    }, index * 0.05);
                });

                // 2. Анимация теней
                rawShadows.forEach((sh) => {
                    if (!sh) return;
                    tl.to(sh, {
                        alpha: 0.8,
                        duration: 0.3,
                        ease: "power2.out"
                    }, 0);

                    tl.to(sh.scale, {
                        x: 1.2,
                        y: 1.2,
                        duration: 0.3,
                        ease: "power2.out"
                    }, 0);
                });

                // 3. Улет и схлопывание (фикс Missing Plugin и Unused property)
                const allObjects = [...rawSprites, ...rawShadows];

                // Анимируем позицию и прозрачность всех сразу
                tl.to(allObjects, {
                    alpha: 0,
                    y: (_, target) => (target instanceof PIXI.Sprite) ? "-=100" : "-=60",
                    duration: 0.5,
                    ease: "power2.in",
                    stagger: 0.03
                }, "+=0.5");

                // Анимируем scale напрямую через объекты для обхода ошибки плагина
                allObjects.forEach((obj, idx) => {
                    if (obj?.scale) {
                        tl.to(obj.scale, {
                            x: 0.01,
                            y: 0.01,
                            duration: 0.5,
                            ease: "power2.in"
                        }, `+=0.5-=${(allObjects.length - idx) * 0.03}`);
                        // Используем относительное смещение, чтобы совпасть со стаггером
                    }
                });

                // Очистка памяти через .add() чтобы IDE не ругалась на unused onComplete
                tl.add(() => {
                    rawSprites.forEach(s => {
                        if (s.shadow && !s.shadow.destroyed) s.shadow.destroy({ texture: false });
                        if (!s.destroyed) s.destroy({ texture: false });
                    });
                });

                timelineDelay += 1.3;
            });

            setTimeout(() => {
                this.diceSprites = [];
            }, timelineDelay * 1000 + 1000);
        }
    },
    beforeUnmount() {
        // Убиваем все анимации на этих конкретных спрайтах
        if (this.diceSprites.length > 0) {
            this.diceSprites.forEach(s => {
                gsap.killTweensOf(s);
                if (s.shadow) gsap.killTweensOf(s.shadow);
            });
        }

        gsap.killTweensOf(".pixi-wrapper");

        // Уничтожаем приложение Pixi
        if (this.app) {
            // Останавливаем тикер Pixi, чтобы он не пытался рендерить дестронутые объекты
            this.app.ticker.stop();

            this.app.destroy(true, {
                children: true,
                texture: true,
            });
        }
    }
});
</script>

<style scoped>
.dice-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    background-color: white;
}

.pixi-wrapper {
    position: absolute;
    inset: 0;
    z-index: 10;
}
</style>