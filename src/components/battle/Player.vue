<template>
    <div class="player" v-if="player">
        <div class="player-card">
            <ProgressBar
                :value="healthPercentage"
                class="player-card__hp"
                :style="progressBarStyle"
            >
                {{ player.playerHealth.currentHealth }} / {{ player.playerHealth.maxHealth }}
            </ProgressBar>

            <p class="player-card__name">{{ player.characterInfo.characterName }}</p>

            <div class="player-card__pic">
                <img :src="player.characterInfo.characterImg" :alt="player.characterInfo.characterName">
            </div>

            <div v-if="player.isWinner" class="winner-label">🏆 ПОБЕДИТЕЛЬ</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProgressBar from 'primevue/progressbar';
import PlayerCore from "@/game/player/PlayerCore";

export default defineComponent({
    name: 'Player',
    components: { ProgressBar },
    props: {
        player: {
            type: Object as () => PlayerCore | null,
            required: true
        }
    },
    computed: {
        healthPercentage(): number {
            if (!this.player) return 0;
            return (this.player.playerHealth.currentHealth / this.player.playerHealth.maxHealth) * 100;
        },
        // Это свойство заставляет полоску перекрашиваться
        progressBarStyle(): Record<string, string> {
            if (!this.player) return {};
            return {
                '--hp-color': this.player.healthColor // Берем цвет из геттера класса
            };
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

    &__hp {
        margin-bottom: 36px;
        height: 25px;
        background: #dedede;
        border-radius: 8px;
        overflow: hidden;

        // Глубокий селектор для перекраски внутренней части PrimeVue
        :deep(.p-progressbar-value) {
            background-color: var(--hp-color) !important; // Применяем нашу переменную
            transition: width 0.3s ease, background-color 0.3s ease;
        }

        :deep(.p-progressbar-label) {
            color: #000;
            font-weight: bold;
        }
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