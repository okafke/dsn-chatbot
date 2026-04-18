<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useChatStore } from '../stores/chat'
import { useLanguageStore } from '../stores/language'
import { useI18n } from '../i18n'
import type { RobotMood } from '../types'
import MessageList from '../components/MessageList.vue'
import ChatInput from '../components/ChatInput.vue'
import RobotDisplay from '../components/RobotDisplay.vue'
import LockDisplay from '../components/LockDisplay.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import ModelSelector from '../components/ModelSelector.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const chatStore = useChatStore()
const languageStore = useLanguageStore()
const { t } = useI18n()

const vaultUnlocked = ref(false)
const showTips = ref(false)
const isPasswordLockGame = computed(() => gameStore.currentGame?.id === 'password_lock')
const isSadRobotGame = computed(() => gameStore.currentGame?.id === 'sad_robot')
const hasHallOfFame = computed(() => isPasswordLockGame.value || isSadRobotGame.value)

function handleVaultUnlocked() {
    vaultUnlocked.value = true
}

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

    chatStore.fastInitialMessage = false
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
    gameStore.stopSpeaking()
    if (game) {
        gameStore.setMood(game.initial_mood as RobotMood)
    }
    vaultUnlocked.value = false
    chatStore.newConversation()
    // Use faster typewriter speed for the re-shown initial message
    chatStore.fastInitialMessage = true
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
                <ModelSelector />
                <LanguageSwitcher />
                <button
                    v-if="isPasswordLockGame"
                    class="px-3 py-1.5 text-sm bg-indigo-700 hover:bg-indigo-600 text-indigo-100 rounded-lg transition-colors"
                    @click="showTips = !showTips"
                >
                    {{ t('passwordLock.tipsButton') }}
                </button>
                <button
                    v-if="hasHallOfFame"
                    class="px-3 py-1.5 text-sm bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg transition-colors"
                    @click="router.push({ name: 'hallOfFame', params: { gameId: gameStore.currentGame!.id } })"
                >
                    🏆 {{ t('hallOfFame.button') }}
                </button>
                <button
                    class="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                    @click="handleNewGame"
                >
                    {{ t('gameChat.restart') }}
                </button>
            </div>
        </header>

        <!-- Tips panel (password lock game only) -->
        <Transition name="tips">
            <div
                v-if="isPasswordLockGame && showTips"
                class="mx-4 mt-2 p-4 bg-indigo-900/40 border border-indigo-500/50 rounded-lg text-indigo-100 text-sm max-h-64 overflow-y-auto"
            >
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-indigo-200">{{ t('passwordLock.tipsTitle') }}</h3>
                    <button class="text-indigo-400 hover:text-indigo-200" @click="showTips = false">✕</button>
                </div>
                <p class="mb-3 text-indigo-300">{{ t('passwordLock.tipsIntro') }}</p>
                <ul class="space-y-2">
                    <li v-for="n in 6" :key="n">
                        <strong>{{ t(`passwordLock.tip${n}Title`) }}</strong>
                        <br />
                        <span class="text-indigo-300">{{ t(`passwordLock.tip${n}Text`) }}</span>
                    </li>
                </ul>
            </div>
        </Transition>

        <!-- Error banner -->
        <div
            v-if="chatStore.error"
            class="mx-4 mt-2 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm flex items-center justify-between"
        >
            <span>{{ chatStore.error }}</span>
            <button class="text-red-400 hover:text-red-200 ml-4" @click="chatStore.error = null">✕</button>
        </div>

        <!-- Display: Lock for password_lock game, Robot for others -->
        <div class="py-4 shrink-0">
            <LockDisplay
                v-if="isPasswordLockGame"
                :game-id="gameStore.currentGame!.id"
                :conversation-id="chatStore.conversationId"
                @unlocked="handleVaultUnlocked"
            />
            <RobotDisplay v-else />
        </div>

        <!-- Messages -->
        <MessageList :messages="chatStore.messages" />

        <!-- Input -->
        <ChatInput :disabled="chatStore.isStreaming || chatStore.isTypewriting" @send="handleSend" />
    </div>
</template>

<style scoped>
.tips-enter-active,
.tips-leave-active {
    transition: all 0.25s ease;
    overflow: hidden;
}

.tips-enter-from,
.tips-leave-to {
    opacity: 0;
    max-height: 0;
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 0;
}
</style>
