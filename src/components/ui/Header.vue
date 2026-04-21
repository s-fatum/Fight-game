<template>
	<header class="header">
		<div class="container">
            <div class="user-info" v-if="account">
                <span class="user-name">Игрок: {{ account.name }}</span>

                <span class="user-balance">Баланс: {{ balance }} 🪙</span>
            </div>
		</div>
	</header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useUserStore } from '@/store/UserStore.ts';

export default defineComponent({
    computed: {
        ...mapState(useUserStore, ['account', 'balance']),
    }
});
</script>

<style lang="scss" scoped>
.header {
  padding: 38px 43px;
  background: #1E90FF;

  &__link {
	&:hover {
	  text-decoration: underline;
	}
  }
}

.header-dropdown {
  display: none;
}

.header-nav-list {
  display: flex;

  &__item {
	font-size: 25px;

	&:not(:last-child) {
	  margin-right: 75px;
	}
  }
}
</style>
