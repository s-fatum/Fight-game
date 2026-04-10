// PlayerCore.ts
import type { IFighterStats } from '@/types';

export default class PlayerCore {
    playerId: number;
    characterInfo: {
        characterName: string;
        characterImg: string;
    };
    playerHealth: {
        currentHealth: number;
        maxHealth: number;
        healthColor: string;
    };
    attackButtonDisable: boolean = false;
    isWinner: boolean;

    constructor(fighter: IFighterStats) {
        this.playerId = fighter.id;
        this.characterInfo = {
            characterName: fighter.name,
            characterImg: fighter.avatar,
        };
        this.playerHealth = {
            currentHealth: fighter.currentHealth,
            maxHealth: fighter.maxHealth,
            healthColor: fighter.healthColor || '#58964d',
        };
        this.isWinner = fighter.isWinner || false;
    }

    // Применяет урон и обновляет цвет
    applyDamage(damage: number) {
        this.playerHealth.currentHealth = Math.max(0, this.playerHealth.currentHealth - damage);
        this.updateHealthColor();
    }

    private updateHealthColor() {
        const percent = (this.playerHealth.currentHealth / this.playerHealth.maxHealth) * 100;
        if (percent > 50) this.playerHealth.healthColor = '#58964d';
        else if (percent > 25) this.playerHealth.healthColor = '#f8b30e';
        else this.playerHealth.healthColor = '#d20505';
    }
}