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
        betAmount: 0,
        currentRound: null as any,
        isSlotSpinning: false,

        // --- Болтливый лог ---
        logs: [] as string[]
    }),

    getters: {
        nextDicePrice: (state) => (state.purchasedDiceCount + 1) * 10,
        canBuyDice(state): boolean {
            const userStore = useUserStore();
            return userStore.balance >= this.nextDicePrice && state.purchasedDiceCount < 9;
        }
    },

    actions: {
        addLog(message: string) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            this.logs.unshift(`[${time}] ${message}`); // Новые логи сверху
            console.log(`[LOG]: ${message}`);
        },

        async prepareBattleData() {
            if (!this.selectedFighterId || this.betAmount <= 0) return null;
            const userStore = useUserStore();
            if (!userStore.spendMoney(this.betAmount)) return null;

            this.logs = []; // Чистим старые логи
            this.addLog("Подготовка данных боя...");
            this.isProcessing = true;
            this.isBossMode = false;
            this.currentState = 'SPINNING_ENEMY';

            const opponents = this.availableFighters.filter(f => f.id !== this.selectedFighterId);
            const chosenEnemy = opponents[Math.floor(Math.random() * opponents.length)];

            this.diceValues = Array.from({ length: this.purchasedDiceCount }, () => Math.floor(Math.random() * 6) + 1);
            this.scenario = await BattleService.generateScenario(this.purchasedDiceCount, false);

            const playerStats = this.availableFighters.find(f => f.id === this.selectedFighterId);
            this.player = JSON.parse(JSON.stringify(playerStats));
            this.enemy = JSON.parse(JSON.stringify(chosenEnemy));

            this.addLog(`Противник определен: ${this.enemy?.name}`);
            return chosenEnemy;
        },

        applyDiceBoosts() {
            this.currentState = 'APPLYING_BOOSTS';
            if (!this.player || this.diceValues.length === 0) return;

            const totalDice = this.diceValues.reduce((a, b) => a + b, 0);
            const attackBonus = totalDice * 2;

            this.player.attack += attackBonus;
            this.addLog(`Кубики дали бонус к атаке: +${attackBonus}`);
        },

        async startMainFight() {
            this.addLog("Вход на арену. Начало раунда!");
            this.currentState = 'BATTLE_ROUND';
            this.setScreen('battle');

            // Ждем небольшую паузу, чтобы Vue успел переключить экран
            await new Promise(resolve => setTimeout(resolve, 500));

            // Запускаем цикл боя
            await this.runAutoBattle();
        },

        async runAutoBattle() {
            if (!this.player || !this.enemy || !this.scenario) return;

            // Защита от двойного запуска
            if (this.isProcessing && this.currentRound) return;
            this.isProcessing = true;

            for (const round of this.scenario.rounds) {
                // Проверка: жив ли еще кто-то?
                if (this.player.currentHealth <= 0 || this.enemy.currentHealth <= 0) break;

                this.currentRound = round; // Передаем данные раунда в UI (для слотов)

                // --- ЭТАП СЛОТОВ ---
                this.isSlotSpinning = true;
                this.addLog(`Крутим слоты для хода...`);

                // Ждем анимацию слотов (например, 2 секунды)
                await new Promise(r => setTimeout(r, 2000));
                this.isSlotSpinning = false;

                // --- ЭТАП УРОНА ---
                const isPlayerAttacker = round.attackerId === 1;
                const target = isPlayerAttacker ? this.enemy : this.player;
                const attackerName = isPlayerAttacker ? this.player.name : this.enemy.name;

                target.currentHealth = Math.max(0, target.currentHealth - round.damage);
                this.addLog(`[${attackerName}] наносит ${round.damage} урона!`);

                if (target.currentHealth <= 0) {
                    this.addLog(`💀 ${target.name} пал!`);
                    break; // ПРЕРЫВАЕМ ЦИКЛ НЕМЕДЛЕННО
                }

                await new Promise(r => setTimeout(r, 500)); // Пауза между ходами
            }

            this.isProcessing = false;
            this.finishBattleLogic();
        },

        finishBattleLogic() {
            if (this.player!.currentHealth > 0) {
                this.currentState = 'GET_BOSS_PROMPT';
            } else {
                this.finalizeGame(false);
            }
        },

        handleBattleEnd() {
            const isPlayerAlive = (this.player?.currentHealth ?? 0) > 0;
            this.addLog(isPlayerAlive ? "Вы победили в этом раунде!" : "Вас сокрушили...");

            if (isPlayerAlive) {
                if (this.isBossMode) {
                    this.finalizeGame(true, true);
                } else {
                    this.addLog("Система: Ожидание решения по Суперигре...");
                    this.currentState = 'GET_BOSS_PROMPT';
                }
            } else {
                this.finalizeGame(false);
            }
        },

        async startBossBattle() {
            this.addLog("ВНИМАНИЕ: Появление БОССА!");
            this.isBossMode = true;
            this.currentState = 'BATTLE_BOSS';

            this.enemy = {
                id: 999,
                name: 'СИНИЙ ЕЖЕДНЕВНИК',
                currentHealth: 300,
                maxHealth: 300,
                attack: 30,
                avatar: 'boss.jpg',
                crit: 15
            };

            if (this.player) this.player.currentHealth = this.player.maxHealth;
            this.scenario = await BattleService.generateScenario(0, true);
            await this.runAutoBattle();
        },

        finalizeGame(isWin: boolean, isBoss: boolean = false) {
            const userStore = useUserStore();
            if (isWin) {
                const reward = Math.floor(this.betAmount * (isBoss ? 5 : 1.5));
                userStore.balance += reward;
                this.addLog(`Итог: Победа! Зачислено ${reward} 🪙`);
                this.currentState = 'FINISH_WIN';
            } else {
                this.addLog("Итог: Поражение. Ставка потеряна.");
                this.currentState = 'FINISH_LOSE';
            }
            this.isProcessing = false;
        },

        // Вызывать ТОЛЬКО при нажатии кнопки "В меню" в попапе
        resetAfterBattle() {
            this.addLog("Возврат в главное меню.");
            this.betAmount = 0;
            this.purchasedDiceCount = 0;
            this.isBossMode = false;
            this.diceValues = [];
            this.currentState = 'START';
            this.setScreen('main');
        },

        setScreen(screenName: string) { this.currentScreen = screenName; },
        async loadFighters() { this.availableFighters = await BattleService.fetchFighters(); },
        addToBet(amount: number) { this.storeBet(amount); },
        storeBet(amount: number) {
            const userStore = useUserStore();
            if (userStore.balance >= this.betAmount + amount) this.betAmount += amount;
        },
        resetBet() { this.betAmount = 0; },
        buyDice() {
            const userStore = useUserStore();
            if (this.canBuyDice) {
                userStore.spendMoney(this.nextDicePrice);
                this.purchasedDiceCount++;
            }
        },
        setSelectedFighter(id: number) { this.selectedFighterId = id; },

        async startDiceRolling() {
            this.currentState = 'ROLLING_DICE';
        },

        confirmDiceResults() {
            this.applyDiceBoosts(); // Применяем баффы к статам
            this.currentState = 'APPLYING_BOOSTS';
        }
    }
});