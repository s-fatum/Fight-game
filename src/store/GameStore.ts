// src/store/GameStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DiceValue, Fighter, GameScreen } from '@/types';
import { BattleService } from '@/api/battle.service';

export const useGameStore = defineStore('game', () => {
    const currentScreen = ref<GameScreen>('intro');
    const availableFighters = ref<Fighter[]>([]);
    const diceArrayForAnim = ref<DiceValue[]>([]);

    const setScreen = (screen: GameScreen) => {
        currentScreen.value = screen;
    };

    const loadFighters = async () => {
        availableFighters.value = await BattleService.fetchFighters();
    };

    const setDiceArray = (diceArray: DiceValue[]) => {
        diceArrayForAnim.value = diceArray;
    };

    return {
        currentScreen,
        availableFighters,
        diceArrayForAnim,
        setScreen,
        loadFighters,
        setDiceArray,
    };
});