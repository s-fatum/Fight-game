<template>
    <div class="main-page">
        <h1 class="title">Подготовка к бою</h1>

        <div class="fighters-container">
            <div
                v-for="fighter in availableFighters"
                :key="fighter.id"
                @click="selectHero(fighter.id)"
                :class="['fighter-card', { 'selected': selectedFighterId === fighter.id }]"
            >
                <img :src="'/src/assets/characters/avatars/' + fighter.avatar" :alt="fighter.name" class="fighter-card__img">
                <p class="fighter-card__name">{{ fighter.name }}</p>
            </div>
        </div>

        <div v-if="selectedFighterId" class="setup-section">

            <div class="boost-box">
                <h3>Усиления (Кубики)</h3>
                <div class="dice-display">
                  <span class="die">Куплено 🎲 {{ diceValues.length }}</span>
                </div>
                <button
                    @click="buyDice"
                    :disabled="!canBuyDice"
                    class="buy-button"
                >
                    Купить кубик ({{ nextDicePrice }} 💰)
                </button>
            </div>

            <div class="bet-box">
                <h3>Ставка и режим</h3>
                <input type="number" v-model="betAmount" class="bet-input">
            </div>

            <button @click="handleStart" class="main-button">В БОЙ!</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useBattleStore } from '@/store/battle';
import { useUserStore } from '@/store/user';

export default defineComponent({
    name: 'MainPage',
    computed: {
        ...mapState(useBattleStore, ['availableFighters', 'diceValues', 'canBuyDice', 'nextDicePrice']),
        ...mapState(useUserStore, ['balance']),
        ...mapWritableState(useBattleStore, ['selectedFighterId', 'isBossMode']),
    },
    methods: {
        // Подключаем экшены
        ...mapActions(useBattleStore, ['loadFighters', 'initBattle', 'buyDice', 'setScreen']),

        selectHero(id: number) {
            console.log(`🎯 [UI] Выбран ID: ${id}`);
            this.selectedFighterId = id;
        },

        async handleStart() {
            console.log("🖱 [UI] Нажата кнопка СТАРТ");
            await this.initBattle();
            this.setScreen('battle');
        }
    },
    mounted() {
        this.loadFighters();
    }
});
</script>

<style lang="scss" scoped>
/* --- ВОССТАНОВЛЕННЫЕ СТИЛИ ГЛАВНОЙ СТРАНИЦЫ --- */
.title {
    font-size: 80px;
    text-align: center;
    margin-top: 95px;
    margin-bottom: 0;
}

.setup-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    margin-top: 40px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
}

.dice-display {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
    justify-content: center;
}

.die {
    font-size: 24px;
    background: #eee;
    padding: 5px;
    border-radius: 4px;
    color: #333;
}

.bet-input {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    width: 100px;
    text-align: center;
    font-size: 20px;
    color: #000;
}

.boss-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: bold;
    color: #ff4500;
}

.fighters-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 50px;
}

.fighter-card {
    border: 2px solid #ccc;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    background: #fff;
    color: #000;

    &__img {
        width: 150px;
        height: 150px;
        object-fit: contain;
    }

    &.selected {
        border-color: #4169E1;
        box-shadow: 0 0 15px rgba(65, 105, 225, 0.5);
        transform: scale(1.05);
    }
}

.main-button {
    max-width: 300px;
    width: 100%;
    height: 100px;
    font-size: 30px;
    margin: 81px auto 0;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
    background-color: #4169E1;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 10px;

    &:hover { background-color: #9370DB; }
    &:active { background-color: #483D8B; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.buy-button {
    padding: 10px 20px;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 8px;
    cursor: pointer;
    &:disabled { opacity: 0.5; }
}
</style>