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