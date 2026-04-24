<template>
    <div class="app">
        <transition name="fade">
            <Header v-if="isHeaderVisible" />
        </transition>
        <main class="main">
            <div class="container">
                <MainPage
                    v-if="currentScreen === 'main'"
                    @toggle-header="setHeaderVisibility"
                />
                <BattlePage v-if="currentScreen === 'battle'" />
            </div>
        </main>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapActions, mapState } from 'pinia';
import { useBattleStore } from '@/store/BattleStore.ts';
import { useUserStore } from '@/store/UserStore.ts';
import MainPage from '@/views/MainPage.vue';
import BattlePage from '@/views/BattlePage.vue';
import Header from '@/components/ui/Header.vue';

export default defineComponent({
    setup() {
        const isHeaderVisible = ref(false);

        const setHeaderVisibility = (visible: boolean) => {
            isHeaderVisible.value = visible;
        };

        return { isHeaderVisible, setHeaderVisibility };
    },
    components: { MainPage, BattlePage, Header },
    computed: {
        ...mapState(useBattleStore, ['currentScreen']),
    },
    methods: {
        ...mapActions(useUserStore, ['loadUserData']),
    },
    mounted(): any {
        this.loadUserData();
    },
});
</script>

<style lang="scss">
:root {
    overflow: hidden;
}

html,
body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    overflow: hidden !important;
    position: fixed;
}

.app,
main,
.main,
.container,
.page-background {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    display: block !important;
}

/* не покупайся на Unused) */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Добавить в App.vue или глобальные стили */
.section-title, .stat-label, .fighter-card__name {
    font-family: 'Oswald', sans-serif; /* Популярный игровой шрифт */
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Эффект "золотого текста" для сумм */
.gold-text {
    color: #ffd700;
    background: linear-gradient(180deg, #fff9c4 0%, #fbc02d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}
</style>
