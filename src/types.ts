export type StatKey = 'hp' | 'atk' | 'crt';
export type DiceValue = 'heart' | 'fist' | 'crit';
export type GameScreen = 'intro' | 'main' | 'dices' | 'roulette' | 'battle' | 'finish';

export interface Fighter {
    id: number;
    name: string;
    image: string;
    health: number;
    attack: number;
    crit: number;
    currentHealth: number;
}

export interface IUserAccount {
    uid: string;
    name: string;
    lang: string;
    balance: number;
}

export interface BattleRound {
    attackerId: number;
    targetId: number;
    damage: number;
    isCrit: boolean;
    shakeIntensity: number;
    slotResult: string[];
}

export interface BattleScenario {
    winnerId: number;
    diceValues: Record<DiceValue, number>;
    boostedStats: Record<StatKey, number>;
    rounds: BattleRound[];
}