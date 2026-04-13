<script lang="ts" setup>
import {onMounted, onUnmounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useGameStore} from '../stores/game'
import {useChatStore} from '../stores/chat'
import MessageList from '../components/MessageList.vue'
import ChatInput from '../components/ChatInput.vue'
import RobotDisplay from '../components/RobotDisplay.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const chatStore = useChatStore()

onMounted(async () => {
  const gameId = route.params.gameId as string

  // If we don't have games loaded yet, load them
  if (gameStore.games.length === 0) {
    await gameStore.loadGames()
  }

  // Find and select the game
  const game = gameStore.games.find((g) => g.id === gameId)
  if (!game) {
    router.push({name: 'games'})
    return
  }

  gameStore.selectGame(game)
  chatStore.setGameId(gameId)

  // Only reset conversation if we don't already have one for this game
  if (!chatStore.conversationId) {
    chatStore.newConversation()
  }
})

onUnmounted(() => {
  gameStore.resetGame()
  chatStore.setGameId(null)
})

function handleSend(message: string) {
  chatStore.sendMessage(message)
}

function handleBack() {
  chatStore.newConversation()
  router.push({name: 'games'})
}

function handleNewGame() {
  gameStore.setMood('sad')
  chatStore.newConversation()
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-900">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
      <div class="flex items-center gap-3">
        <button
            class="text-gray-400 hover:text-white transition-colors"
            @click="handleBack"
        >
          ← Back
        </button>
        <h1 class="text-lg font-semibold text-white">
          {{ gameStore.currentGame?.name || 'Game' }}
        </h1>
      </div>

      <div class="flex items-center gap-4">
        <button
            class="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            @click="handleNewGame"
        >
          🔄 Restart
        </button>
      </div>
    </header>

    <!-- Error banner -->
    <div
        v-if="chatStore.error"
        class="mx-4 mt-2 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm flex items-center justify-between"
    >
      <span>{{ chatStore.error }}</span>
      <button class="text-red-400 hover:text-red-200 ml-4" @click="chatStore.error = null">✕</button>
    </div>

    <!-- Robot display -->
    <div class="py-4 shrink-0">
      <RobotDisplay :mood="gameStore.currentMood"/>
    </div>

    <!-- Messages -->
    <MessageList :messages="chatStore.messages"/>

    <!-- Input -->
    <ChatInput :disabled="chatStore.isStreaming" @send="handleSend"/>
  </div>
</template>
