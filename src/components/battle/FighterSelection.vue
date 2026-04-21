<template>
    <div class="prep-screen">
        <div class="info-card">
            <h2>Подготовка к сражению</h2>
            <p class="description">
                Выберите бойца и подготовьтесь к битве.
                <span class="highlight">Победа принесет x1.5</span>, в суперигре — <span class="highlight">x5</span>!
            </p>
        </div>

        <div class="fighters-container">
            <div
                v-for="fighter in store.availableFighters"
                :key="fighter.id"
                @click="store.setSelectedFighter(fighter.id)"
                :class="['fighter-card', { 'selected': store.selectedFighterId === fighter.id }]"
            >
                <div class="fighter-card__avatar-wrapper">
                    <img :src="'/src/assets/characters/avatars/' + fighter.avatar" class="fighter-card__img">
                </div>
                <p class="fighter-card__name">{{ fighter.name }}</p>
                <div class="fighter-stats">
                    <div class="stat-row">
                        <span>HP</span>
                        <div class="stat-bar-bg"><div class="stat-bar-fill hp" :style="{width: '100%'}"></div></div>
                        <span>{{ fighter.maxHealth }}</span>
                    </div>
                    <div class="stat-row">
                        <span>ATK</span>
                        <div class="stat-bar-bg"><div class="stat-bar-fill atk" :style="{width: (fighter.attack * 2) + '%'}"></div></div>
                        <span>{{ fighter.attack }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="controls-section">
            <div class="bet-controls">
                <h3>Ваша ставка: <span class="gold">{{ store.betAmount }} 🪙</span></h3>
                <div class="bet-buttons">
                    <button @click="store.addToBet(10)">+10</button>
                    <button @click="store.addToBet(50)">+50</button>
                    <button @click="store.resetBet()" class="reset">Сброс</button>
                </div>
            </div>

            <div class="dice-controls">
                <h3>Кубики: <span class="blue">{{ store.purchasedDiceCount }} шт.</span></h3>
                <button
                    @click="store.buyDice()"
                    :disabled="!store.canBuyDice"
                    class="buy-dice-btn"
                >
                    Купить (+1 за {{ store.nextDicePrice }} 🪙)
                </button>
            </div>
        </div>

        <button
            @click="$emit('start')"
            :disabled="!store.selectedFighterId || store.betAmount <= 0 || store.isProcessing"
            class="start-battle-btn"
        >
            {{ store.isProcessing ? 'ПОДГОТОВКА...' : 'В БОЙ!' }}
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
        return { store };
    }
});
</script>

<style scoped lang="scss">
/* Стили перенесены из твоего MainPage.vue */
.prep-screen { width: 100%; }
.info-card {
    background: rgba(0,0,0,0.6);
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 30px;
    text-align: center;
    border: 1px solid #444;
}
.fighters-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}
.fighter-card {
    background: #2a2a2a;
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid transparent;
    &.selected {
        border-color: #ffd700;
        background: #333;
        transform: translateY(-5px);
    }
    &__avatar-wrapper {
        height: 150px;
        margin-bottom: 10px;
        img { width: 100%; height: 100%; object-fit: contain; }
    }
    &__name { text-align: center; font-weight: bold; margin-bottom: 10px; }
}
.stat-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    margin-bottom: 5px;
}
.stat-bar-bg {
    flex: 1;
    height: 8px;
    background: #444;
    border-radius: 4px;
    overflow: hidden;
}
.stat-bar-fill {
    height: 100%;
    &.hp { background: #ff4757; }
    &.atk { background: #ffa502; }
}
.controls-section {
    display: flex;
    justify-content: space-around;
    background: #1a1a1a;
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 20px;
}
.bet-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    button {
        padding: 8px 15px;
        background: #444;
        border: none;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        &.reset { background: #c0392b; }
        &:hover { background: #555; }
    }
}
.buy-dice-btn {
    margin-top: 10px;
    padding: 10px;
    background: #2980b9;
    border: none;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.start-battle-btn {
    width: 100%;
    padding: 20px;
    background: #27ae60;
    border: none;
    color: white;
    font-size: 24px;
    font-weight: bold;
    border-radius: 10px;
    cursor: pointer;
    &:disabled { background: #7f8c8d; }
}
</style>