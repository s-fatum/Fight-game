import type { IUserAccount } from '@/types';

export const UserService = {
    async fetchUserData(): Promise<IUserAccount> {
        return {
            uid: 'shhj222-211',
            name: 'User1',
            lang: 'en',
            balance: 1000,
        };
    },
};