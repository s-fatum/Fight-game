<template>
    <div ref="pixiContainer" class="dice-overlay"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

import imgHeart from '@/assets/dice/dice_heart.png';
import imgFist from '@/assets/dice/dice_fist.png';
import imgCrit from '@/assets/dice/dice_crit.png';

export default defineComponent({
    name: 'DiceOverlay',
    props: {
        values: {
            type: Array as () => string[],
            default: () => []
        }
    },
    data() {
        return {
            app: new PIXI.Application()
        };
    },
    async mounted() {
        await this.initPixi();
    },
    beforeUnmount() {
        if (this.app) {
            this.app.destroy(true, { children: true });
        }
        gsap.killTweensOf(".dice-anim");
    },
    methods: {
        async initPixi() {
            // Инициализация
            await this.app.init({
                resizeTo: window,
                backgroundAlpha: 0,
                antialias: true,
                resolution: 1,
            });

            if (this.$refs.pixiContainer && this.app.canvas) {
                // Убедись, что стиль канваса не сжимает его
                this.app.canvas.style.width = '100%';
                this.app.canvas.style.height = '100%';
                (this.$refs.pixiContainer as HTMLElement).appendChild(this.app.canvas);
            }

            const textures = await PIXI.Assets.load([imgHeart, imgFist, imgCrit]);

            // Проверка на наличие значений
            if (!this.values || this.values.length === 0) return;

            this.values.forEach((val, index) => {
                let tex = textures[imgHeart];
                if (val === 'fist') tex = textures[imgFist];
                if (val === 'crit') tex = textures[imgCrit];

                this.createDice(tex, index);
            });
        },

        createDice(texture: PIXI.Texture, index: number) {
            if (!this.app || !this.app.stage) return;

            const dice = new PIXI.Sprite(texture);
            dice.anchor.set(0.5);

            dice.scale.set(0.4);

            const dw = dice.width;
            const dh = dice.height;

            const columns = 3;
            const spacingX = dw * 1.1;
            const spacingY = dh * 0.9;

            const total = this.values?.length || 0;
            const numCols = Math.min(total, columns);
            const numRows = Math.ceil(total / columns);

            const groupW = (numCols - 1) * spacingX;
            const groupH = (numRows - 1) * spacingY;

            const startX = (this.app.screen.width / 2) - (groupW / 2);
            const startY = (this.app.screen.height / 2) - (groupH / 2);

            const finalX = startX + (index % columns * spacingX);
            const finalY = startY + (Math.floor(index / columns) * spacingY);

            dice.x = this.app.screen.width / 2;
            dice.y = -100;

            this.app.stage.addChild(dice);

            gsap.to(dice, {
                x: finalX,
                y: finalY,
                rotation: (Math.random() * 0.4) - 0.2,
                duration: 1,
                delay: index * 0.05,
                ease: "bounce.out"
            });
        }
    }
});
</script>

<style scoped>
.dice-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
}
</style>