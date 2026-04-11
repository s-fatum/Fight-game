import { defineStore } from 'pinia';
import { UserService } from "@/api/user.service";
import type { IUserAccount } from '@/types';

export const useUserStore = defineStore('user', {
    state: () => ({
        account: null as IUserAccount | null,
        balance: 0,
    }),
    actions: {
        async loadUserData() {
            const data = await UserService.fetchUserData();
            this.account = data;
            this.balance = data.balance;
        },
        // Метод для изменения баланса
        spendMoney(amount: number): boolean {
            if (this.balance >= amount) {
                this.balance -= amount;
                return true;
            }
            return false;
        }
    }
});