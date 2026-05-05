import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Fighter, BattleScenario } from '@/types';
import { useGameStore } from './GameStore';
import { useUserStore } from './UserStore';
import { BattleService } from '@/api/battle.service';
import { generateShuffledDiceArray } from '@/utils/diceUtils';

export const useBattleStore = defineStore('battle', () => {
    const gameStore = useGameStore();
    const userStore = useUserStore();
    const MAX_DICE = 9;

    const selectedFighterId = ref<number | null>(null);
    const betAmount = ref<number>(5);
    const player = ref<Fighter | null>(null);
    const enemy = ref<Fighter | null>(null);
    const battleScenario = ref<BattleScenario | null>(null);
    const purchasedDiceCount = ref<number>(0);

    // Computed для DiceBuyer
    const nextDicePrice = computed(() => 10 + purchasedDiceCount.value * 10);
    const canBuyDice = computed(() =>
        userStore.balance >= nextDicePrice.value && purchasedDiceCount.value < MAX_DICE
    );

    // Методы для BetManager
    const canAffordBet = (amount: number) => userStore.balance >= amount;
    const addToBet = (amount: number) => {
        if (canAffordBet(betAmount.value + amount)) {
            betAmount.value += amount;
        }
    };
    const resetBet = () => { betAmount.value = 0; };

    // Метод для DiceBuyer
    const buyDice = () => {
        if (canBuyDice.value) {
            userStore.balance -= nextDicePrice.value;
            purchasedDiceCount.value++;
        }
    };

    // Выбор бойца
    const setSelectedFighter = (id: number) => {
        selectedFighterId.value = id;
        player.value = gameStore.availableFighters.find(f => f.id === id) || null;
    };

    // Старт битвы
    const startBattleProcess = async () => {
        if (!selectedFighterId.value || betAmount.value <= 0) return;
        const { enemy: enemyData, scenario } = await BattleService.startBattle({
            fighterId: selectedFighterId.value,
            bet: betAmount.value,
            diceCount: purchasedDiceCount.value,
        });
        enemy.value = enemyData;
        battleScenario.value = scenario;
        const diceArray = generateShuffledDiceArray(scenario.diceValues);
        gameStore.setDiceArray(diceArray);
        gameStore.setScreen('dices');
    };

    return {
        selectedFighterId,
        betAmount,
        player,
        enemy,
        battleScenario,
        purchasedDiceCount,
        nextDicePrice,
        canBuyDice,
        canAffordBet,
        addToBet,
        resetBet,
        buyDice,
        setSelectedFighter,
        startBattleProcess,
    };
});