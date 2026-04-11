<template>
	<header class="header">
		<div class="container">
			<nav class="header-nav">
				<ul class="header-nav-list">
				  <li class="header-nav-list__item"><a href="/" class="header__link">Main page</a></li>
				  <li class="header-nav-list__item"><a href="/" class="header__link">Game</a></li>
				  <li class="header-nav-list__item"><a href="/" class="header__link">Rules</a></li>
				  <li class="header-nav-list__item"><a href="/" class="header__link">Change language</a></li>
				</ul>
			  </nav>
		    <div class="header-dropdown">
			    <ul class="header-dropdown-list">
                    <li class="header-dropdown-list">English</li>
                </ul>
            </div>

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
import { useUserStore } from '@/store/user';

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
