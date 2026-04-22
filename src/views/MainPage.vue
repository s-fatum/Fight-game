<template>
    <div class="page-background main-bg" ref="pixiContainer">
        <div class="content-wrapper">
            <FighterSelection v-if="step === 'selection'" @start="handleStart" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
import * as PIXI from 'pixi.js';
import { pixiManager } from '@/core/pixiApp';
import gsap from 'gsap';
import FighterSelection from '@/components/battle/FighterSelection.vue';
import { GlowFilter } from 'pixi-filters';

export default defineComponent({
    name: 'MainPage',
    components: { FighterSelection },
    // ... твой setup со step и остальным ...

    async mounted() {
        const app = await pixiManager.init();
        const container = this.$refs.pixiContainer as HTMLDivElement;
        if (container && app.canvas) {
            // Вставляем канвас как самый нижний слой
            app.canvas.style.position = 'absolute';
            app.canvas.style.top = '0';
            app.canvas.style.left = '0';
            app.canvas.style.zIndex = '0';
            container.prepend(app.canvas);
        }

        pixiManager.forceResize();
        this.createNeonLogo(app);
    },

    methods: {
        createNeonLogo(app: PIXI.Application) {
            const logoContainer = new PIXI.Container();

            // Твои переменные цветов
            const mainNeonColor = 0x1e88e5;
            const textColor = 0xea9937;

            // 1. КОНТЕЙНЕР ТЕКСТА
            const textStyle = new PIXI.TextStyle({
                fontFamily: 'Oswald, sans-serif',
                fontSize: 60,
                fill: 'transparent',
                stroke: {
                    color: '#ffffff',
                    width: 1,
                    alpha: 1
                },
                fontWeight: 'bold',
                letterSpacing: 1,
            });

            const textContainer = new PIXI.Container();
            const textTop = new PIXI.Text({ text: 'БИТВА', style: textStyle });
            const textBottom = new PIXI.Text({ text: 'ПОЛИГРАФИИ', style: textStyle });

            textTop.anchor.set(0.5);
            textTop.y = -35;
            textBottom.anchor.set(0.5);
            textBottom.y = 35;
            textContainer.addChild(textTop, textBottom);

            const textGlow = new GlowFilter({
                distance: 10, outerStrength: 2, innerStrength: 1, color: textColor, quality: 0.5,
            });
            textContainer.filters = [textGlow];

            // ГРАФИКА РАМКИ
            const borderGraphics = new PIXI.Graphics();
            const innerPadding = 25;
            const curveRadius = 20;

            // Рассчитываем габариты на основе контента
            const totalWidth = textContainer.width + innerPadding * 2;
            const totalHeight = textContainer.height + innerPadding * 2;

            // Рисуем рамку симметрично относительно (0,0)
            const halfW = totalWidth / 2;
            const halfH = totalHeight / 2;

            borderGraphics.context
                .roundRect(-halfW, -halfH, totalWidth, totalHeight, curveRadius);
            borderGraphics.stroke({ width: 3, color: 0xffffff });

            // Твои 3 слоя GlowFilter для рамки
            const borderGlowInner = new GlowFilter({
                distance: 10, outerStrength: 2, innerStrength: 3, color: 0xffffff, quality: 0.5, alpha: 0.5,
            });
            const borderGlowMain = new GlowFilter({
                distance: 30, outerStrength: 5, innerStrength: 0, color: mainNeonColor, quality: 0.5
            });
            const borderGlowFar = new GlowFilter({
                distance: 60, outerStrength: 1.5, innerStrength: 0, color: mainNeonColor, quality: 0.3
            });

            borderGraphics.filters = [borderGlowInner, borderGlowMain, borderGlowFar];

            // СБОРКА
            logoContainer.addChild(borderGraphics, textContainer);

            // Позиционируем готовую вывеску на экране
            logoContainer.x = app.screen.width / 2;
            logoContainer.y = 360;

            app.stage.addChild(logoContainer);

            // Анимация мерцания
            app.ticker.add(() => {
                borderGlowFar.outerStrength = 1.5 + Math.sin(Date.now() * 0.01) * 0.2;
                textGlow.outerStrength = 3 + Math.sin(Date.now() * 0.005) * 0.1;
            });
        }
    },

    beforeUnmount() {
        pixiManager.purge();
    }
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');

.content-wrapper {
    position: relative;
    z-index: 10; // Поверх Pixi
    height: 100%;
    overflow-y: auto;
    padding-top: 200px; // Даем место под вывеску
}
.page-background {
    height: 100vh;
    width: 100vw;
    background-image:
        linear-gradient(rgba(10, 20, 30, 0.4), rgba(10, 20, 30, 0.8)),
        url('@/assets/main_bg.png'); // Твоя версия без текста
    background-size: cover;
    background-position: top center;
    background-repeat: no-repeat;
    padding-top: 80px;
    box-sizing: border-box;
    overflow-y: auto;
}
</style>