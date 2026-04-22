<template>
    <div class="page-background main-bg" ref="pixiContainer">
        <div class="content-wrapper">
            <FighterSelection v-if="step === 'selection'" @start="handleStart" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { pixiManager } from '@/core/pixiApp';
import { NeonLogo } from '@/core/NeonLogo';

export default defineComponent({
    data() {
        return {
            step: 'intro', // Начинаем с интро
            logo: null as NeonLogo | null,
        };
    },

    async mounted() {
        const app = await pixiManager.init();
        const container = this.$refs.pixiContainer as HTMLDivElement;
        if (container && app.canvas) {
            container.prepend(app.canvas);
        }

        this.logo = new NeonLogo(app);

        app.ticker.add(() => {
            if (this.logo) this.logo.update();
        });

        setTimeout(() => {
            this.step = 'selection';
            if (this.logo) {
                this.logo.flyToTop();
            }
        }, 2500);
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