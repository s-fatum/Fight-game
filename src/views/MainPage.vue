<template>
    <div class="main-page">
        <div class="info-card">
            <h2>Подготовка к сражению</h2>
            <p class="description">
                Выберите своего бойца и подготовьтесь к битве.
                <span class="highlight">Победа принесет x1.5</span>, а в режиме суперигры возможен множитель <span class="highlight">x5</span>!
                Используйте кубики для усиления характеристик перед началом раунда.
            </p>
        </div>

        <div class="fighters-container">
            <div
                v-for="fighter in availableFighters"
                :key="fighter.id"
                @click="selectHero(fighter.id)"
                :class="['fighter-card', { 'selected': selectedFighterId === fighter.id }]"
            >
                <div class="fighter-card__avatar-wrapper">
                    <img :src="'/src/assets/characters/avatars/' + fighter.avatar" :alt="fighter.name" class="fighter-card__img">
                </div>
                <p class="fighter-card__name">{{ fighter.name }}</p>

                <div class="fighter-stats">
                    <div class="stat-row">
                        <span class="stat-label">HP</span>
                        <div class="stat-bar-bg"><div class="stat-bar-fill hp" :style="{width: '100%'}"></div></div>
                        <span class="stat-value">{{ fighter.maxHealth }}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">ATK</span>
                        <div class="stat-bar-bg"><div class="stat-bar-fill atk" :style="{width: (fighter.attack * 2) + '%'}"></div></div>
                        <span class="stat-value">{{ fighter.attack }}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">CRIT</span>
                        <span class="stat-value crit">{{ fighter.crit }}%</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="selectedFighterId" class="setup-section">
            <div class="setup-grid">
                <div class="setup-box">
                    <h3>Усиления</h3>
                    <div class="dice-info">Куплено 🎲 {{ diceValues.length }}</div>
                    <button @click="buyDice" :disabled="!canBuyDice" class="action-button buy">
                        + Кубик ({{ nextDicePrice }} 💰)
                    </button>
                </div>

                <div class="setup-box">
                    <h3>Ваша ставка: <span class="total-bet">{{ betAmount }} 💰</span></h3>
                    <div class="bet-buttons">
                        <button v-for="val in [10, 50, 100, 500]" :key="val" @click="addToBet(val)" class="bet-chip">
                            +{{ val }}
                        </button>
                        <button @click="resetBet" class="bet-chip reset">❌</button>
                    </div>
                </div>
            </div>

            <button @click="handleStart" class="start-battle-btn">В БОЙ!</button>
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
        ...mapWritableState(useBattleStore, ['selectedFighterId', 'isBossMode', 'betAmount']),
    },
    methods: {
        ...mapActions(useBattleStore, ['loadFighters', 'initBattle', 'buyDice', 'setScreen', 'addToBet', 'resetBet']),
        selectHero(id: number) {
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
.main-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    color: #eee;
}

/* Блок описания */
.info-card {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 30px;
    border-left: 5px solid #4169E1;

    h2 { margin: 0 0 10px 0; color: #fff; }
    .description { font-size: 16px; line-height: 1.5; color: #ccc; }
    .highlight { color: #ffd700; font-weight: bold; }
}

/* Карточки персонажей */
.fighters-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 40px;
}

.fighter-card {
    background: #1e1e2e;
    border: 2px solid #333;
    border-radius: 15px;
    padding: 15px;
    width: 220px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover { border-color: #555; transform: translateY(-5px); }
    &.selected {
        border-color: #4169E1;
        background: #252545;
        box-shadow: 0 0 20px rgba(65, 105, 225, 0.3);
    }

    &__avatar-wrapper {
        background: #2a2a3a;
        border-radius: 10px;
        margin-bottom: 10px;
        padding: 10px;
    }

    &__img { width: 100%; height: 140px; object-fit: contain; }
    &__name { font-weight: bold; font-size: 18px; margin: 10px 0; text-align: center; }
}

/* RPG Статы */
.fighter-stats {
    font-size: 12px;
    .stat-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }
    .stat-label { width: 35px; font-weight: bold; color: #888; }
    .stat-value { width: 30px; text-align: right; font-family: monospace; }
    .stat-bar-bg { flex-grow: 1; height: 6px; background: #111; border-radius: 3px; overflow: hidden; }
    .stat-bar-fill { height: 100%; border-radius: 3px; }
    .hp { background: #ff4757; }
    .atk { background: #ffa502; }
    .crit { color: #2ed573; font-weight: bold; }
}

/* Блок настройки боя */
.setup-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
}

.setup-box {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 12px;
    text-align: center;

    h3 { margin-top: 0; font-size: 18px; color: #aaa; }
    .total-bet { color: #ffd700; font-size: 24px; }
}

/* Кнопки ставок */
.bet-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
}

.bet-chip {
    padding: 8px 15px;
    background: #333;
    border: 1px solid #444;
    color: #fff;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    &:hover { background: #444; border-color: #4169E1; }
    &.reset { background: #452a2a; }
}

.start-battle-btn {
    width: 100%;
    padding: 20px;
    font-size: 24px;
    font-weight: bold;
    background: #4169E1;
    color: #fff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    &:hover { background: #4d79ff; }
}
.dice-info {
    font-size: 20px;
    color: #2a2a3a;
}
</style>