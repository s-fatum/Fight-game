import type { BattleScenario, Fighter } from '@/types';

export const BattleService = {
    async fetchFighters(): Promise<Fighter[]> {
        // Имитация данных из твоего старого ApiCharacters
        return [
            {
                id: 1,
                name: 'Блокнот',
                currentHealth: 100,
                maxHealth: 100,
                attack: 15,
                avatar: 'avatar-3.jpg',
                crit: 8
            },
            {
                id: 2,
                name: 'Ветровка',
                currentHealth: 100,
                maxHealth: 100,
                attack: 12,
                avatar: 'avatar-4.jpg',
                crit: 12
            },
            {
                id: 3,
                name: 'Ручка',
                currentHealth: 80,
                maxHealth: 80,
                attack: 20,
                avatar: 'avatar-5.jpg',
                crit: 5
            },
            {
                id: 3,
                name: 'Кепка',
                currentHealth: 80,
                maxHealth: 80,
                attack: 20,
                avatar: 'avatar-6.jpg',
                crit: 5
            },
            {
                id: 3,
                name: 'Значок',
                currentHealth: 80,
                maxHealth: 80,
                attack: 20,
                avatar: 'avatar-7.jpg',
                crit: 5
            }
        ];
    },

    async generateScenario(diceCount: number, isBossMode: boolean): Promise<BattleScenario> {

        if (isBossMode) {}
        // Имитируем расчет на бэкенде
        return {
            winnerId: 1,
            initialBoosts: [{ type: 'attack', value: diceCount * 2 }],
            rounds: [
                { attackerId: 1, targetId: 2, damage: 10, isCrit: false }, // Ход 1: Легкий удар (HP 2: 90)
                { attackerId: 2, targetId: 1, damage: 12, isCrit: false }, // Ход 2: Ответка (HP 1: 88)
                { attackerId: 1, targetId: 2, damage: 15, isCrit: false }, // Ход 3: Усиление (HP 2: 75)
                { attackerId: 2, targetId: 1, damage: 8,  isCrit: false }, // Ход 4: Слабый тычок (HP 1: 80)
                { attackerId: 1, targetId: 2, damage: 20, isCrit: false }, // Ход 5: Желтая зона! (HP 2: 55)
                { attackerId: 2, targetId: 1, damage: 15, isCrit: false }, // Ход 6: Враг злится (HP 1: 65)
                { attackerId: 1, targetId: 2, damage: 15, isCrit: false }, // Ход 7: Почти финиш (HP 2: 40)
                { attackerId: 2, targetId: 1, damage: 30, isCrit: true },  // Ход 8: Внезапный крит от врага! (HP 1: 35)
                { attackerId: 1, targetId: 2, damage: 25, isCrit: false }, // Ход 9: Красная зона у врага! (HP 2: 15)
                { attackerId: 2, targetId: 1, damage: 5,  isCrit: false }, // Ход 10: Последняя попытка (HP 1: 30)
                { attackerId: 1, targetId: 2, damage: 20, isCrit: true }   // Ход 11: Финальный КРИТ (HP 2: 0)
            ]
        };
    }
};