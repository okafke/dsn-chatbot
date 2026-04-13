import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {User} from '../types'
import * as authService from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isLoggedIn = ref(authService.isAuthenticated())
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function login(username: string, password: string) {
        loading.value = true
        error.value = null
        try {
            await authService.login(username, password)
            isLoggedIn.value = true
            await fetchUser()
        } catch (e: any) {
            error.value = e.response?.data?.detail || 'Login failed'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function register(email: string, username: string, password: string) {
        loading.value = true
        error.value = null
        try {
            await authService.register(email, username, password)
            isLoggedIn.value = true
            await fetchUser()
        } catch (e: any) {
            error.value = e.response?.data?.detail || 'Registration failed'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function fetchUser() {
        try {
            user.value = await authService.getMe()
        } catch {
            user.value = null
            isLoggedIn.value = false
        }
    }

    function logout() {
        authService.logout()
        user.value = null
        isLoggedIn.value = false
    }

    async function initialize() {
        if (isLoggedIn.value) {
            await fetchUser()
        }
    }

    return {
        user,
        isLoggedIn,
        loading,
        error,
        login,
        register,
        logout,
        fetchUser,
        initialize,
    }
})
