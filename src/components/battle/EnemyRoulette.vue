<template>
    <div class="enemy-roulette-overlay">
        <div class="roulette-content">
            <h3>Выбор противника...</h3>
            <div class="spinner">
                <div class="target-pointer"></div>
                <div class="spinner-track" :style="{ transform: `translateY(${offset}px)` }">
                    <div v-for="(item, idx) in roulettePool" :key="idx" class="spinner-item">
                        <img :src="'/src/assets/characters/avatars/' + item.avatar" class="spinner-img">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useBattleStore } from '@/store/BattleStore';

export default defineComponent({
    name: 'EnemyRoulette',
    props: {
        targetEnemy: { type: Object, required: true }
    },
    emits: ['finished'],
    setup(props, { emit }) {
        const store = useBattleStore();
        const offset = ref(0);
        const itemHeight = 200;
        const roulettePool = ref<any[]>([]);

        onMounted(async () => {
            const opponents = store.availableFighters.filter(f => f.id !== store.selectedFighterId);
            const repeats = 10;
            roulettePool.value = Array(repeats).fill(opponents).flat();

            const targetIdx = (repeats - 2) * opponents.length + opponents.findIndex(e => e.id === props.targetEnemy.id);

            // Небольшая задержка для инициации CSS перехода
            setTimeout(() => {
                offset.value = -(targetIdx * itemHeight);
            }, 50);

            // Время анимации + небольшая пауза перед скрытием
            setTimeout(() => {
                emit('finished');
            }, 4000);
        });

        return { offset, roulettePool };
    }
});
</script>

<style scoped lang="scss">
.enemy-roulette-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}
.spinner {
    width: 200px;
    height: 200px;
    overflow: hidden;
    border: 4px solid #ffd700;
    position: relative;
    background: #111;
}
.spinner-track {
    transition: transform 3.5s cubic-bezier(0.15, 0, 0.15, 1);
}
.spinner-item {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    img { width: 140px; height: 140px; }
}
.target-pointer {
    position: absolute;
    top: 50%; left: 0; width: 100%; height: 2px;
    background: #ffd700;
    z-index: 10;
    transform: translateY(-50%);
}
</style>