<template>
    <div class="page-background main-bg" ref="pixiContainer">
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
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { delay } from '@/utils/time'; // Импортируем наш хелпер
import { useBattleStore } from '@/store/BattleStore';
import { pixiManager } from '@/core/pixiApp';
import { NeonLogo } from '@/core/NeonLogo';
import FighterSelection from '@/components/battle/FighterSelection.vue';
import EnemyRoulette from '@/components/battle/EnemyRoulette.vue';
import DiceOverlay from '@/components/dices/DiceOverlay.vue';

export default defineComponent({
    name: 'MainPage',
    emits: ['toggle-header'],
    data() {
        return {
            logo: null as NeonLogo | null,
        };
    },
    components: { FighterSelection, EnemyRoulette, DiceOverlay },
    setup() {
        const step = ref<'intro' | 'selection' | 'roulette' | 'dices'>('intro');
        const pixiTicker = ref<(() => void) | null>(null);

        const store = useBattleStore();
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

        return { step, pixiTicker, handleStart, onRouletteFinished, onDicesFinished, targetEnemy, diceValues };
    },
    async mounted() {
        this.$emit('toggle-header', false);

        const app = await pixiManager.init();
        const container = this.$refs.pixiContainer as HTMLDivElement;
        if (container && app.canvas) {
            container.prepend(app.canvas);
        }

        this.logo = new NeonLogo(app);

        // Сохраняем тикер в реф из setup
        this.pixiTicker = () => {
            if (this.logo) this.logo.update();
        };
        app.ticker.add(this.pixiTicker);


        await delay(2500); // Пауза на интро

        if (this.logo) this.logo.flyToTop();
        this.$emit('toggle-header', true);

        await delay(1200); // Ждем пока лого долетит

        this.step = 'selection'; // Показываем игроков
    },

    beforeUnmount() {
        const app = pixiManager.app;
        if (app && this.pixiTicker) {
            app.ticker.remove(this.pixiTicker);
        }
        pixiManager.purge();
    }
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');

.content-wrapper {
    position: relative;
    z-index: 10; // Поверх Pixi
    height: 100%;
    overflow-y: auto;
    padding-top: 200px; // Даем место под вывеску
}
.page-background {
    height: 100vh;
    width: 100vw;
    background-image:
        linear-gradient(rgba(10, 20, 30, 0.4), rgba(10, 20, 30, 0.8)),
        url('@/assets/main_bg.png');
    background-size: cover;
    background-position: top center;
    background-repeat: no-repeat;
    padding-top: 80px;
    box-sizing: border-box;
    overflow-y: auto;
}
</style>