import { defineStore } from 'pinia';
import { useUserStore } from './user';
import PlayerCore from "@/game/player/PlayerCore";
import { BattleService } from "@/api/battle.service";
import type { IFighterStats, IBattleScenario, GameState } from "@/types";

export const useBattleStore = defineStore('battle', {
    state: () => ({
        currentScreen: 'main', // 'main' или 'battle'
        currentState: 'START' as GameState,
        availableFighters: [] as IFighterStats[],
        selectedFighterId: null as number | null,
        player: null as PlayerCore | null,
        enemy: null as PlayerCore | null,
        scenario: null as IBattleScenario | null,
        isProcessing: false,
        // Поля для MainPage
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
        // 1. Навигация и инициализация данных
        setScreen(screenName: string) {
            this.currentScreen = screenName;
        },

        async loadFighters() {
            console.log("📦 [LOAD] Загрузка бойцов...");
            // Имитация API запроса
            this.availableFighters = await BattleService.fetchFighters();
        },

        // 2. Логика ставок и кубиков (MainPage)
        addToBet(amount: number) {
            const userStore = useUserStore();
            // Простая проверка: не даем ставить больше баланса
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
                // Пока просто пушим визуал, в startGameCycle пересчитаем с бэка
                this.diceValues.push(Math.floor(Math.random() * 6) + 1);
            }
        },

        // 3. Ядро боевой логики
        async initBattle() {
            if (this.selectedFighterId === null) return;

            const fData = this.availableFighters.find(f => f.id === this.selectedFighterId);
            if (!fData) return;

            // Создаем игрока
            this.player = new PlayerCore(JSON.parse(JSON.stringify(fData)));

            // Создаем врага (если не босс — берем случайного другого персонажа)
            let enemyData;
            if (this.isBossMode) {
                enemyData = {
                    id: 999, name: 'Синий Ежедневник',
                    avatar: 'boss.png', maxHealth: 500,
                    attack: 40, crit: 20
                };
            } else {
                enemyData = this.availableFighters.find(f => f.id !== this.selectedFighterId) || fData;
            }

            this.enemy = new PlayerCore(JSON.parse(JSON.stringify(enemyData)));
        },

        async startGameCycle() {
            if (!this.selectedFighterId) return;

            this.isProcessing = true;
            this.currentState = 'ROLLING_DICE'; // Для анимации кубиков на фронте

            // Имитируем запрос на бэк (отправляем ставку, получаем кубики и сценарий)
            await new Promise(r => setTimeout(r, 1500));

            // Переопределяем кубики тем, что "прислал бэк"
            this.diceValues = Array.from({ length: this.purchasedDiceCount }, () => Math.floor(Math.random() * 6) + 1);

            // Получаем сценарий первого боя
            this.scenario = await BattleService.generateScenario(this.purchasedDiceCount, false);

            await this.initBattle();
            this.currentState = 'BATTLE_ROUND';
            this.setScreen('battle');
        },

        async runAutoBattle() {
            if (!this.player || !this.enemy || !this.scenario) return;
            this.isProcessing = true;

            for (const round of this.scenario.rounds) {
                const target = round.targetId === this.player.playerId ? this.player : this.enemy;
                target.playerHealth.currentHealth = Math.max(0, target.playerHealth.currentHealth - round.damage);

                if (target.playerHealth.currentHealth <= 0) break;
                await new Promise(r => setTimeout(r, 1000)); // Пауза между ударами
            }

            this.isProcessing = false;

            if (this.player.playerHealth.currentHealth > 0) {
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

            // Имитация запроса сценария для босса
            this.scenario = await BattleService.generateScenario(0, true);

            await this.initBattle(); // Пересоздаем врага как босса
            this.player!.playerHealth.currentHealth = this.player!.playerHealth.maxHealth; // Лечим игрока

            this.currentState = 'BATTLE_BOSS';
            this.runAutoBattle();
        },

        finalizeGame(isWin: boolean, isBoss: boolean = false) {
            const userStore = useUserStore();
            let reward = 0;

            if (isWin) {
                reward = isBoss ? this.betAmount * 5 : this.betAmount * 1.5;
                userStore.balance += reward;
            }

            this.currentState = 'FINISH';
            // Сбрасываем ставку и кубики для новой игры
            this.betAmount = 0;
            this.purchasedDiceCount = 0;
            this.diceValues = [];
        },

        setSelectedFighter(id: number) {
            this.selectedFighterId = id;
        },
    }
});