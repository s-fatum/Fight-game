<template>
    <div class="main-page">
        <div class="info-card">
            <h2>Подготовка к сражению</h2>
            <p class="description">
                Выберите бойца и подготовьтесь к битве.
                <span class="highlight">Победа принесет x1.5</span>, в суперигре — <span class="highlight">x5</span>!
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
                    <button @click="addBet(10)">+10</button>
                    <button @click="addBet(50)">+50</button>
                    <button @click="resetBet" class="reset">Сброс</button>
                </div>
            </div>

            <div class="dice-controls">
                <h3>Кубики: <span class="blue">{{ store.purchasedDiceCount }} шт.</span></h3>
                <button
                    @click="buyDice"
                    :disabled="!store.canBuyDice"
                    class="buy-dice-btn"
                >
                    Купить (+1 за {{ store.nextDicePrice }} 🪙)
                </button>
            </div>
        </div>

        <button
            @click="handleStart"
            :disabled="!selectedFighterId || store.betAmount <= 0 || store.isProcessing"
            class="start-battle-btn"
        >
            {{ store.isProcessing ? 'ПОДГОТОВКА...' : 'В БОЙ!' }}
        </button>

        <div v-if="isSpinningEnemy" class="enemy-roulette-overlay">
            <div class="roulette-content">
                <h3>Выбор противника...</h3>
                <div class="spinner">
                    <div class="target-pointer"></div>
                    <div class="spinner-track" :style="{ transform: `translateY(${offset}px)` }">
                        <div v-for="(item, idx) in roulettePool" :key="idx" class="spinner-item">
                            <img :src="'/src/assets/characters/avatars/' + item.avatar" class="spinner-img">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="main-page">
            <DiceOverlay :values="[1, 2, 3, 4, 5, 6, 1, 2, 3]" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useBattleStore } from '@/store/BattleStore.ts';
import DiceOverlay from '@/components/dices/DiceOverlay.vue'; // Импортируем

export default defineComponent({
    name: 'MainPage',
    components: {
        DiceOverlay
    },
    data() {
        return {
            isSpinningEnemy: false,
            offset: 0,
            roulettePool: [] as any[],
            itemHeight: 200,
        };
    },
    computed: {
        store() { return useBattleStore(); },
        availableFighters() { return this.store.availableFighters; },
        selectedFighterId() { return this.store.selectedFighterId; }
    },
    methods: {
        async handleStart() {
            if (!this.selectedFighterId || this.store.betAmount <= 0) return;

            // 1. Подготовка данных
            const chosenEnemy = await this.store.prepareBattleData();
            if (!chosenEnemy) return;

            // 2. Рулетка
            await this.runEnemyRoulette(chosenEnemy);

            // 3. Кубики
            this.store.startDiceRolling();
            await new Promise(r => setTimeout(r, 2000));

            // 4. Бусты
            this.store.applyDiceBoosts();
            await new Promise(r => setTimeout(r, 1500));

            // 5. Бой
            await this.store.startMainFight();
        },

        async runEnemyRoulette(target) {
            this.isSpinningEnemy = true;
            const opponents = this.availableFighters.filter(f => f.id !== this.selectedFighterId);
            const repeats = 10;
            this.roulettePool = Array(repeats).fill(opponents).flat();

            const targetIdx = (repeats - 2) * opponents.length + opponents.findIndex(e => e.id === target.id);
            this.offset = 0;

            setTimeout(() => {
                this.offset = -(targetIdx * this.itemHeight);
            }, 50);

            await new Promise(r => setTimeout(r, 4000));
            this.isSpinningEnemy = false;
        },

        selectHero(id: number) { this.store.setSelectedFighter(id); },
        addBet(val: number) { this.store.addToBet(val); },
        resetBet() { this.store.resetBet(); },
        buyDice() { this.store.buyDice(); }
    },
    async mounted() {
        await this.store.loadFighters();
    }
});
</script>

<style scoped lang="scss">
.main-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    color: white;
}

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

/* СТИЛИ РУЛЕТКИ */
.enemy-roulette-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.spinner {
    width: 200px;
    height: 200px;
    overflow: hidden;
    border: 4px solid #ffd700;
    position: relative;
    background: #111;
}

.spinner-track {
    transition: transform 3.5s cubic-bezier(0.15, 0, 0.15, 1);
}

.spinner-item {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    img { width: 140px; height: 140px; }
}

.target-pointer {
    position: absolute;
    top: 50%; left: 0; width: 100%; height: 2px;
    background: #ffd700;
    z-index: 10;
    transform: translateY(-50%);
}
</style>