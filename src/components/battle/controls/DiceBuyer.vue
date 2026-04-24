<template>
    <div class="panel-section">
        <h3 class="section-title">Dice Buy</h3>
        <div class="dice-status">
            <span class="blue">{{ store.purchasedDiceCount }} шт.</span>
        </div>
        <button
            @click="store.buyDice()"
            :disabled="!store.canBuyDice"
            class="buy-dice-btn"
        >
            Купить (+1 за {{ store.nextDicePrice }} 🪙)
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useBattleStore } from '@/store/BattleStore';

export default defineComponent({
    name: 'DiceBuyer',
    setup() {
        const store = useBattleStore();
        return { store };
    }
});
</script>

<style scoped lang="scss">
.buy-dice-btn {
    width: 100%;
    padding: 12px;
    background: #1e88e5;
    border: none;
    color: white;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    &:disabled { opacity: 0.3; cursor: not-allowed; }
}
</style>