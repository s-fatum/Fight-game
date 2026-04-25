<template>
    <div class="dice-preparation-screen" :style="backgroundStyle">
        <div class="hud-frame dice-layout">

            <div class="dice-canvas-section">
                <div ref="pixiContainer" class="pixi-wrapper"></div>
            </div>

            <div class="boosts-section">
                <div class="section-header">УСИЛЕНИЯ</div>
                <div class="boosts-list">
                    <div v-for="(stat, key) in displayBoosts" :key="key"
                         class="boost-row" :class="{ 'has-value': stat > 0 }">
                        <div class="stat-name">{{ key.toUpperCase() }}</div>
                        <div class="stat-value">+{{ Math.round(stat) }}{{ key === 'crit' ? '%' : '%' }}</div>
                    </div>
                </div>
            </div>
            <div class="player-card">
                <FighterCard
                    v-if="player"
                    :fighter="player"
                    :is-selected="false"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue';
import { pixiManager } from '@/core/pixiApp';
import { DiceCore } from '@/core/DiceCore';
import gsap from 'gsap';
import FighterCard from '@/components/battle/selection/FighterCard.vue';
import { useBattleStore } from '@/store/BattleStore.ts';

export default defineComponent({
    name: 'DicePreparation',
    components: { FighterCard },
    setup() {
        const battleStore = useBattleStore();
        return { battleStore };
    },
    props: {
        selectedFighter: { type: Object, default: () => ({ name: 'ФЛЕШКА', avatar_hero: 'flash_h.jpg' }) },
        values: { type: Array as () => string[], default: () => ['heart', 'fist', 'crit', 'fist', 'heart'] }
    },
    data() {
        return {
            diceCore: null as DiceCore | null,
            // Для анимации цифр в центральной панели
            displayBoosts: { heart: 0, fist: 0, crit: 0 },
        };
    },
    computed: {
        player() { return this.battleStore.player; },
        backgroundStyle() {
            return { background: `url(${new URL('@/assets/locations/hangar_bg.jpg', import.meta.url).href}) center/cover no-repeat` };
        }
    },
    async mounted() {
        const container = this.$refs.pixiContainer as HTMLElement;
        const app = markRaw(await pixiManager.init({ resizeTo: container}));

        if (container && app.canvas) {
            container.appendChild(app.canvas);
            pixiManager.forceResize(container.clientWidth, container.clientHeight);
        }

        this.diceCore = new DiceCore(app);
        await this.diceCore.loadAssets();
        this.diceCore.spawnDiceGrid(this.values);

        setTimeout(() => {
            this.diceCore?.collectDices((type, count) => {
                this.animateStatGrowth(type, count);
            });
        }, 2000);
    },
    methods: {
        animateStatGrowth(type: string, count: number) {
            const increments: any = { heart: 10, fist: 15, crit: 2 };
            const statMap: any = { heart: 'hp', fist: 'atk', crit: 'crit' };

            // 1. Анимация цифр в центральной колонке
            gsap.to(this.displayBoosts, {
                [type]: this.displayBoosts[type as keyof typeof this.displayBoosts] + (count * increments[type]),
                duration: 1,
                ease: "power1.out"
            });

            // 2. Анимация полосок здоровья/атаки игрока
            const targetStat = statMap[type];
            if (targetStat) {
                gsap.to(this.playerStats[targetStat as keyof typeof this.playerStats], {
                    current: this.playerStats[targetStat as keyof typeof this.playerStats].current + (count * increments[type]),
                    duration: 1.2,
                    ease: "back.out(1.7)"
                });
            }
        }
    },
    beforeUnmount() {
        this.diceCore?.destroy();
        pixiManager.purge();
    }
});
</script>

<style scoped lang="scss">
.dice-preparation-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #050505; // Фоллбэк
}

.dice-layout {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 1fr;
    width: 90%;
    max-width: 1400px;
    height: 700px;
    position: relative;

    padding: 40px;
    background: rgba(0, 178, 255, 0.02);
    backdrop-filter: blur(2px) saturate(150%);
    -webkit-backdrop-filter: blur(2px);
    border-radius: 12px;
    border: 2px solid rgba(76, 201, 255, 0.75);
    overflow: hidden;;
    box-shadow:
        0 0 10px rgba(17, 61, 85, 0.4),
        0 0 20px 2px rgba(45, 77, 96, 0.61),
        0 0 1px 1px #405765;
}

.dice-canvas-section {
    position: relative;
    border-right: 1px solid rgba(76, 201, 255, 0.3);
    background: rgba(0, 0, 0, 0.5);

    .pixi-wrapper { width: 100%; height: 100%; }
}

.boosts-section {
    padding: 40px;
    background: rgba(76, 201, 255, 0.03);
    display: flex;
    flex-direction: column;
    justify-content: center;

    .section-header {
        font-size: 2rem;
        color: #4cc9ff;
        text-shadow: 0 0 10px #4cc9ff;
        margin-bottom: 50px;
        text-align: center;
    }

    .boost-row {
        margin-bottom: 30px;
        transition: all 0.3s;
        &.has-value { transform: scale(1.1); color: #ffb700; }
    }

    .stat-name { font-size: 1.2rem; color: #888; }
    .stat-value { font-size: 2.5rem; font-weight: 800; }
}

.player-card {
    display: flex;
    flex-direction: column;
    height: 100%;

    :deep(.fighter-card) {
        height: 100% !important;
        display: flex;
        flex-direction: column;

        .fighter-card__avatar-wrapper {
            aspect-ratio: auto !important;
            height: auto !important;
            max-height: 500px;
            order: 3;
        }

        .fighter-card__img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top;
        }

        .fighter-card__name {
            margin-top: 15px;
            order: 1;
        }

        .fighter-stats {
            order: 2;
            margin: 0 0 15px;
        }

        .stat-bar-bg {
            height: 8px;

        }
    }
}
</style>