<template>
    <div class="main-page">
        <div class="page-background main-bg">
            <div class="pixi-canvas-container" ref="pixiContainer"></div>
            <div class="ui-layer">
                <transition name="fade" mode="out-in">
                    <component :is="activeComponent" v-if="activeComponent" />
                </transition>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, markRaw, provide } from 'vue';
import { useGameStore } from '@/store/GameStore';
import { PixiManager } from '@/core/PixiManager';

import FighterSelection from '@/components/battle/FighterSelection.vue';
import DicePreparation from '@/components/dices/DicePreparation.vue';
import EnemySelection from '@/components/battle/EnemySelection.vue';

const store = useGameStore();
const pixiContainer = ref<HTMLElement | null>(null);
const emit = defineEmits(['toggle-header']);

let pixiManager: PixiManager | null = null;

const activeComponent = computed(() => {
    console.log('store.currentScreen ✅', store.currentScreen, activeComponent);
    switch (store.currentScreen) {
        case 'main': return markRaw(FighterSelection);
        case 'dices': return markRaw(DicePreparation);
        case 'roulette': return markRaw(EnemySelection);
        default: return null;
    }
});

onMounted(async () => {
    if (!pixiContainer.value) return;
    pixiManager = new PixiManager();
    await pixiManager.init(pixiContainer.value);
    provide('pixiManager', pixiManager);

    pixiManager.setCallback(() => {
        emit('toggle-header', true);
    });

    if (store.currentScreen === 'intro') {
        await pixiManager.startIntro();
    }
});

onBeforeUnmount(() => {
    if (pixiManager) pixiManager.fullDestroy();
    pixiManager = null;
});
</script>

<style scoped lang="scss">
@import url('@/assets/styles/fonts.scss');

.main-page {
    width: 100%;
    height: 100%;
}
.page-background {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-image:
        linear-gradient(rgba(10, 20, 30, 0.4), rgba(10, 20, 30, 0.8)),
        url('@/assets/main_bg.jpg');
    background-size: cover;
    background-position: top center;
    background-repeat: no-repeat;
    box-sizing: border-box;
}
.pixi-canvas-container {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    overflow: hidden;
}
.ui-layer {
    position: relative;
    z-index: 10;
    height: 100%;
    padding-top: 80px;
    overflow-y: auto;
}
</style>