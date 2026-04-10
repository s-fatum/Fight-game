<template>
    <div class="battle-screen">
        <div class="arena" v-if="store.player && store.enemy">
            <Player :player="store.player" />

            <div class="vs-sign">VS</div>

            <Player :player="store.enemy" />
        </div>

        <div class="battle-status" v-if="store.isProcessing">
            Идет раунд №{{ store.currentRoundIndex + 1 }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useBattleStore } from '@/store/battle';
import Player from '@/components/battle/Player.vue';

const store = useBattleStore();

onMounted(async () => {
    // Если мы попали сюда и бой готов — запускаем
    if (store.currentState.includes('BATTLE')) {
        await store.runAutoBattle();
    }
});
</script>