<script lang="ts" setup>
import {onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useGameStore} from '../stores/game'
import {useAuthStore} from '../stores/auth'
import {useChatStore} from '../stores/chat'
import AnimatedRobotPreview from '../components/AnimatedRobotPreview.vue'
import type {RobotMood} from '../types'

const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()
const chatStore = useChatStore()

// Map game IDs to the main mood used for the animated robot preview
const gameMoods: Record<string, RobotMood> = {
  sad_robot: 'sad',
  lazy_robot: 'rebellious',
}

onMounted(async () => {
  await gameStore.loadGames()
})

function selectGame(game: typeof gameStore.games[number]) {
  gameStore.selectGame(game)
  chatStore.newConversation()
  chatStore.setGameId(game.id)
  router.push({name: 'game', params: {gameId: game.id}})
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function goToChat() {
  chatStore.setGameId(null)
  chatStore.newConversation()
  router.push('/chat')
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
      <h1 class="text-lg font-semibold text-white">DSN Chatbot — Games</h1>
      <div class="flex items-center gap-4">
        <button
            class="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            @click="goToChat"
        >
          💬 Free Chat
        </button>
        <button
            class="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 flex flex-col items-center justify-center p-8">
      <h2 class="text-3xl font-bold text-white mb-2">Choose a Game</h2>
      <p class="text-gray-400 mb-10">Select a game to start playing</p>

      <!-- Loading -->
      <div v-if="gameStore.loading" class="text-gray-400">
        Loading games...
      </div>

      <!-- Error -->
      <div v-else-if="gameStore.error" class="text-red-400">
        {{ gameStore.error }}
      </div>

      <!-- Game cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        <button
            v-for="game in gameStore.games"
            :key="game.id"
            class="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500 hover:bg-gray-750 transition-all duration-200 text-left group cursor-pointer"
            @click="selectGame(game)"
        >
          <div class="flex justify-center mb-4">
            <div class="p-2 rounded-2xl bg-gray-700/40 border border-gray-600/40 shadow-md">
              <div class="rounded-xl overflow-hidden bg-gray-600/30 leading-[0] group-hover:scale-110 transition-transform duration-200">
                <AnimatedRobotPreview
                    v-if="gameMoods[game.id]"
                    :mood="gameMoods[game.id]"
                    size="w-24 h-24"
                />
                <div
                    v-else
                    class="w-24 h-24 flex items-center justify-center text-3xl"
                >
                  🎮
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {{ game.name }}
          </h3>
          <p class="text-sm text-gray-400">
            {{ game.description }}
          </p>
        </button>
      </div>
    </main>
  </div>
</template>
