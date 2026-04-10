import { defineStore } from 'pinia';
import type { GameState, IFighterStats, IBattleScenario } from '@/types';
import { BattleService } from '@/api/battle.service';
import PlayerCore from "@/game/player/PlayerCore";

export const useBattleStore = defineStore('battle', {
    state: () => ({
        currentState: 'START' as GameState,
        availableFighters: [] as IFighterStats[],
        selectedFighterId: null as number | null,
        userBalance: 1000,
        purchasedDiceCount: 0,
        diceValues: [] as number[],
        isBossMode: false,
        player: null as PlayerCore | null,
        enemy: null as PlayerCore | null,
        scenario: null as IBattleScenario | null,
        isProcessing: false,
        currentRoundIndex: -1,
    }),

    actions: {
        async initBattle() {
            console.log("🚀 [БОЙ] Инициализация начала...");
            const all = await BattleService.fetchFighters();
            const fighterData = this.availableFighters.find(f => f.id === this.selectedFighterId);

            if (fighterData) {
                this.player = new PlayerCore(JSON.parse(JSON.stringify(fighterData)));
                const enemyData = all.find(f => f.id !== this.selectedFighterId) || all[0];
                this.enemy = new PlayerCore(enemyData);

                console.log(`⚔️ [ПАРАМЕТРЫ] Игрок: ${this.player.characterInfo.characterName} (HP: ${this.player.playerHealth.maxHealth}), Противник: ${this.enemy.characterInfo.characterName}`);
            }

            this.scenario = await BattleService.generateScenario(this.purchasedDiceCount, this.isBossMode);
            console.log("📜 [СЦЕНАРИЙ] Сгенерировано раундов:", this.scenario?.rounds.length);

            this.currentState = 'BATTLE_ROUND_1';
            this.currentRoundIndex = -1;
        },

        async runAutoBattle() {
            if (!this.scenario || !this.player || !this.enemy) {
                console.error("❌ [ОШИБКА] Бой не может начаться: отсутствуют данные", { p: !!this.player, e: !!this.enemy, s: !!this.scenario });
                return;
            }

            this.isProcessing = true;
            console.log("🏁 [АВТОБОЙ] Старт цикла...");

            for (let i = 0; i < this.scenario.rounds.length; i++) {
                // Проверка смерти
                if (this.player.playerHealth.currentHealth <= 0 || this.enemy.playerHealth.currentHealth <= 0) {
                    console.log("🛑 [БОЙ] Один из бойцов пал, завершаем досрочно.");
                    break;
                }

                this.currentRoundIndex = i;
                const round = this.scenario.rounds[i];

                if (round) {
                    const target = round.targetId === this.player.playerId ? this.player : this.enemy;
                    const attacker = target === this.player ? this.enemy : this.player;

                    if (target) {
                        const oldHp = target.playerHealth.currentHealth;
                        target.applyDamage(round.damage); // Используем метод класса

                        console.log(`👊 [ХОД ${i+1}] ${attacker.characterInfo.characterName} -> ${target.characterInfo.characterName} | Урон: ${round.damage} | HP: ${oldHp} -> ${target.playerHealth.currentHealth}/${target.playerHealth.maxHealth}`);
                    }
                }
                await new Promise(res => setTimeout(res, 800));
            }

            this.isProcessing = false;
            this.handleBattleEnd();
        },

        handleBattleEnd() {
            console.log("🏁 [ФИНИШ] Обработка конца боя");
            if (this.player && this.player.playerHealth.currentHealth > 0) {
                console.log(`🏆 [ПОБЕДА] Выжил: ${this.player.characterInfo.characterName}`);
                if (this.isBossMode) {
                    this.currentState = 'BATTLE_BOSS';
                    this.player.playerHealth.currentHealth = this.player.playerHealth.maxHealth;
                } else {
                    this.player.isWinner = true;
                    this.currentState = 'FINISH';
                }
            } else {
                console.log("💀 [ПОРАЖЕНИЕ] Игрок погиб");
                this.currentState = 'FINISH';
            }
        },

        async loadFighters() {
            this.availableFighters = await BattleService.fetchFighters();
            console.log("📦 [ЗАГРУЗКА] Бойцы загружены:", this.availableFighters.length);
        }
    }
});