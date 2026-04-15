<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useChatStore } from '../stores/chat'
import { useLanguageStore } from '../stores/language'
import { useI18n } from '../i18n'
import type { RobotMood } from '../types'
import MessageList from '../components/MessageList.vue'
import ChatInput from '../components/ChatInput.vue'
import RobotDisplay from '../components/RobotDisplay.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const chatStore = useChatStore()
const languageStore = useLanguageStore()
const { t } = useI18n()

onMounted(async () => {
    const gameId = route.params.gameId as string

    // If we don't have games loaded yet, load them
    if (gameStore.games.length === 0) {
        await gameStore.loadGames(languageStore.locale)
    }

    // Find and select the game (this also starts the animation controller)
    const game = gameStore.games.find((g) => g.id === gameId)
    if (!game) {
        router.push({ name: 'games' })
        return
    }

    gameStore.selectGame(game)
    chatStore.setGameId(gameId)

    // Only reset conversation if we don't already have one for this game
    if (!chatStore.conversationId) {
        chatStore.newConversation()
    }

    // Show the game's initial message as an assistant message (if any)
    if (game.initial_message && chatStore.messages.length === 0) {
        chatStore.addMessage({
            role: 'assistant',
            content: game.initial_message,
        })
    }
})

onUnmounted(() => {
    gameStore.stopAnimation()
    gameStore.resetGame()
    chatStore.setGameId(null)
})

// Drive the speaking action based on streaming OR typewriting state
// The robot should keep "speaking" as long as text is still being revealed
watch(
    () => chatStore.isStreaming || chatStore.isTypewriting,
    (active) => {
        if (active) {
            gameStore.startSpeaking()
        } else {
            gameStore.stopSpeaking()
        }
    },
)

function handleSend(message: string) {
    chatStore.sendMessage(message)
}

function handleBack() {
    chatStore.newConversation()
    router.push({ name: 'games' })
}

function handleNewGame() {
    const game = gameStore.currentGame
    if (game) {
        gameStore.setMood(game.initial_mood as RobotMood)
    }
    chatStore.newConversation()
    // Re-show the initial message if the game has one
    if (game?.initial_message) {
        chatStore.addMessage({
            role: 'assistant',
            content: game.initial_message,
        })
    }
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
                    {{ t('common.back') }}
                </button>
                <h1 class="text-lg font-semibold text-white">
                    {{ gameStore.currentGame?.name || t('gameChat.defaultTitle') }}
                </h1>
            </div>

            <div class="flex items-center gap-4">
                <LanguageSwitcher />
                <button
                    class="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                    @click="handleNewGame"
                >
                    {{ t('gameChat.restart') }}
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
            <RobotDisplay />
        </div>

        <!-- Messages -->
        <MessageList :messages="chatStore.messages" />

        <!-- Input -->
        <ChatInput :disabled="chatStore.isStreaming" @send="handleSend" />
    </div>
</template>
