<template>
    <div class="app">
        <Header />
        <main class="main">
            <div class="container">
                <MainPage v-if="currentScreen === 'main'" />
                <BattlePage v-else-if="currentScreen === 'battle'" />
            </div>
        </main>
        <Footer />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useBattleStore } from '@/store/battle';
import MainPage from '@/views/MainPage.vue';
import BattlePage from '@/views/BattlePage.vue';
import Header from '@/components/inc/Header.vue';
import Footer from '@/components/inc/Footer.vue';

export default defineComponent({
    components: { MainPage, BattlePage , Header, Footer},
    computed: {
        ...mapState(useBattleStore, ['currentScreen'])
    }
});
</script>