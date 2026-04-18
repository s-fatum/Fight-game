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

    async startBattle(playerFighterId: number, diceCount: number): Promise<{
        enemy: Fighter,
        diceValues: number[],
        scenario: BattleScenario
    }> {
        // 1. Получаем список всех, кроме игрока
        const all = await this.fetchFighters();
        const possibleEnemies = all.filter(f => f.id !== playerFighterId);

        // 2. Рандомим врага (на бэке это был бы результат выборки из БД)
        const enemy = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)]!;

        // 3. Генерируем значения для купленных кубиков (1-6)
        const diceValues = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);

        // 4. Генерируем сценарий боя
        const scenario = await this.generateScenario(diceCount, false);

        return { enemy, diceValues, scenario };
    },

    async generateScenario(diceCount: number, isBossMode: boolean): Promise<BattleScenario> {
        return {
            winnerId: 1, // Пусть 1 всегда будет "Игрок"
            initialBoosts: [],
            rounds: [
                { attackerId: 1, targetId: 2, damage: 20, isCrit: false }, // Игрок бьет Врага
                { attackerId: 2, targetId: 1, damage: 15, isCrit: true },  // Враг бьет Игрока
                { attackerId: 1, targetId: 2, damage: 20, isCrit: false }, // Игрок бьет Врага
                { attackerId: 1, targetId: 2, damage: 80, isCrit: true }  // Игрок добивает
            ]
        };
    }
};