import { defineStore } from 'pinia';
import { useUserStore } from './UserStore.ts';
import { BattleService } from "@/api/battle.service";
import type { Fighter, BattleScenario, GameState } from "@/types";

export const useBattleStore = defineStore('battle', {
    state: () => ({
        currentScreen: 'main',
        currentState: 'START' as GameState,
        availableFighters: [] as Fighter[],
        selectedFighterId: null as number | null,

        player: null as Fighter | null,
        enemy: null as Fighter | null,

        scenario: null as BattleScenario | null,
        isProcessing: false,
        diceValues: [] as number[],
        isBossMode: false,
        purchasedDiceCount: 0,
        betAmount: 0
    }),

    getters: {
        nextDicePrice: (state) => (state.purchasedDiceCount + 1) * 10,

        canBuyDice(state): boolean {
            const userStore = useUserStore();
            return userStore.balance >= this.nextDicePrice && state.purchasedDiceCount < 9;
        }
    },

    actions: {
        setScreen(screenName: string) {
            this.currentScreen = screenName;
        },

        async loadFighters() {
            this.availableFighters = await BattleService.fetchFighters();
        },

        addToBet(amount: number) {
            const userStore = useUserStore();
            if (userStore.balance >= this.betAmount + amount) {
                this.betAmount += amount;
            }
        },

        resetBet() {
            this.betAmount = 0;
        },

        buyDice() {
            const userStore = useUserStore();
            const price = this.nextDicePrice;

            if (userStore.spendMoney(price)) {
                this.purchasedDiceCount++;
                this.diceValues.push(Math.floor(Math.random() * 6) + 1);
            }
        },

        // Инициализация бойцов (теперь через простые объекты)
        async initBattle(enemyDataFromSpin?: Fighter) {
            if (this.selectedFighterId === null) return;

            const fData = this.availableFighters.find(f => f.id === this.selectedFighterId);
            if (!fData) return;

            // Клонируем данные игрока
            this.player = JSON.parse(JSON.stringify(fData));

            if (this.isBossMode) {
                this.enemy = {
                    id: 999,
                    name: 'Синий Ежедневник',
                    avatar: '../boss.jpg',
                    maxHealth: 500,
                    currentHealth: 500,
                    attack: 40,
                    crit: 20
                };
            } else if (enemyDataFromSpin) {
                this.enemy = JSON.parse(JSON.stringify(enemyDataFromSpin));
            }
        },

        async startGameCycle() {
            if (!this.selectedFighterId || this.betAmount <= 0) return;

            const userStore = useUserStore();
            if (!userStore.spendMoney(this.betAmount)) return;

            this.isProcessing = true;

            // Выбор врага для рулетки
            const possibleEnemies = this.availableFighters.filter(f => f.id !== this.selectedFighterId);
            const chosenEnemy = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];

            this.currentState = 'ROLLING_DICE';

            // Пауза на "Шоу"
            await new Promise(r => setTimeout(r, 2500));

            // Данные с "бэка"
            this.diceValues = Array.from({ length: this.purchasedDiceCount }, () => Math.floor(Math.random() * 6) + 1);
            this.scenario = await BattleService.generateScenario(this.purchasedDiceCount, false);

            // Инициализируем чистые объекты
            await this.initBattle(chosenEnemy);

            // Математика бустов
            this.applyDiceBoosts();

            this.currentState = 'BATTLE_ROUND';
            this.setScreen('battle');
        },

        applyDiceBoosts() {
            if (!this.player) return;

            this.diceValues.forEach(val => {
                if (val <= 2) {
                    this.player!.maxHealth += 20;
                    this.player!.currentHealth += 20;
                } else if (val <= 4) {
                    this.player!.attack += 5;
                } else {
                    this.player!.crit += 3;
                }
            });
        },

        async runAutoBattle() {
            if (!this.player || !this.enemy || !this.scenario) return;
            this.isProcessing = true;

            for (const round of this.scenario.rounds) {
                // Ищем цель по ID
                const target = round.targetId === this.player.id ? this.player : this.enemy;

                // Наносим урон напрямую в свойство объекта
                target.currentHealth = Math.max(0, target.currentHealth - round.damage);

                if (target.currentHealth <= 0) break;
                await new Promise(r => setTimeout(r, 1000));
            }

            this.isProcessing = false;

            if (this.player.currentHealth > 0) {
                if (!this.isBossMode) {
                    this.currentState = 'GET_BOSS_PLAY';
                } else {
                    this.finalizeGame(true, true);
                }
            } else {
                this.finalizeGame(false);
            }
        },

        async startBossBattle() {
            this.isBossMode = true;
            this.isProcessing = true;

            this.scenario = await BattleService.generateScenario(0, true);

            await this.initBattle();
            // Лечим игрока перед боссом
            if (this.player) {
                this.player.currentHealth = this.player.maxHealth;
            }

            this.currentState = 'BATTLE_BOSS';
            await this.runAutoBattle();
        },

        finalizeGame(isWin: boolean, isBoss: boolean = false) {
            const userStore = useUserStore();
            let reward = 0;

            if (isWin) {
                reward = isBoss ? this.betAmount * 5 : this.betAmount * 1.5;
                userStore.balance += reward;
            }

            this.currentState = 'FINISH';
            // В resetGame мы очистим ставку, но экран FINISH должен успеть показаться
            // Обычно reset вызывают при закрытии попапа, но оставим как в твоем коде
            this.resetGame();
        },

        setSelectedFighter(id: number) {
            this.selectedFighterId = id;
        },

        resetGame() {
            this.betAmount = 0;
            this.purchasedDiceCount = 0;
            this.isBossMode = false;
            this.diceValues = [];
            this.isProcessing = false;
            console.log("resetGame done");
        }
    }
});