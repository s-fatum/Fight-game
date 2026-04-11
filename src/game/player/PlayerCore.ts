// PlayerCore.ts
import type { IFighterStats } from '@/types';

export default class PlayerCore {
    public playerId: number;
    public characterInfo: {
        characterName: string;
        characterImg: string;
    };
    public playerHealth: {
        currentHealth: number;
        maxHealth: number;
    };
    public attackButtonDisable: boolean = false;
    public isWinner: boolean = false;

    constructor(fighter: IFighterStats) {
        this.playerId = fighter.id;
        this.characterInfo = {
            characterName: fighter.name,
            characterImg: fighter.avatar,
        };
        this.playerHealth = {
            currentHealth: fighter.currentHealth,
            maxHealth: fighter.maxHealth,
        };
        this.isWinner = fighter.isWinner || false;
    }

    /**
     * Геттер для динамического расчета цвета здоровья.
     */
    public get healthColor(): string {
        const percent = (this.playerHealth.currentHealth / this.playerHealth.maxHealth) * 100;

        if (percent > 50) {
            return '#58964d'; // Зеленый
        } else if (percent > 25) {
            return '#f8b30e'; // Оранжевый
        } else {
            return '#d20505'; // Красный
        }
    }

    public playerGetDamage(damage: number, attacker?: PlayerCore): void {
        this.playerHealth.currentHealth = Math.max(0, this.playerHealth.currentHealth - damage);

        if (this.playerHealth.currentHealth <= 0 && attacker) {
            attacker.isWinner = true;
        }
    }
}