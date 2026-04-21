<template>
    <div class="main-page">
        <FighterSelection
            v-if="step === 'selection'"
            @start="handleStart"
        />

<!--        <EnemyRoulette-->
<!--            v-if="step === 'roulette'"-->
<!--            :targetEnemy="targetEnemy"-->
<!--            @finished="onRouletteFinished"-->
<!--        />-->

<!--        <DiceOverlay-->
<!--            v-if="step === 'dices'"-->
<!--            :values="diceValues"-->
<!--            @finished="onDicesFinished"-->
<!--        />-->
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useBattleStore } from '@/store/BattleStore';
import FighterSelection from '@/components/battle/FighterSelection.vue';
import EnemyRoulette from '@/components/battle/EnemyRoulette.vue';
import DiceOverlay from '@/components/dices/DiceOverlay.vue';

export default defineComponent({
    name: 'MainPage',
    components: { FighterSelection, EnemyRoulette, DiceOverlay },
    setup() {
        const store = useBattleStore();
        const step = ref<'selection' | 'roulette' | 'dices'>('selection');
        const targetEnemy = ref<any>(null);
        const diceValues = ref<string[]>([]);

        onMounted(async () => {
            await store.loadFighters();
        });

        const handleStart = async () => {
            const enemy = await store.prepareBattleData();
            if (enemy) {
                targetEnemy.value = enemy;
                step.value = 'roulette';
            }
        };

        const onRouletteFinished = async () => {
            // Можно добавить логику подготовки броска здесь
            await store.startDiceRolling();

            // Здесь можно подтянуть реальные значения из стора
            // Для теста используем твой набор:
            diceValues.value = ['heart', 'fist', 'crit', 'fist', 'heart', 'fist', 'crit', 'heart', 'fist'];

            step.value = 'dices';
        };

        const onDicesFinished = async () => {
            // Переход к самой битве (BattlePage.vue)
            store.applyDiceBoosts();
            await store.startMainFight();
        };

        return { step, handleStart, onRouletteFinished, onDicesFinished, targetEnemy, diceValues };
    }
});
</script>

<style scoped>
.main-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
}
</style>