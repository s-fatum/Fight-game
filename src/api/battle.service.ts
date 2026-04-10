import type { IBattleScenario, IFighterStats } from '@/types';

export const BattleService = {
    async fetchFighters(): Promise<IFighterStats[]> {
        // Имитация данных из твоего старого ApiCharacters
        return [
            { id: 1, name: 'Блокнот', currentHealth: 100, maxHealth: 100, attack: 15, avatar: 'notebook.png', healthColor: '#58964d', isWinner: false },
            { id: 2, name: 'Ветровка', currentHealth: 100, maxHealth: 100, attack: 12, avatar: 'jacket.png', healthColor: '#58964d', isWinner: false },
            { id: 3, name: 'Ручка', currentHealth: 80, maxHealth: 80, attack: 20, avatar: 'pen.png', healthColor: '#58964d', isWinner: false }
        ];
    },

    async generateScenario(diceCount: number, isBossMode: boolean): Promise<IBattleScenario> {
        // Имитируем расчет на бэкенде
        return {
            winnerId: 1,
            initialBoosts: [{ type: 'attack', value: diceCount * 2 }],
            rounds: [
                { attackerId: 1, targetId: 2, damage: 25, isCrit: false },
                { attackerId: 2, targetId: 1, damage: 10, isCrit: false },
                { attackerId: 1, targetId: 2, damage: 80, isCrit: true }
            ]
        };
    }
};