<template>
    <div class="battle-screen">
        <div class="arena" v-if="store.player && store.enemy">
            <Player :player="store.player" />
            <div class="vs-sign">VS</div>
            <Player :player="store.enemy" />
        </div>

        <div v-if="store.currentState === 'BATTLE_BOSS'" class="overlay">
            <div class="popup">
                <h2>Победа! Коэф 1.5 получен 🏆</h2>
                <p>Хотите сыграть суперигру с боссом <b>Синим Ежедневником</b> за x5?</p>
                <div class="actions">
                    <button @click="store.startBossBattle" class="btn-boss">ИДЕМ НА БОССА!</button>
                    <button @click="store.finalizeGame(true)" class="btn-exit">Забрать {{ store.betAmount * 1.5 }}</button>
                </div>
            </div>
        </div>

        <div v-if="store.currentState === 'FINISH'" class="overlay">
            <div class="popup">
                <h2>Конец игры</h2>
                <button @click="store.setScreen('main')">В меню</button>
            </div>
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