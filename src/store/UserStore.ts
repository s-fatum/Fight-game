import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IUserAccount } from '@/types';
import { UserService } from '@/api/user.service.ts';

export const useUserStore = defineStore('user', () => {
    const account = ref<IUserAccount | null>(null);
    const balance = ref(0);

    const loadUserData = async () => {
        const data = await UserService.fetchUserData();
        account.value = data;
        balance.value = data.balance;
    };

    return { account, balance, loadUserData };
});