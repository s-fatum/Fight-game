<template>
    <div class="page-background main-bg">
        <main class="content-wrapper">
<!--            <FighterSelection
                v-if="step === 'selection'"
                @start="handleStart"
            />-->

<!--            <EnemyRoulette
                v-if="step === 'roulette'"
                :targetEnemy="targetEnemy"
                @finished="onRouletteFinished"
            />

            <DiceOverlay
                v-if="step === 'dices'"
                :values="diceValues"
                @finished="onDicesFinished"
            />-->
        </main>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useBattleStore } from '@/store/BattleStore';
import Header from '@/components/ui/Header.vue';
import FighterSelection from '@/components/battle/FighterSelection.vue';
import EnemyRoulette from '@/components/battle/EnemyRoulette.vue';
import DiceOverlay from '@/components/dices/DiceOverlay.vue';

export default defineComponent({
    name: 'MainPage',
    components: { Header, FighterSelection, EnemyRoulette, DiceOverlay },
    setup() {
        // ... твой существующий код setup из предыдущего шага ...
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

        const onRouletteFinished = () => {
            diceValues.value = ['heart', 'fist', 'crit', 'fist', 'heart', 'fist', 'crit', 'heart', 'fist'];
            step.value = 'dices';
        };

        const onDicesFinished = () => {
            // Переход в BattlePage будет здесь
            console.log('Кубики отыграли, пора в бой!');
        };

        return { step, handleStart, onRouletteFinished, onDicesFinished, targetEnemy, diceValues };
    }
});
</script>

<style scoped lang="scss">
.page-background {
    height: 100vh;
    width: 100vw;
    background-image:
        linear-gradient(rgba(10, 20, 30, 0.4), rgba(10, 20, 30, 0.8)),
        url('@/assets/main_bg.png'); // Твоя версия без текста
    background-size: cover;
    background-position: top center;
    background-repeat: no-repeat;
    padding-top: 80px;
    box-sizing: border-box;
    overflow-y: auto;
}
</style>