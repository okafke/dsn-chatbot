<script lang="ts" setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '../stores/auth'
import {useI18n} from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const {t} = useI18n()

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref<string | null>(null)

async function handleRegister() {
  localError.value = null

  if (password.value !== confirmPassword.value) {
    localError.value = t('auth.passwordsNoMatch')
    return
  }

  if (password.value.length < 8) {
    localError.value = t('auth.passwordTooShort')
    return
  }

  try {
    await authStore.register(email.value, username.value, password.value)
    router.push('/')
  } catch {
    // Error is handled in the store
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl">
      <div class="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>

      <h1 class="text-3xl font-bold text-white text-center mb-8">{{ t('auth.createAccount') }}</h1>

      <div
          v-if="authStore.error || localError"
          class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm"
      >
        {{ localError || authStore.error }}
      </div>

      <form class="space-y-5" @submit.prevent="handleRegister">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1" for="email">{{ t('auth.email') }}</label>
          <input
              id="email"
              v-model="email"
              autocomplete="email"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="t('auth.emailPlaceholder')"
              required
              type="email"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1" for="username">{{ t('auth.username') }}</label>
          <input
              id="username"
              v-model="username"
              autocomplete="username"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minlength="3"
              :placeholder="t('auth.chooseUsername')"
              required
              type="text"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1" for="password">{{ t('auth.password') }}</label>
          <input
              id="password"
              v-model="password"
              autocomplete="new-password"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minlength="8"
              :placeholder="t('auth.passwordMinLength')"
              required
              type="password"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1" for="confirmPassword">{{ t('auth.confirmPassword') }}</label>
          <input
              id="confirmPassword"
              v-model="confirmPassword"
              autocomplete="new-password"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="t('auth.repeatPassword')"
              required
              type="password"
          />
        </div>

        <button
            :disabled="authStore.loading"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            type="submit"
        >
          {{ authStore.loading ? t('auth.creatingAccount') : t('auth.createAccount') }}
        </button>
      </form>

      <p class="mt-6 text-center text-gray-400 text-sm">
        {{ t('auth.hasAccount') }}
        <router-link class="text-blue-400 hover:text-blue-300 font-medium" to="/login">
          {{ t('auth.signInLink') }}
        </router-link>
      </p>
    </div>
  </div>
</template>
