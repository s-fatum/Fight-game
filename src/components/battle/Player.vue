<template>
    <div class="player" v-if="player">
        <div class="player-card">
            <ProgressBar
                :value="(player.playerHealth.currentHealth / player.playerHealth.maxHealth) * 100"
                class="player-card__hp"
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

<script setup lang="ts">
import ProgressBar from 'primevue/progressbar';
import PlayerCore from "@/game/player/PlayerCore";

defineProps<{
    player: PlayerCore | null
}>();
</script>

<style lang="scss" scoped>
.player-card {
    border-radius: 8px;
    background-color: #fff;
    border: 1px solid #000;
    padding: 12px 36px;
    max-width: 312px;

    &__hp {
        margin-bottom: 20px;
        :deep(.p-progressbar-value) {
            background-color: v-bind("player?.playerHealth.healthColor");
            transition: width 0.3s ease, background-color 0.3s ease;
        }
    }

    &__pic {
        width: 240px;
        height: 240px;
        img { width: 100%; height: 100%; object-fit: contain; }
    }

    &__name { font-size: 20px; text-align: center; margin-bottom: 15px; }
}
.winner-label { text-align: center; color: #ffd700; font-weight: bold; margin-top: 10px; }
</style>