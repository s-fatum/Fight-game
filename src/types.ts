export interface Fighter {
    id: number;
    name: string;
    avatar: string;
    maxHealth: number;
    currentHealth: number;
    attack: number;
    crit: number;
}

export type GameState = 'START' | 'ROLLING_DICE' | 'BATTLE_ROUND' | 'GET_BOSS_PLAY' | 'BATTLE_BOSS' | 'FINISH';

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