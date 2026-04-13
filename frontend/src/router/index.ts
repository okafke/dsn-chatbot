import {createRouter, createWebHistory} from 'vue-router'
import {isAuthenticated} from '../services/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: {guest: true},
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue'),
            meta: {guest: true},
        },
        {
            path: '/',
            name: 'games',
            component: () => import('../views/GameSelectionView.vue'),
            meta: {requiresAuth: true},
        },
        {
            path: '/game/:gameId',
            name: 'game',
            component: () => import('../views/GameChatView.vue'),
            meta: {requiresAuth: true},
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('../views/ChatView.vue'),
            meta: {requiresAuth: true},
        },
    ],
})

// Navigation guard
router.beforeEach((to, _from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next({name: 'login'})
    } else if (to.meta.guest && isAuthenticated()) {
        next({name: 'games'})
    } else {
        next()
    }
})

export default router
