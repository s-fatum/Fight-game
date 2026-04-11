<template>
    <div class="player" v-if="player">
        <div class="player-card">
            <div class="health-bar-container">
                <div ref="healthFill" class="health-bar__fill"></div>
                <div class="health-bar__label">
                    {{ Math.round(player.playerHealth.currentHealth) }} / {{ player.playerHealth.maxHealth }}
                </div>
            </div>

            <p class="player-card__name">{{ player.characterInfo.characterName }}</p>

            <div class="player-card__pic">
                <img :src="player.characterInfo.characterImg" :alt="player.characterInfo.characterName">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import gsap from 'gsap';
import PlayerCore from "@/game/player/PlayerCore";

export default defineComponent({
    name: 'Player',
    props: {
        player: {
            type: Object as () => PlayerCore | null,
            required: true
        }
    },
    watch: {
        // Следим за всем объектом игрока
        player: {
            handler(newVal) {
                if (newVal?.playerHealth) {
                    this.$nextTick(() => {
                        this.animateHealthBar(newVal.playerHealth.currentHealth);
                    });
                }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        animateHealthBar(targetHealth: number) {
            const fillEl = this.$refs.healthFill as HTMLElement;
            if (!this.player || !fillEl) return;

            const max = this.player.playerHealth.maxHealth;
            const percent = (targetHealth / max) * 100;
            const targetColor = this.player.healthColor;

            gsap.to(fillEl, {
                width: `${percent}%`,
                backgroundColor: targetColor,
                duration: 0.8,
                ease: "power2.out"
            });
        }
    }
});
</script>

<style lang="scss" scoped>
.player-card {
    border-radius: 8px;
    background-color: #fff;
    border: 1px solid #000;
    padding: 12px 36px;
    max-width: 312px;
    color: #000;

    .health-bar-container {
        position: relative;
        width: 100%;
        height: 25px;
        background-color: #dedede;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 36px;
        border: 1px solid #777;
    }

    .health-bar__fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0%;
        background-color: #58964d;
        background-image: linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.2) 0%,
                rgba(0, 0, 0, 0.05) 100%
        );
    }

    .health-bar__label {
        position: absolute;
        width: 100%;
        text-align: center;
        line-height: 25px;
        color: #000;
        font-weight: bold;
        font-size: 14px;
        z-index: 1;
    }

    &__pic {
        border-radius: 8px;
        width: 240px;
        height: 240px;
        margin-bottom: 25px;
        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
    }

    &__name {
        font-size: 20px;
        text-align: center;
        margin-bottom: 15px;
    }
}

.winner-label {
    text-align: center;
    color: #ffd700;
    font-weight: bold;
    margin-top: 10px;
}
</style>