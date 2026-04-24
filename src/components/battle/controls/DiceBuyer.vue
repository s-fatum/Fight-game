<template>
    <div class="dice-buyer">
        <div class="dice-info">
            <span class="label">Усиления</span>
            <div class="count-wrapper">
                <span class="count">{{ store.purchasedDiceCount }}</span>
                <span class="unit">шт.</span>
            </div>
        </div>

        <button
            class="buy-btn"
            @click="store.buyDice"
            :disabled="!store.canBuyDice"
        >
            <span class="btn-text">Купить (+1 за {{ store.nextDicePrice }} 🪙)</span>
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
.dice-buyer {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.dice-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .label {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .count {
        font-size: 24px;
        font-weight: bold;
        color: #00d2d3; /* Яркий бирюзовый неон */
        text-shadow: 0 0 10px rgba(0, 210, 211, 0.5);
    }

    .unit {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
        margin-left: 4px;
    }
}

.buy-btn {
    position: relative;
    padding: 12px;
    background: linear-gradient(180deg, rgba(30, 136, 229, 0.3) 0%, rgba(30, 136, 229, 0.1) 100%);
    border: 1px solid #1e88e5;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: rgba(30, 136, 229, 0.4);
        box-shadow: 0 0 15px rgba(30, 136, 229, 0.4);
        border-color: #64b5f6;
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        border-color: #444;
    }

    .btn-text {
        font-weight: bold;
        font-size: 13px;
        letter-spacing: 0.5px;
    }
}
</style>