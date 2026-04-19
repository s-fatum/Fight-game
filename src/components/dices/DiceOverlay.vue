<template>
    <div ref="pixiContainer" class="dice-overlay"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

// Импортируем твои отдельные файлы
import imgHeart from '@/assets/dice/dice_heart.png';
import imgFist from '@/assets/dice/dice_fist.png';
import imgCrit from '@/assets/dice/dice_crit.png';

export default defineComponent({
    name: 'DiceOverlay',
    props: {
        values: {
            type: Array as () => number[],
            default: () => [1, 3, 6, 2, 4, 5],
        },
    },
    data() {
        return {
            app: new PIXI.Application(),
        };
    },
    async mounted() {
        await this.initPixi();
    },
    beforeUnmount() {
        if (this.app) {
            this.app.destroy(true, { children: true });
        }
        gsap.killTweensOf('.dice-anim');
    },
    methods: {
        async initPixi() {
            // В v8 инициализация делается через .init()
            await this.app.init({
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundAlpha: 0,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            });

            // Теперь используем app.canvas вместо app.view
            if (this.$refs.pixiContainer) {
                (this.$refs.pixiContainer as HTMLElement).appendChild(
                    this.app.canvas,
                );
            }

            // Загрузка текстур
            const textures = await PIXI.Assets.load([
                imgHeart,
                imgFist,
                imgCrit,
            ]);

            this.values.forEach((val, index) => {
                let tex = textures[imgHeart];
                if (val > 2 && val <= 4) tex = textures[imgFist];
                if (val > 4) tex = textures[imgCrit];

                this.createDice(tex, index);
            });
        },

        createDice(texture: PIXI.Texture, index: number) {
            if (!this.app) return;

            const dice = new PIXI.Sprite(texture);

            // Устанавливаем точку привязки в центр спрайта
            dice.anchor.set(0.5);

            // Масштаб (подбери под свои исходники, 0.5-0.7 обычно оптимально)
            dice.scale.set(0.5);

            // 1. РАССЧЕТ СЕТКИ, чтобы кубики не падали друг на друга
            const columns = 3; // Количество кубиков в ряду
            const spacing = 110; // Расстояние между центрами кубиков

            const col = index % columns;
            const row = Math.floor(index / columns);

            // Центрируем сетку относительно экрана
            const offsetX = (columns - 1) * spacing / 2;
            const finalX = (window.innerWidth / 2 - offsetX) + (col * spacing) + (Math.random() * 20 - 10);
            const finalY = (window.innerHeight / 2) + (row * spacing / 1.5) + (Math.random() * 20 - 10);

            // 2. НАЧАЛЬНОЕ СОСТОЯНИЕ
            // Кубик появляется выше экрана с рандомным смещением по горизонтали
            dice.x = window.innerWidth / 2 + (Math.random() * 600 - 300);
            dice.y = -200;
            dice.rotation = Math.random() * Math.PI * 2; // Сильное вращение в начале

            this.app.stage.addChild(dice);

            // 3. АНИМАЦИЯ ПАДЕНИЯ
            const tl = gsap.timeline({
                delay: index * 0.12 // Небольшая задержка между кубиками для эффекта очереди
            });

            tl.to(dice, {
                x: finalX,
                y: finalY,
                rotation: (Math.random() * 0.8) - 0.4, // Легкий случайный наклон в конце
                duration: 1.2,
                ease: "bounce.out", // Тот самый эффект отскока
                onComplete: () => {
                    // Когда последний кубик упал, можно подать сигнал
                    if (index === this.values.length - 1) {
                        this.$emit('finished');
                    }
                }
            });
        },
    },
});
</script>

<style scoped>
.dice-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
}
</style>