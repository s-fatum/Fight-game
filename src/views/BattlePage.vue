<template>
    <div class="battle-screen">
        <div class="arena" v-if="store.player && store.enemy">
            <Player :player="store.player" />

            <div class="vs-sign">VS</div>

            <Player :player="store.enemy" />
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

<style lang="scss" scoped>
.arena {
    display: flex;
    justify-content: center;
    column-gap: 5%;
    margin-top: 50px;
}

.overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>