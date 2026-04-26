<template>
    <div
        :class="['fighter-card', { 'selected': isSelected }]"
        @click="$emit('select', fighter.id)"
    >
        <div class="fighter-card__avatar-wrapper">
            <img
                :src="'/src/assets/characters/avatars/' + fighter.avatar"
                :alt="fighter.name"
                class="fighter-card__img"
            >
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
                        <div
                            class="bar-glow"
                            :style="{ opacity: internalStats.glowOpacity }"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, watch } from 'vue';
import gsap from 'gsap';

export default defineComponent({
    name: 'FighterCard',
    props: {
        fighter: { type: Object, required: true },
        isSelected: { type: Boolean, default: false }
    },
    emits: ['select'],
    setup(props) {
        const internalStats = reactive({
            hp: props.fighter.maxHealth,
            atk: props.fighter.attack,
            crit: props.fighter.critChance || 5,
            glowOpacity: 0
        });

        const tweenStat = (key: keyof typeof internalStats, value: number) => {
            // Анимация самого стата
            gsap.to(internalStats, {
                [key]: value,
                duration: 0.8,
                ease: "power2.out"
            });

            // Вспышка свечения: быстро включаем и плавно выключаем
            gsap.fromTo(internalStats,
                { glowOpacity: 1 }, // Пик яркости в начале движения
                {
                    glowOpacity: 0,
                    duration: 1,
                    ease: "power1.inOut"
                }
            );
        };

        // Следим за изменениями в сторе
        watch(() => props.fighter.maxHealth, (v) => tweenStat('hp', v));
        watch(() => props.fighter.attack, (v) => tweenStat('atk', v));
        watch(() => props.fighter.crit, (v) => tweenStat('crit', v || 5));

        const animatedStats = computed(() => [
            {
                label: 'HP',
                displayValue: internalStats.hp,
                width: '100%',
                class: 'hp',
                glow: internalStats.glowOpacity,
                unit: ''
            },
            {
                label: 'ATK',
                displayValue: internalStats.atk,
                width: Math.min(100, internalStats.atk * 0.8) + '%',
                class: 'atk',
                glow: internalStats.glowOpacity,
                unit: ''
            },
            {
                label: 'CRIT',
                displayValue: internalStats.crit,
                width: Math.min(100, internalStats.crit) + '%',
                class: 'crit',
                glow: internalStats.glowOpacity,
                unit: '%'
            }
        ]);

        return {
            internalStats,
            animatedStats
        };
    }
});
</script>

<style scoped lang="scss">
.fighter-card {
    flex: 1;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    background: rgba(0, 178, 255, 0.05);
    backdrop-filter: blur(5px) saturate(150%);
    -webkit-backdrop-filter: blur(2px);
    border-radius: 12px;
    border: 2px solid rgba(76, 201, 255, 0.75);
    position: relative;
    overflow: hidden;
    box-shadow:
        0 0 10px rgba(49, 180, 255, 0.4),
        0 0 10px 2px rgba(106, 195, 251, 0.61),
        0 0 1px 1px #a1dcff;

    &.selected {
        border: 1px solid #ffb700 !important;

        /* Твой набор теней + внутренний блик для объема */
        box-shadow:
            0 0 10px rgba(255, 183, 0, 0.4),      /* Мягкое внешнее облако */
            0 0 20px 2px rgba(255, 174, 0, 0.5),  /* Интенсивное свечение */
            0 0 1px 1px #ff9900,                  /* Контурная резкость */
            inset 0 0 12px rgba(255, 183, 0, 0.2); /* Внутренний свет (эффект грани) */

        /* Фон карточки при выделении */
        background: rgba(255, 183, 0, 0.05);

        /* Плавный переход */
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(-5px);
    }

    &__avatar-wrapper {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__name {
        text-align: left; /* Как на макете */
        font-size: 18px;
        color: #fff;
        margin-bottom: 20px;
    }
}

.fighter-card__avatar-wrapper {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 8px;
    position: relative;
    background: #1a1a1a;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6));
    }
}

.fighter-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.5s ease;
}

.fighter-card:hover .fighter-card__img {
    transform: scale(1.1);
}

.fighter-card.selected .fighter-card__img {
    filter: brightness(1.2) contrast(1.1);
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
    &.hp { background: #4caf50; box-shadow: 0 0 10px #4caf50; }
    &.atk { background: #ff9800; box-shadow: 0 0 10px #ff9800; }
    &.crit { background: #03a9f4; box-shadow: 0 0 10px #03a9f4; }
}

.stat-bar-fill {
    position: relative;
    height: 100%;

    .bar-glow {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 15px;
        background: #fff;
        filter: blur(8px);
        pointer-events: none;
        transition: opacity 0.1s ease;
    }
}

.hp .bar-glow { box-shadow: 0 0 15px #42ff78; }
.atk .bar-glow { box-shadow: 0 0 15px #ffb342; }
.crit .bar-glow { box-shadow: 0 0 15px #c442ff; }
</style>