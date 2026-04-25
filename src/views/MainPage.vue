<template>
    <div class="page-background main-bg" ref="pixiContainer">
        <div class="ui-layer">
            <FighterSelection
                v-if="step === 'selection'"
                @start="handleStart"
            />

            <DiceOverlay
                v-if="step === 'dices'"
                :values="diceValues"
                @finished="onDicesFinished"
            />

            <EnemySelection
                v-if="step === 'roulette' && false"
                :targetEnemy="targetEnemy"
                @finished="onRouletteFinished"
            />
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
import EnemySelection from '@/components/battle/EnemySelection.vue';
import DiceOverlay from '@/components/dices/DiceOverlay.vue';

export default defineComponent({
    name: 'MainPage',
    emits: ['toggle-header'],
    data() {
        return {
            logo: null as NeonLogo | null,
        };
    },
    components: { FighterSelection, EnemySelection, DiceOverlay },
    setup() {
        const step = ref<'intro' | 'selection' | 'dices' | 'roulette'>('intro');
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
            }

            // todo real data
            diceValues.value = ['heart', 'fist', 'crit', 'fist', 'heart', 'fist', 'crit', 'heart', 'fist'];
            await store.startDiceRolling();

            step.value = 'dices';
        };

        const onRouletteFinished = async () => {
            store.applyDiceBoosts();
            await store.startMainFight();
        };

        const onDicesFinished = async () => {
            step.value = 'roulette';
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

        await document.fonts.load('1em Oswald');
        await document.fonts.ready;

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
@import url('@/assets/styles/fonts.scss');

.page-background {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
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

.ui-layer {
    position: relative;
    z-index: 10;
    height: 100%;
    overflow-y: auto;
}

.main-page {
    position: relative;
    max-width: 100%;
    margin: 0 auto;
}

:deep(canvas) {
    position: absolute !important;
    top: 0;
    left: 0;
    z-index: 0;
    pointer-events: none;
}
</style>