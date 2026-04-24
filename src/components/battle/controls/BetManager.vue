<template>
    <div class="panel-section bet-manager">
        <h3 class="section-title">Выбор ставки</h3>

        <div class="bet-display">
            <input
                type="number"
                :value="store.betAmount"
                readonly
                class="bet-input-field"
            />
            <span class="currency-label">🪙</span>
        </div>

        <div class="bet-grid">
            <button
                v-for="amount in betOptions"
                :key="amount"
                @click="store.addToBet(amount)"
            >
                +{{ amount }}
            </button>
        </div>

        <button @click="store.resetBet()" class="reset-bet-btn">
            Сбросить ставку
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useBattleStore } from '@/store/BattleStore';

export default defineComponent({
    name: 'BetManager',
    setup() {
        const store = useBattleStore();
        if (store.betAmount === 0) {
            store.addToBet(5);
        }
        const betOptions = [10, 50, 100, 200, 500, 1000];

        return { store, betOptions };
    },
});
</script>

<style scoped lang="scss">
.bet-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.bet-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 10px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    &:hover { background: rgba(255, 255, 255, 0.15); }
}

.bet-display {
    background: #fff; /* Белый инпут как на макете */
    border-radius: 4px;
    margin-bottom: 15px;
    input {
        color: #000;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
    }
}
</style>