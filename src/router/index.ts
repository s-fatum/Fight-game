import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'main page',
        component: () => import('../views/Main.vue'),
    },
    {
        path: '/game',
        name: 'game',
        component: () => import('../views/Game.vue'),
    },
];

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;