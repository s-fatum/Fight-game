// types.ts
export interface IFighterStats {
    id: number;
    name: string;
    currentHealth: number;
    maxHealth: number;
    attack: number;
    crit: number;
    avatar: string;
    healthColor: string;

    isWinner: boolean;
}

export type GameState = 'START' | 'DICE_ROLL' | 'BATTLE_ROUND_1' | 'BATTLE_BOSS' | 'FINISH';

export interface IBattleRound {
    targetId: number;
    damage: number;
    attackerId: number;
    isCrit: boolean;
}

export interface IBattleScenario {
    winnerId: number;
    initialBoosts: any[];
    rounds: IBattleRound[];
}

export interface IUserAccount {
    uid: string;
    name: string;
    lang: string;
    balance: number;
}