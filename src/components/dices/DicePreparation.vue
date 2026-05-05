<template>
    <div class="dice-preparation-screen">
        <div class="hud-frame dice-layout" :class="{ 'is-summary': isFinished }">
            <div v-if="!isFinished" class="dice-canvas-section">
                <div ref="pixiContainer" class="pixi-wrapper"></div>
            </div>

            <div class="boosts-section">
                <div class="section-header">ТЕКУЩИЕ УСИЛЕНИЯ</div>
                <div class="boosts-list">
                    <div
                        v-for="key in statKeys"
                        :key="key"
                        class="boost-row"
                        :class="{ 'has-value': displayBoosts[key] > 0 }"
                    >
                        <div class="stat-name">
                            {{ getStatName(key) }}
                        </div>
                        <div class="stat-value">
                            +{{ Math.round(displayBoosts[key]) }}%
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="isFinished" class="final-stats-section">
                <div class="section-header">ИТОГОВЫЕ ПАРАМЕТРЫ</div>
                <div class="final-list">
                    <div v-for="key in statKeys" :key="key" class="final-row">
                        <div class="stat-name">
                            {{ getStatName(key) }}
                        </div>
                        <div class="gold-plate">
                            <span class="total-value">{{
                                getFinalValue(key)
                            }}</span>
                            <span class="bonus-hint"
                                >(+{{ Math.round(displayBoosts[key]) }}%)</span
                            >
                        </div>
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

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as PIXI from 'pixi.js';
import { DiceCore } from '@/core/DiceCore';
import gsap from 'gsap';
import FighterCard from '@/components/battle/selection/FighterCard.vue';
import { useBattleStore } from '@/store/BattleStore';
import { useGameStore } from '@/store/GameStore';
import { delay } from '@/utils/time';
import type { StatKey, DiceValue } from '@/types';

const emit = defineEmits(['finished']);
const battleStore = useBattleStore();
const gameStore = useGameStore();

const pixiContainer = ref<HTMLElement | null>(null);
let app: PIXI.Application | null = null;
let diceCore: DiceCore | null = null;

const isFinished = ref(false);
const totalGroups = ref(0);
const completedGroups = ref(0);
const statKeys: StatKey[] = ['hp', 'atk', 'crt'];
const statMapping: Record<DiceValue, StatKey> = { heart: 'hp', fist: 'atk', crit: 'crt' };
const displayBoosts = reactive<Record<StatKey, number>>({ hp: 0, atk: 0, crt: 0 });
const baseStats = reactive<Record<StatKey, number>>({ hp: 0, atk: 0, crt: 0 });
const player = computed(() => battleStore.player);

const getStatName = (key: StatKey): string => {
    const names: Record<StatKey, string> = { hp: 'Здоровье', atk: 'Атака', crt: 'Шанс крита' };
    return names[key];
};

const getFinalValue = (key: StatKey): number => {
    const base = baseStats[key] || 0;
    const bonusPercent = displayBoosts[key] || 0;
    return Math.round(base + (base * bonusPercent) / 100);
};

const handleGroupComplete = async () => {
    completedGroups.value++;
    if (completedGroups.value >= totalGroups.value) {
        await delay(1000);
        isFinished.value = true;
        if (diceCore) diceCore.destroy();

        await delay(2000);
        emit('finished');
    }
};

const animateStatGrowth = (diceType: DiceValue, count: number) => {
    const statKey = statMapping[diceType];
    const multipliers: Record<StatKey, number> = { hp: 10, atk: 15, crt: 2 };
    const increment = count * multipliers[statKey];
    gsap.to(displayBoosts, {
        [statKey]: displayBoosts[statKey] + increment,
        duration: 1.2,
        ease: 'power2.out',
        onComplete: handleGroupComplete,
    });
    if (player.value) {
        if (statKey === 'hp') player.value.health += increment;
        else if (statKey === 'atk') player.value.attack += increment;
        else if (statKey === 'crt') player.value.crit += increment;
    }
};

onMounted(async () => {
    await nextTick();
    // Даём время на финальную отрисовку DOM
    await new Promise(resolve => setTimeout(resolve, 100));

    const container = pixiContainer.value;
    if (!container) {
        console.error('pixiContainer not found');
        return;
    }

    app = new PIXI.Application();
    await app.init({
        resizeTo: container,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundAlpha: 0,
        antialias: true,
    });

    container.appendChild(app.canvas);

    let currentDiceSet = gameStore.diceArrayForAnim as DiceValue[];

    if (player.value) {
        baseStats.hp = player.value.health;
        baseStats.atk = player.value.attack;
        baseStats.crt = player.value.crit;
    }
    totalGroups.value = new Set(currentDiceSet).size;

    diceCore = new DiceCore(
        app.stage,
        app.screen.width,
        app.screen.height
    );
    await diceCore.loadAssets();

    diceCore.spawnDiceGrid(currentDiceSet);

    setTimeout(() => {
        console.log('Starting collectDices');
        diceCore?.collectDices(animateStatGrowth);
    }, 2000);
});

onBeforeUnmount(() => {
    if (diceCore) diceCore.destroy();
    if (app) {
        app.destroy(true, { children: true });
        app = null;
    }
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/_variables.scss" as *;

.dice-canvas-section {
    position: relative;
    overflow: hidden;

    .pixi-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
}

.dice-preparation-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dice-layout {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 1fr;
    width: 95%;
    max-width: 1600px;
    height: 85vh;
    max-height: 800px;
    padding: 2vh 2vw;
    box-sizing: border-box;
    border-radius: 12px;
    overflow: hidden;

    background: rgba(0, 178, 255, 0.02);
    backdrop-filter: blur(2px) saturate(150%);
    -webkit-backdrop-filter: blur(2px);
    border: 2px solid rgba(76, 201, 255, 0.75);
    position: relative;
    box-shadow:
        0 0 10px rgba(17, 61, 85, 0.4),
        0 0 20px 2px rgba(45, 77, 96, 0.61),
        0 0 1px 1px #405765;

    &.is-summary {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

.dice-canvas-section {
    border-right: 1px solid rgba(76, 201, 255, 0.3);
    background: rgba(0, 0, 0, 0.4);
    .pixi-wrapper {
        width: 100%;
        height: 100%;
    }
}

.boosts-section,
.final-stats-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .section-header {
        font-size: 1.5rem;
        color: #4cc9ff;
        margin-bottom: 40px;
        text-transform: uppercase;
    }
}
.final-row {
    margin-bottom: 20px;

    .stat-name {
        font-size: 1.8rem;
        color: $color-gold;
        margin-bottom: 10px;
    }
}

.boost-row {
    margin-bottom: 40px;
    text-align: center;

    .stat-name {
        font-size: 1.8rem;
        color: #888;
    }
    .stat-value {
        font-size: 2rem;
        font-weight: 900;
        color: transparent;
    }
    &.has-value .stat-value {
        color: $color-gold;
        text-shadow: 0 0 10px rgba(255, 183, 0, 0.5);
    }
}

.final-stats-section {
    animation: slideIn 0.6s ease-out forwards;
    .gold-plate {
        border: 2px solid $color-gold;
        background: rgba(255, 183, 0, 0.1);
        padding: 10px 30px;
        border-radius: 12px;
        min-width: 220px;
        display: flex;
        align-items: baseline;
        justify-content: center;
        box-shadow: 0 0 20px rgba(255, 183, 0, 0.2);

        .total-value {
            font-size: 2.6rem;
            font-weight: 900;
            color: $color-gold;
        }
        .bonus-hint {
            font-size: 1.1rem;
            color: $color-gold;
            opacity: 0.7;
            margin-left: 10px;
        }
    }
}

.player-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    :deep(.fighter-card) {
        height: 100% !important;
        justify-content: space-between;

        .fighter-card__avatar-wrapper {
            aspect-ratio: auto !important;
            height: auto !important;
            max-height: 500px;
            order: 3;
        }

        .fighter-card__img {
            max-height: 100%;
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

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>