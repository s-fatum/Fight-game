<template>
    <div class="selection-screen">
        <div class="glass-container">
            <div class="main-layout">
                <div class="selection-side">
                    <FighterCard
                        v-for="fighter in store.availableFighters.slice(0, 3)"
                        :key="fighter.id"
                        :fighter="fighter"
                        :isSelected="store.selectedFighterId === fighter.id"
                        @select="store.setSelectedFighter"
                    />
                </div>

                <aside class="controls-side">
                    <DiceBuyer />
                    <BetManager />
                </aside>
            </div>
        </div>

        <div class="footer-actions">
            <button
                class="btn-start-neon"
                @click="$emit('start')"
                :disabled="!store.selectedFighterId"
            >
                В БОЙ!
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useBattleStore } from '@/store/BattleStore';
import FighterCard from './selection/FighterCard.vue';
import DiceBuyer from './controls/DiceBuyer.vue';
import BetManager from './controls/BetManager.vue';

export default defineComponent({
    components: { FighterCard, DiceBuyer, BetManager },
    setup() {
        const store = useBattleStore();
        return { store };
    }
});
</script>

<style scoped lang="scss">
.selection-screen {
    margin-top: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.glass-container {
    padding: 40px;
    width: 95%;
    max-width: 1240px;

    background: rgba(0, 178, 255, 0.02);
    backdrop-filter: blur(2px) saturate(150%);
    -webkit-backdrop-filter: blur(2px);
    border-radius: 12px;
    border: 2px solid rgba(76, 201, 255, 0.75);
    position: relative;
    overflow: hidden;;
    box-shadow:
        0 0 10px rgba(49, 180, 255, 0.4),
        0 0 20px 2px rgba(106, 195, 251, 0.61),
        0 0 1px 1px #a1dcff;
}

.main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 30px;
}

.selection-side {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 20px;
}

.controls-side {
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding-left: 30px;
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.btn-start-neon {
    margin-top: 40px;
    padding: 15px 100px;
    background: #1e88e5; /* Синий как на макете */
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'Oswald', sans-serif;
    font-size: 32px;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(30, 136, 229, 0.5);
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        box-shadow: 0 0 40px rgba(30, 136, 229, 0.8);
        transform: scale(1.05);
    }
}
</style>