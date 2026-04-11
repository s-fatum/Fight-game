import type { IUserAccount } from '@/types';

export const UserService = {
    async fetchFighters(): Promise<IUserAccount> {

        return {
            uid: 'shhj222-211',
            name: 'User1',
            lang: 'en',
            balance: 1000,
        };
    },
};