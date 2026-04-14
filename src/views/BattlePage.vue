<template>
    <div class="battle-screen">
        <div class="arena" v-if="store.player && store.enemy">
            <Player :player="store.player" />
            <div class="vs-sign">VS</div>
            <Player :player="store.enemy" />
        </div>

        <div v-if="store.currentState === 'GET_BOSS_PLAY'" class="overlay">
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

/* Оверлей на весь экран */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px); /* Размытие заднего фона */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

/* Контейнер попапа */
.popup {
    background: linear-gradient(145deg, #2a2a3a, #1e1e2e);
    border: 2px solid #4169E1;
    border-radius: 20px;
    padding: 40px;
    width: 400px;
    text-align: center;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    color: #fff;

    h2 {
        font-size: 28px;
        margin-bottom: 15px;
        color: #ffd700; /* Золотой для заголовков */
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    p {
        font-size: 18px;
        line-height: 1.6;
        margin-bottom: 25px;
        color: #ccc;
    }

    hr {
        border: 0;
        border-top: 1px solid #333;
        margin: 20px 0;
    }
}

.actions, .popup-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;

    button {
        padding: 15px;
        border-radius: 10px;
        border: none;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s, filter 0.2s;

        &:hover {
            transform: scale(1.02);
            filter: brightness(1.2);
        }
    }

    .btn-boss {
        background: #ff4500;
        color: white;
        box-shadow: 0 4px 15px rgba(255, 69, 0, 0.3);
    }

    .btn-collect, .btn-main {
        background: #4169E1;
        color: white;
    }

    .btn-exit {
        background: #333;
        color: #aaa;
        font-size: 14px;
    }
}
</style>