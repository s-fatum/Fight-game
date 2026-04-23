<template>
    <header class="game-header">
        <div class="user-info">
            <div class="avatar-glow">
                <span class="user-name">👤 {{ account || 'Юзер' }}</span>
            </div>
        </div>

        <div class="stats-container">
            <div class="balance-badge neon-border-blue">
                <span class="coin-icon">🪙</span>
                <span class="amount">{{ balance.toLocaleString() }}</span>
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useUserStore } from '@/store/UserStore';

export default defineComponent({
    name: 'Header',
    computed: {
        ...mapState(useUserStore, ['account', 'balance']),
    }
});
</script>

<style scoped lang="scss">
.game-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;

    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;

    background: rgba(10, 15, 20, 0.6);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);

    box-sizing: border-box;
}

.user-name {
    font-weight: 700;
    color: #00ffff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 0.9rem;
}

.balance-badge {
    background: rgba(0, 0, 0, 0.6);
    padding: 6px 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    transition: all 0.3s ease;

    &.neon-border-blue {
        border: 1px solid #00ffff;
        box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.2),
        0 0 15px rgba(0, 255, 255, 0.3);
    }

    .amount {
        color: #fff;
        font-weight: 800;
        font-size: 1.3rem;
        font-family: 'Courier New', Courier, monospace;
        text-shadow: 0 0 5px #fff;
    }

    .coin-icon {
        filter: drop-shadow(0 0 5px #ffd700);
    }
}

// Эффект "мерцания" для неона
@keyframes neon-pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
}

.user-info {
    animation: neon-pulse 3s infinite;
}
</style>