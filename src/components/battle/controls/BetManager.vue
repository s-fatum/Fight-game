<template>
    <div class="panel-section bet-manager">
        <h3 class="section-title">Выбор ставки</h3>

        <div class="bet-display">
            <input
                type="number"
                :value="store.betAmount ?? 20"
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
.bet-display {
    display: flex;
    align-items: center;
    background: #000;
    border-radius: 8px;
    padding: 10px 15px;
    margin-bottom: 20px;
    border: 1px solid #333;

    .bet-input-field {
        background: transparent;
        border: none;
        color: #ffd700;
        font-family: 'Oswald', sans-serif;
        font-size: 24px;
        width: 100%;
        text-align: center;
        outline: none;
    }
    .currency-label {
        font-size: 20px;
    }
}

.bet-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 15px;

    button {
        padding: 10px 5px;
        background: #333;
        border: 1px solid #444;
        color: #fff;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.2s;
        &:hover {
            background: #444;
            border-color: #555;
        }
        &:active {
            transform: scale(0.95);
        }
    }
}

.reset-bet-btn {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid #c0392b;
    color: #c0392b;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
        background: #c0392b;
        color: #fff;
    }
}
</style>