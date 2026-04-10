import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        balance: 1000,
        username: 'Player 1'
    }),
    actions: {
        updateBalance(amount: number) {
            this.balance += amount;
        }
    }
});