<template>
    <div class="dice-preparation-screen" :style="backgroundStyle">
        <div class="hud-frame dice-layout" :class="{ 'is-summary': isFinished }">

            <div v-if="!isFinished" class="dice-canvas-section">
                <div ref="pixiContainer" class="pixi-wrapper"></div>
            </div>

            <div class="boosts-section">
                <div class="section-header">ТЕКУЩИЕ УСИЛЕНИЯ</div>
                <div class="boosts-list">
                    <div v-for="key in statKeys" :key="key"
                         class="boost-row" :class="{ 'has-value': displayBoosts[key] > 0 }">
                        <div class="stat-name">{{ key === 'heart' ? 'HEALTH' : key.toUpperCase() }}</div>
                        <div class="stat-value">+{{ Math.round(displayBoosts[key]) }}%</div>
                    </div>
                </div>
            </div>

            <div v-if="isFinished" class="final-stats-section">
                <div class="section-header">ИТОГОВЫЕ ПАРАМЕТРЫ</div>
                <div class="final-list">
                    <div v-for="key in statKeys" :key="key" class="final-row">
                        <div class="stat-name">{{ key === 'heart' ? 'HEALTH' : key.toUpperCase() }}</div>
                        <div class="gold-plate">
                            <span class="total-value">{{ getFinalValue(key) }}</span>
                            <span class="bonus-hint">(+{{ Math.round(displayBoosts[key]) }}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="player-card">
                <FighterCard v-if="player" :fighter="player" :is-selected="false" />
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
import { delay } from '@/utils/time'; // Твой хелпер

export default defineComponent({
    name: 'DicePreparation',
    components: { FighterCard },
    setup() {
        const battleStore = useBattleStore();
        return { battleStore };
    },
    data() {
        return {
            diceCore: null as DiceCore | null,
            isFinished: false,
            statKeys: ['heart', 'fist', 'crit'] as const,
            displayBoosts: { heart: 0, fist: 0, crit: 0 } as Record<string, number>,
            baseStats: { heart: 0, fist: 0, crit: 0 } as Record<string, number>,
            // Счетчики для авто-перехода
            totalGroups: 0,
            completedGroups: 0
        };
    },
    computed: {
        player() { return this.battleStore.player; },
        backgroundStyle() {
            return { background: `url(${new URL('@/assets/locations/hangar_bg.jpg', import.meta.url).href}) center/cover no-repeat` };
        }
    },
    async mounted() {
        if (this.player) {
            this.baseStats = {
                heart: this.player.maxHealth,
                fist: this.player.attack,
                crit: this.player.crit || 5
            };
        }

        const container = this.$refs.pixiContainer as HTMLElement;
        const app = markRaw(await pixiManager.init({ resizeTo: container }));

        if (container && app.canvas) {
            container.appendChild(app.canvas);
            pixiManager.forceResize(container.clientWidth, container.clientHeight);
        }

        this.diceCore = new DiceCore(app);
        await this.diceCore.loadAssets();

        // Точка истины: значения кубиков (позже придут с бэка)
        const currentDiceSet = ['heart', 'fist', 'crit', 'fist', 'heart'];
        this.totalGroups = new Set(currentDiceSet).size; // Считаем уникальные группы

        this.diceCore.spawnDiceGrid(currentDiceSet);

        await delay(2000);

        this.diceCore?.collectDices((type, count) => {
            this.animateStatGrowth(type, count);
        });
    },
    methods: {
        getFinalValue(key: string): number {
            const base = this.baseStats[key as keyof typeof this.baseStats] || 0;
            const bonusPercent = this.displayBoosts[key as keyof typeof this.displayBoosts] || 0;
            return Math.round(base + (base * bonusPercent / 100));
        },
        animateStatGrowth(type: string, count: number) {
            const multipliers: Record<string, number> = { heart: 10, fist: 15, crit: 2 };
            const increment = count * multipliers[type]!;

            gsap.to(this.displayBoosts, {
                [type]: this.displayBoosts[type as keyof typeof this.displayBoosts]! + increment,
                duration: 1.2,
                ease: "power2.out",
                onComplete: () => this.handleGroupComplete()
            });

            // Обновляем стор для живой анимации полосок в FighterCard
            if (this.player) {
                if (type === 'heart') this.player.maxHealth += increment;
                else if (type === 'fist') this.player.attack += increment;
                else if (type === 'crit') this.player.crit = (this.player.crit || 5) + increment;
            }
        },
        async handleGroupComplete() {
            this.completedGroups++;
            if (this.completedGroups >= this.totalGroups) {
                await delay(1000);
                this.isFinished = true;
                this.diceCore?.destroy();
                pixiManager.purge();
            }
        }
    }
});
</script>

<style scoped lang="scss">
.dice-preparation-screen {
    width: 100vw; height: 100vh;
    display: flex; align-items: center; justify-content: center;
}

.dice-layout {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 1fr; // Pixi | Boosts | Card
    width: 95%; max-width: 1600px; height: 750px;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

    padding: 40px;
    background: rgba(0, 178, 255, 0.02);
    border: 2px solid rgba(76, 201, 255, 0.75);
    border-radius: 12px;
    overflow: hidden;

    &.is-summary {
        // После скрытия Pixi сетка меняется: Boosts | Final | Card
        grid-template-columns: 1fr 1fr 1fr;
    }
}

.dice-canvas-section {
    border-right: 1px solid rgba(76, 201, 255, 0.3);
    background: rgba(0, 0, 0, 0.4);
    .pixi-wrapper { width: 100%; height: 100%; }
}

.boosts-section, .final-stats-section {
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    .section-header { font-size: 1.5rem; color: #4cc9ff; margin-bottom: 40px; text-transform: uppercase; }
}

.boost-row {
    margin-bottom: 20px; text-align: center;
    .stat-name { font-size: 1rem; color: #888; }
    .stat-value { font-size: 2rem; font-weight: 900; }
    &.has-value .stat-value { color: #ffb700; text-shadow: 0 0 10px rgba(255, 183, 0, 0.5); }
}

.final-stats-section {
    animation: slideIn 0.6s ease-out forwards;
    .gold-plate {
        border: 2px solid #ffb700; background: rgba(255, 183, 0, 0.1);
        padding: 10px 30px; border-radius: 12px; min-width: 220px;
        display: flex; align-items: baseline; justify-content: center;
        box-shadow: 0 0 20px rgba(255, 183, 0, 0.2);

        .total-value { font-size: 2.6rem; font-weight: 900; color: #ffb700; }
        .bonus-hint { font-size: 1.1rem; color: #ffb700; opacity: 0.7; margin-left: 10px; }
    }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
}
</style>