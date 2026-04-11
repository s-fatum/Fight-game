<template>
    <div id="app">
        <MainPage v-if="currentScreen === 'main'" />
        <BattlePage v-else-if="currentScreen === 'battle'" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useBattleStore } from '@/store/battle';
import MainPage from '@/views/MainPage.vue';
import BattlePage from '@/views/BattlePage.vue';

export default defineComponent({
    components: { MainPage, BattlePage },
    computed: {
        ...mapState(useBattleStore, ['currentScreen'])
    }
});
</script>