<template>
    <div class="main-page">
        <h1 class="title">Подготовка к бою</h1>

        <div class="fighters-container">
            <div
                v-for="fighter in store.availableFighters"
                :key="fighter.id"
                @click="selectHero(fighter.id)"
                :class="['fighter-card', { 'selected': store.selectedFighterId === fighter.id }]"
            >
                <img :src="fighter.avatar" :alt="fighter.name" class="fighter-card__img">
                <p class="fighter-card__name">{{ fighter.name }}</p>
            </div>
        </div>

        <div v-if="store.selectedFighterId" class="setup-section">

            <div class="boost-box">
                <h3>Усиления (Кубики)</h3>
                <div class="dice-display">
          <span v-for="(dice, idx) in store.diceValues" :key="idx" class="die">
            🎲 {{ dice }}
          </span>
                </div>
                <button
                    @click="store.buyDice"
                    :disabled="!store.canBuyDice"
                    class="buy-button"
                >
                    Купить кубик ({{ store.nextDicePrice }} 💰)
                </button>
                <p>Шанс на успех: +{{ store.diceValues.length * 5 }}%</p>
            </div>

            <div class="bet-box">
                <h3>Ставка и режим</h3>
                <input type="number" v-model="store.betAmount" class="bet-input">

                <label class="boss-label">
                    <input type="checkbox" v-model="store.isBossMode">
                    Режим БОССА (x4 награда)
                </label>
            </div>

            <button @click="handleStart" class="main-button">В БОЙ!</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBattleStore } from '@/store/battle';

const store = useBattleStore();
const router = useRouter();

onMounted(() => {
    store.loadFighters();
});

const selectHero = (id: number) => {
    store.selectedFighterId = id;
};

const handleStart = async () => {
    // Инициализируем данные боя в сторе и уходим на страницу боя
    await store.initBattle();
    router.push('/game');
};
</script>

<style lang="scss" scoped>
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
}

.bet-input {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    width: 100px;
    text-align: center;
    font-size: 20px;
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
</style>