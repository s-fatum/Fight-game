<template>
    <div class="bet-manager">
        <div class="section-title">Выбор ставки</div>

        <div class="bet-display">
            <span class="amount">{{ store.betAmount }}</span>
            <span class="currency">🪙</span>
        </div>

        <div class="bet-grid">
            <button
                v-for="amount in betOptions"
                :key="amount"
                class="bet-btn"
                :disabled="!store.canAffordBet(amount)"
                @click="store.addToBet(amount)"
            >
                +{{ amount }}
            </button>
        </div>

        <button class="reset-bet-link" @click="store.resetBet()">
            Сбросить ставку
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useBattleStore } from '@/store/BattleStore';

export default defineComponent({
    name: 'FighterSelection',
    emits: ['start'],
    setup() {
        const store = useBattleStore();
        if (!store.betAmount) {
            store.betAmount = 5;
        }

        const betOptions = [10, 50, 100, 200, 500, 1000];

        return { store, betOptions };
    },
});
</script>

<style scoped lang="scss">
/* Сюда вставляешь стили из предыдущего сообщения */
.bet-manager {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.section-title {
    font-family: 'Oswald', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
}

.bet-display {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 15px;
    text-align: center;

    .amount {
        font-size: 36px;
        font-family: 'Oswald', sans-serif;
        color: #ffd700;
        text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
    }

    .currency {
        font-size: 18px;
        margin-left: 5px;
    }
}

.bet-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.bet-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    padding: 10px 5px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
    }

    &:disabled {
        opacity: 0.3;
        border-color: #2c3e50;
    }
}

.reset-bet-link {
    background: none;
    border: none;
    color: #ff4757;
    font-size: 12px;
    text-decoration: underline;
    cursor: pointer;
    align-self: center;
    opacity: 0.7;

    &:hover {
        opacity: 1;
    }
}
</style>