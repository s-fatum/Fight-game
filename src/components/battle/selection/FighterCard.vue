<template>
    <div
        :class="['fighter-card', { 'selected': isSelected }]"
        @click="$emit('select', fighter.id)"
    >
        <div class="fighter-card__avatar-wrapper">
            <img :src="avatarUrl" :alt="fighter.name" class="fighter-card__img" />
        </div>
        <p class="fighter-card__name">{{ fighter.name }}</p>
        <div class="fighter-stats">
            <div class="stat-row" v-for="stat in animatedStats" :key="stat.label">
                <div class="stat-info">
                    <span class="stat-label">{{ stat.label }}</span>
                    <span class="stat-val">{{ Math.round(stat.displayValue) }}{{ stat.unit }}</span>
                </div>
                <div class="stat-bar-bg">
                    <div :class="['stat-bar-fill', stat.class]" :style="{ width: stat.width }">
                        <div class="bar-glow" :style="{ opacity: internalStats.glowOpacity }"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, watch } from 'vue';
import gsap from 'gsap';
import type { Fighter } from '@/types';

export default defineComponent({
    name: 'FighterCard',
    props: {
        fighter: { type: Object as () => Fighter, required: true },
        isSelected: { type: Boolean, default: false },
        isEnemy: { type: Boolean, default: false },   // если true – добавим суффикс _e
    },
    emits: ['select'],
    setup(props) {
        const avatarUrl = computed(() => {
            const suffix = props.isEnemy ? '_e' : '_h';
            // Путь к аватаркам: src/assets/characters/avatars/flash_h.jpg
            return new URL(`/src/assets/characters/avatars/${props.fighter.image}${suffix}.jpg`, import.meta.url).href;
        });

        const internalStats = reactive({
            hp: props.fighter.health,
            atk: props.fighter.attack,
            crit: props.fighter.crit,
            glowOpacity: 0,
        });

        const tweenStat = (key: keyof typeof internalStats, value: number) => {
            gsap.to(internalStats, { [key]: value, duration: 0.8, ease: "power2.out" });
            gsap.fromTo(internalStats, { glowOpacity: 1 }, { glowOpacity: 0, duration: 1, ease: "power1.inOut" });
        };

        watch(() => props.fighter.health, (v) => tweenStat('hp', v));
        watch(() => props.fighter.attack, (v) => tweenStat('atk', v));
        watch(() => props.fighter.crit, (v) => tweenStat('crit', v || 5));

        const animatedStats = computed(() => [
            {
                label: 'HP',
                displayValue: internalStats.hp,
                width: '100%',
                class: 'hp',
                unit: ''
            },
            {
                label: 'ATK',
                displayValue: internalStats.atk,
                width: Math.min(100, internalStats.atk * 0.8) + '%',
                class: 'atk',
                unit: ''
            },
            {
                label: 'CRIT',
                displayValue: internalStats.crit,
                width: Math.min(100, internalStats.crit) + '%',
                class: 'crit',
                unit: '%'
            }
        ]);

        return { avatarUrl, internalStats, animatedStats };
    }
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/_variables.scss" as *;

.fighter-card {
    flex: 1;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(0, 178, 255, 0.05);
    backdrop-filter: blur(5px) saturate(150%);
    border-radius: 12px;
    border: 2px solid rgba(76, 201, 255, 0.75);
    overflow: hidden;
    box-shadow: 0 0 10px rgba(49, 180, 255, 0.4), 0 0 10px 2px rgba(106, 195, 251, 0.61), 0 0 1px 1px #a1dcff;

    &.selected {
        border: 1px solid #ffb700 !important;
        box-shadow: 0 0 10px rgba(255, 183, 0, 0.4), 0 0 20px 2px rgba(255, 174, 0, 0.5), 0 0 1px 1px #ff9900, inset 0 0 12px rgba(255, 183, 0, 0.2);
        background: rgba(255, 183, 0, 0.05);
        transform: translateY(-5px);
    }

    &__avatar-wrapper {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        aspect-ratio: 1;
        overflow: hidden;
        position: relative;
        &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6));
        }
    }
    &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.5s ease;
    }
    &__name {
        text-align: left;
        font-size: 18px;
        color: #fff;
        margin-bottom: 20px;
    }
    &:hover &__img { transform: scale(1.1); }
    &.selected &__img { filter: brightness(1.2) contrast(1.1); }
}

.stat-row {
    margin-bottom: 8px;
    .stat-info {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: rgba(255,255,255,0.5);
        margin-bottom: 2px;
    }
}
.stat-bar-bg {
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
}
.stat-bar-fill {
    height: 100%;
    transition: width 0.3s ease-out;
    position: relative;
    .bar-glow {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 15px;
        background: #fff;
        filter: blur(8px);
        transition: opacity 0.1s ease;
    }
    &.hp { background: $color-hp; box-shadow: 0 0 10px rgba($color-hp, 0.5); .bar-glow { box-shadow: 0 0 15px #42ff78; } }
    &.atk { background: $color-atk; box-shadow: 0 0 10px rgba($color-atk, 0.5); .bar-glow { box-shadow: 0 0 15px #ffb342; } }
    &.crit { background: $color-crit; box-shadow: 0 0 10px rgba($color-crit, 0.5); .bar-glow { box-shadow: 0 0 15px #c442ff; } }
}
</style>