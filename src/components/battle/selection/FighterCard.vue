<template>
    <div
        :class="['fighter-card', { 'selected': isSelected }]"
        @click="$emit('select', fighter.id)"
    >
        <div class="fighter-card__avatar-wrapper">
            <img :src="'/src/assets/characters/avatars/' + fighter.avatar" class="fighter-card__img">
        </div>

        <p class="fighter-card__name">{{ fighter.name }}</p>

        <div class="fighter-stats">
            <div class="stat-row" v-for="stat in stats" :key="stat.label">
                <div class="stat-info">
                    <span class="stat-label">{{ stat.label }}</span>
                    <span class="stat-val">{{ stat.value }}</span>
                </div>
                <div class="stat-bar-bg">
                    <div :class="['stat-bar-fill', stat.class]" :style="{ width: stat.width }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    name: 'FighterCard',
    props: {
        fighter: { type: Object, required: true },
        isSelected: { type: Boolean, default: false }
    },
    emits: ['select'],
    setup(props) {
        const stats = computed(() => [
            { label: 'HP', value: props.fighter.maxHealth, width: '100%', class: 'hp' },
            { label: 'ATK', value: props.fighter.attack, width: (props.fighter.attack * 2) + '%', class: 'atk' },
            { label: 'CRIT', value: (props.fighter.critChance || 5) + '%', width: (props.fighter.critChance || 5) + '%', class: 'crit' }
        ]);
        return { stats };
    }
});
</script>

<style scoped lang="scss">
.fighter-card {
    /* Ширина чуть больше картинки (картинка ~180px + отступы) */
    flex: 0 0 220px;
    background: rgba(20, 20, 20, 0.85);
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.05);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);

    &.selected {
        border-color: #ea9937;
        box-shadow: 0 0 20px rgba(234, 153, 55, 0.3);
        background: rgba(35, 35, 35, 0.95);
        transform: translateY(-8px);
    }

    &__avatar-wrapper {
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        img { max-width: 100%; max-height: 100%; object-fit: contain; }
    }

    &__name {
        text-align: center;
        font-family: 'Oswald', sans-serif;
        font-size: 18px;
        color: #fff;
        margin-bottom: 12px;
        letter-spacing: 0.5px;
    }
}

.stat-row {
    margin-bottom: 10px;
    &:last-child { margin-bottom: 0; }
}

.stat-info {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    margin-bottom: 3px;
    font-weight: 700;
    color: rgba(255,255,255,0.6);
}

.stat-bar-bg {
    height: 4px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 2px;
    overflow: hidden;
}

.stat-bar-fill {
    height: 100%;
    transition: width 0.5s ease-out;

    /* Сочные цвета для статов */
    &.hp {
        background: #ff3e3e;
        box-shadow: 0 0 8px rgba(255, 62, 62, 0.5);
    }
    &.atk {
        background: #ff9f43;
        box-shadow: 0 0 8px rgba(255, 159, 67, 0.5);
    }
    &.crit {
        background: #00d2d3;
        box-shadow: 0 0 8px rgba(0, 210, 211, 0.5);
    }
}
</style>