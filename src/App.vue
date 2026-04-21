<template>
    <div class="app">
        <Header />
        <main class="main">
            <div class="container">
                <MainPage v-if="currentScreen === 'main'" />
                <BattlePage v-if="currentScreen === 'battle'" />
            </div>
        </main>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import { useBattleStore } from '@/store/BattleStore.ts';
import { useUserStore } from '@/store/UserStore.ts';
import MainPage from '@/views/MainPage.vue';
import BattlePage from '@/views/BattlePage.vue';
import Header from '@/components/ui/Header.vue';

export default defineComponent({
    components: { MainPage, BattlePage, Header },
    computed: {
        ...mapState(useBattleStore, ['currentScreen']),
    },
    methods: {
        ...mapActions(useUserStore, ['loadUserData']),
    },

    mounted() {
        this.loadUserData();
    },
});
</script>

<style lang="scss">
html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden; /* Глобально убираем скролл, чтобы приложение не "гуляло" */
    background: #0a0f14; /* Цвет-заглушка в тон фона */
}

.app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    position: relative;
}

.main {
    flex: 1;
    position: relative;
    overflow: hidden; /* Контент страницы сам будет управлять своим скроллом, если надо */
}

.container {
    height: 100%;
    width: 100%;
}
</style>
