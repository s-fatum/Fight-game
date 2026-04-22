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
});
</script>

<style>
:root {
    overflow: hidden;
}

html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    overflow: hidden !important;
    position: fixed;
}

.app, main, .main, .container, .page-background {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    display: block !important;
}

canvas {
    width: 100vw !important;
    height: 100vh !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
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
</style>
