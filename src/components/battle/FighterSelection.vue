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
                class="start-battle-btn"
                :class="{ 'is-ready': store.selectedFighterId && store.betAmount > 0 }"
                :disabled="!store.selectedFighterId || store.betAmount <= 0"
                @click="$emit('start')"
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
        0 0 10px rgba(17, 61, 85, 0.4),
        0 0 20px 2px rgba(45, 77, 96, 0.61),
        0 0 1px 1px #405765;
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

.start-battle-btn {
    width: 300px;
    height: 60px;
    margin-top: 40px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-family: 'Oswald', sans-serif;
    font-size: 24px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    cursor: not-allowed;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-ready {
        cursor: pointer;
        color: #fff;
        background: linear-gradient(180deg, #ffb700 0%, #ff9900 100%);
        border-color: #ffb700;
        box-shadow:
            0 0 10px rgba(255, 183, 0, 0.4),
            0 0 20px 2px rgba(255, 174, 0, 0.5),
            0 0 1px 1px #ff9900,
            inset 0 0 15px rgba(255, 255, 255, 0.3);

        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        animation: golden-pulse 2s infinite;

        &:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
            box-shadow:
                0 0 15px rgba(255, 183, 0, 0.6),
                0 0 30px 4px rgba(255, 174, 0, 0.7),
                0 0 2px 2px #ff9900;
        }

        &:active {
            transform: scale(0.98);
        }
    }
}

@keyframes golden-pulse {
    0% { box-shadow: 0 0 10px rgba(255, 183, 0, 0.4), 0 0 20px 2px rgba(255, 174, 0, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 183, 0, 0.6), 0 0 40px 4px rgba(255, 174, 0, 0.8); }
    100% { box-shadow: 0 0 10px rgba(255, 183, 0, 0.4), 0 0 20px 2px rgba(255, 174, 0, 0.5); }
}

.controls-side {
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding-left: 30px;
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.section-title {
    font-family: 'Oswald', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    margin-bottom: 10px;
}
</style>