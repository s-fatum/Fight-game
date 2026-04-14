<template>
    <div class="player" v-if="player">
        <div class="player-card">
            <div class="health-bar-container">
                <div ref="healthFill" class="health-bar__fill"></div>
                <div class="health-bar__label">
                    {{ Math.round(player.currentHealth) }} / {{ player.maxHealth }}
                </div>
            </div>

            <p class="player-card__name">{{ player.name }}</p>

            <div class="player-stats">
                <div class="stat-item" title="Сила атаки">
                    <span class="stat-icon">⚔️</span>
                    <span class="stat-value">{{ player.attack }}</span>
                </div>
                <div class="stat-item" title="Шанс крита">
                    <span class="stat-icon">✨</span>
                    <span class="stat-value">{{ player.crit }}%</span>
                </div>
            </div>

            <div class="player-card__pic">
                <img :src="'/src/assets/characters/avatars/' + player.avatar" :alt="player.name">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import gsap from 'gsap';
import type { Fighter } from '@/types';

export default defineComponent({
    name: 'Player',
    props: {
        player: {
            type: Object as () => Fighter | null,
            required: true
        }
    },
    computed: {
        // Вычисляем цвет здесь, а не в сторе
        healthColor(): string {
            if (!this.player) return '#58964d';
            const percent = (this.player.currentHealth / this.player.maxHealth) * 100;
            if (percent > 50) return '#58964d'; // Зеленый
            if (percent > 25) return '#f8b30e'; // Оранжевый
            return '#d20505'; // Красный
        }
    },
    watch: {
        // Анимация срабатывает при изменении текущего здоровья
        'player.currentHealth': {
            handler(newVal) {
                this.$nextTick(() => {
                    this.animateHealthBar(newVal);
                });
            },
            immediate: true
        }
    },
    methods: {
        animateHealthBar(targetHealth: number) {
            const fillEl = this.$refs.healthFill as HTMLElement;
            if (!this.player || !fillEl) return;

            const percent = (targetHealth / this.player.maxHealth) * 100;

            gsap.to(fillEl, {
                width: `${percent}%`,
                backgroundColor: this.healthColor,
                duration: 0.6,
                ease: "power2.out"
            });
        }
    }
});
</script>

<style lang="scss" scoped>
.player-card {
    border-radius: 12px;
    background-color: #fff;
    border: 2px solid #000;
    padding: 20px;
    width: 280px;
    color: #000;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);

    .health-bar-container {
        position: relative;
        width: 100%;
        height: 25px;
        background-color: #eee;
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 15px;
        border: 1px solid #333;
    }

    .health-bar__fill {
        position: absolute;
        height: 100%;
        width: 0%;
        background-image: linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(0, 0, 0, 0.1) 100%
        );
    }

    .health-bar__label {
        position: absolute;
        width: 100%;
        text-align: center;
        line-height: 25px;
        font-weight: bold;
        font-size: 13px;
        z-index: 2;
    }

    &__name {
        font-size: 22px;
        font-weight: 800;
        text-align: center;
        margin-bottom: 8px;
        text-transform: uppercase;
    }

    /* Стили для новых статов */
    .player-stats {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 15px;
        background: #f5f5f5;
        padding: 8px;
        border-radius: 8px;

        .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;

            .stat-icon {
                font-size: 18px;
            }

            .stat-value {
                font-weight: bold;
                font-size: 16px;
            }
        }
    }

    &__pic {
        width: 100%;
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
    }
}
</style>