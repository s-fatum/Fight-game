<template>
    <div class="enemy-chant-overlay">
        <div class="chant-container">
            <div class="loader-ring"></div>

            <div class="chant-content">
                <transition name="word-pop" mode="out-in">
                    <div
                        :key="currentWord"
                        class="chant-word"
                        :class="{ 'final-word': isLastWord }"
                    >
                        {{ currentWord }}
                    </div>
                </transition>
            </div>

            <div class="chant-sub-text">Определение противника...</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue'; // Добавлен computed

export default defineComponent({
    name: 'EnemyChant',
    emits: ['finished'],
    setup(_, { emit }) {
        const chants = [
            ["Эники", "беники", "ели", "вареники", "БУМ!"],
            ["Раз", "два", "три", "четыре", "пять", "я", "иду", "тебя", "искать", "БАЦ!"],
            ["Шел", "козел", "по", "лесу", "нашел", "принцессу", "ЕСТЬ!"],
            ["Раз", "два", "три", "четыре", "пять", "Я", "иду", "тебя", "искать!", "КТО?"],
            ["Катилось", "яблоко", "по", "огороду", "И", "упало", "в", "воду", "БУЛЬ!"]
        ];

        const selectedChant = chants[Math.floor(Math.random() * chants.length)]!;
        const currentWordIndex = ref(0);
        const chantSpeed = 600;

        // Исправлено: берем длину выбранной считалочки
        const isLastWord = computed(() => {
            return currentWordIndex.value === selectedChant.length - 1;
        });

        const currentWord = computed(() => {
            return selectedChant[currentWordIndex.value];
        });

        onMounted(() => {
            const interval = setInterval(() => {
                if (currentWordIndex.value < selectedChant.length - 1) {
                    currentWordIndex.value++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        emit('finished');
                    }, 800);
                }
            }, chantSpeed);
        });

        return {
            currentWord,
            isLastWord
        };
    }
});
</script>

<style scoped lang="scss">
.enemy-chant-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(10px);
}

.chant-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chant-word {
    font-family: 'Oswald', sans-serif;
    font-size: 3rem;
    color: #fff;
    text-transform: uppercase;
    text-align: center;
    min-height: 4.5rem;

    &.final-word {
        color: #ffb700;
        font-size: 5rem;
        /* Твои золотые тени */
        text-shadow:
            0 0 10px rgba(255, 183, 0, 0.4),
            0 0 20px 2px rgba(255, 174, 0, 0.5),
            0 0 1px 1px #ff9900;
    }
}

/* Анимация появления слова */
.word-pop-enter-active {
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.word-pop-enter-from {
    transform: scale(0.5);
    opacity: 0;
}

.chant-sub-text {
    margin-top: 2rem;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 2px;
    text-transform: uppercase;
    font-size: 0.8rem;
}

.loader-ring {
    position: absolute;
    width: 350px;
    height: 350px;
    border: 2px solid rgba(255, 183, 0, 0.1);
    border-top: 2px solid #ffb700;
    border-radius: 50%;
    animation: spin 2s linear infinite;
    margin-top: -75px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>