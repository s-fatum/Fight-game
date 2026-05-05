import type { Fighter, BattleScenario } from '@/types';

export const BattleService = {
    async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    async fetchFighters(): Promise<Fighter[]> {
        await this.delay(300);
        return [
            { id: 1, name: 'Флешка', image: 'flash', health: 100, attack: 15, crit: 8, currentHealth: 100 },
            { id: 2, name: 'Панама', image: 'panama', health: 120, attack: 12, crit: 12, currentHealth: 120 },
            { id: 3, name: 'Злой Календарь', image: 'calendar', health: 80, attack: 20, crit: 5, currentHealth: 80 }
        ];
    },

    async startBattle(payload: { fighterId: number; bet: number; diceCount: number }): Promise<{ enemy: Fighter; scenario: BattleScenario }> {
        await this.delay(800);
        const enemy: Fighter = {
            id: 3,
            name: 'Календарь',
            image: 'calendar',
            health: 150,
            attack: 18,
            crit: 10,
            currentHealth: 150
        };
        const scenario: BattleScenario = {
            winnerId: payload.fighterId,
            diceValues: { heart: 2, fist: 3, crit: 4 },
            boostedStats: { hp: 120, atk: 30, crt: 12 }, // статы игрока после применения бустов
            rounds: [
                {
                    attackerId: payload.fighterId,
                    targetId: 3,
                    damage: 15,
                    isCrit: false,
                    shakeIntensity: 0,
                    slotResult: ['sword', 'shield', 'sword']
                },
                {
                    attackerId: 3,
                    targetId: payload.fighterId,
                    damage: 20,
                    isCrit: false,
                    shakeIntensity: 1,
                    slotResult: ['skull', 'miss', 'skull']
                },
                {
                    attackerId: payload.fighterId,
                    targetId: 3,
                    damage: 55,
                    isCrit: true,
                    shakeIntensity: 2,
                    slotResult: ['fire', 'fire', 'fire']
                }
            ]
        };
        return { enemy, scenario };
    }
};