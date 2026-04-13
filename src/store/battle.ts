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
        purchasedDiceCount: 0
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
        async handleStart() {
            await this.initBattle();
            // Вместо router.push просто меняем стейт
            this.setScreen('battle');
        },
        async loadFighters() {
            console.log("📦 [LOAD] Загрузка бойцов...");
            this.availableFighters = await BattleService.fetchFighters();
            console.log(`✅ [LOAD] Найдено бойцов: ${this.availableFighters.length}`);
        },

        buyDice() {
            const userStore = useUserStore(); // Доступ к другому стору внутри экшена
            const price = this.nextDicePrice;

            if (userStore.spendMoney(price)) {
                this.purchasedDiceCount++;
                const val = Math.floor(Math.random() * 6) + 1;
                this.diceValues.push(val);
            }
        },

        async initBattle() {
            console.log("🛠 [INIT] Инициализация боя...");
            const fData = this.availableFighters.find(f => f.id === this.selectedFighterId);
            if (!fData) return console.error("❌ Герой не выбран");

            this.player = new PlayerCore(JSON.parse(JSON.stringify(fData)));
            const enemyData = this.availableFighters.find(f => f.id !== this.selectedFighterId) || fData;
            this.enemy = new PlayerCore(JSON.parse(JSON.stringify(enemyData)));

            console.log(`⚔️ [READY] ${this.player.characterInfo.characterName} vs ${this.enemy.characterInfo.characterName}`);

            this.scenario = await BattleService.generateScenario(this.purchasedDiceCount, this.isBossMode);
            this.currentState = 'BATTLE_ROUND_1';
        },

        async runAutoBattle() {
            if (!this.player || !this.enemy || !this.scenario) return;
            this.isProcessing = true;
            console.log("🚀 [BATTLE] Старт автоматического сражения");

            await new Promise(r => setTimeout(r, 1500));

            for (const [idx, round] of this.scenario.rounds.entries()) {
                const target = round.targetId === this.player.playerId ? this.player : this.enemy;
                const name = target === this.player ? "ИГРОК" : "ВРАГ";

                console.log(`Round ${idx + 1}: ${name} получает ${round.damage} урона`);
                target.playerHealth.currentHealth = Math.max(0, target.playerHealth.currentHealth - round.damage);

                if (target.playerHealth.currentHealth <= 0) {
                    console.log(`💀 [FINISH] ${name} погиб`);
                    break;
                }
                await new Promise(r => setTimeout(r, 1500));
            }
            this.isProcessing = false;
            this.currentState = 'FINISH';
        }
    }
});