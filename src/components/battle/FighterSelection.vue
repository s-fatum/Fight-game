<template>
    <div class="prep-screen">
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

        <div class="footer-actions">
            <button class="start-btn" @click="$emit('start')" :disabled="!store.selectedFighterId">
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
.prep-screen {
    width: 80%;
    margin: 270px auto 0;
}
.main-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 30px;
    align-items: start;
    width: 100%;
    background: #333333;
    padding: 45px;
    border-radius: 20px;

    border-color: #ea9937;
    box-shadow: 0 0 20px rgba(234, 153, 55, 0.3);
}

.selection-side {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: stretch;
    gap: 15px;
    flex: 1;
}

.controls-side {
    border-left: 2px solid #1e88e5;
    padding-left: 25px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* Футер с кнопкой в бой */
.footer-actions {
    margin-top: 40px;
    display: flex;
    justify-content: center;
}

.start-battle-btn {
    width: 60%;
    padding: 22px;
    background: linear-gradient(to bottom, #27ae60, #2ecc71);
    border: none;
    color: white;
    font-family: 'Oswald', sans-serif;
    font-size: 28px;
    text-transform: uppercase;
    letter-spacing: 2px;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
    transition: all 0.3s;

    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(39, 174, 96, 0.6);
        filter: brightness(1.1);
    }

    &:active { transform: translateY(0); }
    &:disabled { background: #34495e; box-shadow: none; opacity: 0.6; cursor: not-allowed; }
}
</style>