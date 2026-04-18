<template>
    <div class="battle-screen">
        <div class="arena" v-if="store.player && store.enemy">
            <Player :player="store.player" :is-enemy="false" />

            <div class="center-col">
                <div class="vs-sign">VS</div>
            </div>

            <Player :player="store.enemy" :is-enemy="true" />
        </div>

        <div v-if="store.currentState === 'GET_BOSS_PROMPT'" class="overlay">
            <div class="popup">
                <h2>Победа! Коэф 1.5 получен 🏆</h2>
                <p>Хотите рискнуть и сразиться с <b>Синим Ежедневником</b> за x5?</p>
                <div class="actions">
                    <button @click="store.startBossBattle" class="btn-boss">ИДЕМ НА БОССА!</button>
                    <button @click="store.finalizeGame(true)" class="btn-exit">Забрать {{ Math.floor(store.betAmount * 1.5) }}</button>
                </div>
            </div>
        </div>

        <div v-if="['FINISH_WIN', 'FINISH_LOSE'].includes(store.currentState)" class="overlay">
            <div class="popup">
                <h2 v-if="store.currentState === 'FINISH_WIN'">ТРИУМФ! 🏆</h2>
                <h2 v-else>ПОТРАЧЕНО... 💀</h2>
                <p>{{ store.currentState === 'FINISH_WIN' ? 'Вы легенда этой канцелярии!' : 'Попробуйте в другой раз.' }}</p>
                <button @click="store.resetAfterBattle" class="btn-exit">В МЕНЮ</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useBattleStore } from '@/store/BattleStore.ts';
import Player from '@/components/battle/Player.vue';

const store = useBattleStore();

onMounted(async () => {
    // Если мы попали сюда и бой готов — запускаем
    if (store.currentState.includes('BATTLE')) {
        await store.runAutoBattle();
    }
});
</script>

<style scoped lang="scss">
.battle-screen {
    height: 60vh;
    background: radial-gradient(circle, #1a1a2e 0%, #0f0f1a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.arena {
    display: flex;
    align-items: center;
    gap: 40px;
}

.center-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 300px;
}

.vs-sign {
    font-size: 64px;
    font-weight: 900;
    font-style: italic;
    color: #ffd700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.battle-log {
    width: 100%;
    height: 200px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid #4169E1;
    border-radius: 10px;
    padding: 10px;
    overflow-y: auto;
    font-family: 'Courier New', Courier, monospace;
    font-size: 13px;
    display: flex;
    flex-direction: column;
}

.log-entry {
    color: #aaa;
    margin-bottom: 4px;
    &.first { color: #00d2ff; font-weight: bold; }
}

/* Стили попапов из твоего файла оставляем без изменений,
   только проверь класс .btn-boss и .btn-exit */
.overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
}

.popup {
    background: #222;
    padding: 30px;
    border-radius: 20px;
    border: 2px solid #4169E1;
    text-align: center;
    max-width: 400px;

    button {
        margin: 10px;
        padding: 12px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        border: none;
    }
}
.btn-boss { background: #ffd700; color: #000; }
.btn-exit { background: #4169E1; color: #fff; }
</style>