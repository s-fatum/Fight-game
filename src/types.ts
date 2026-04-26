export interface Fighter {
    id: number;
    name: string;
    avatar: string;
    maxHealth: number;
    currentHealth: number;
    attack: number;
    crit: number;
}

export type GameState =
    | 'START'           // Начальный экран
    | 'SPINNING_ENEMY'  // Рулетка
    | 'ROLLING_DICE'    // Анимация броска кубиков
    | 'APPLYING_BOOSTS' // Визуальное усиление статов
    | 'BATTLE_ROUND'    // Обычный бой
    | 'GET_BOSS_PROMPT' // Выбор: забрать деньги или идти на босса
    | 'BATTLE_BOSS'     // Бой с боссом
    | 'FINISH_WIN'      // Экран победы (фейерверки)
    | 'FINISH_LOSE';    // Экран поражения

export interface BattleRound {
    targetId: number;
    damage: number;
    attackerId: number;
    isCrit: boolean;
}

export interface BattleScenario {
    winnerId: number;
    initialBoosts: any[];
    rounds: BattleRound[];
}

export interface UserAccount {
    sid: string;
    name: string;
    lang: string;
    balance: number;
}

export type StatKey = 'health' | 'attack' | 'crit';

export interface FighterStats {
    health: number;
    attack: number;
    crit: number;
}