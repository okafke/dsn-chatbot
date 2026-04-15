<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../i18n'
import { fetchHallOfFame, type SolvedConversation } from '../services/games'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const gameId = route.params.gameId as string
const conversations = ref<SolvedConversation[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const expandedId = ref<string | null>(null)

onMounted(async () => {
    try {
        conversations.value = await fetchHallOfFame(gameId)
    } catch (e: any) {
        error.value = e.message || 'Failed to load hall of fame'
    } finally {
        loading.value = false
    }
})

function toggleConversation(id: string) {
    expandedId.value = expandedId.value === id ? null : id
}

function handleBack() {
    router.push({ name: 'game', params: { gameId } })
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString()
}
</script>

<template>
    <div class="min-h-screen bg-gray-900 flex flex-col">
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
                    🏆 {{ t('hallOfFame.title') }}
                </h1>
            </div>
        </header>

        <!-- Content -->
        <main class="flex-1 p-6 max-w-4xl mx-auto w-full">
            <!-- Loading -->
            <div v-if="loading" class="text-gray-400 text-center py-12">
                {{ t('common.loading') }}
            </div>

            <!-- Error -->
            <div v-else-if="error" class="text-red-400 text-center py-12">
                {{ error }}
            </div>

            <!-- Empty state -->
            <div v-else-if="conversations.length === 0" class="text-center py-12">
                <div class="text-5xl mb-4">🔒</div>
                <p class="text-gray-400 text-lg">{{ t('hallOfFame.empty') }}</p>
                <p class="text-gray-500 text-sm mt-2">{{ t('hallOfFame.beFirst') }}</p>
            </div>

            <!-- Solved conversations list -->
            <div v-else class="space-y-4">
                <div
                    v-for="(conv, index) in conversations"
                    :key="conv.id"
                    class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
                >
                    <!-- Conversation header (clickable) -->
                    <button
                        class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
                        @click="toggleConversation(conv.id)"
                    >
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">
                                {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅' }}
                            </span>
                            <div>
                                <div class="text-white font-medium">
                                    {{ conv.username }}
                                </div>
                                <div class="text-gray-400 text-xs">
                                    {{ t('hallOfFame.solvedAt') }} {{ formatDate(conv.solved_at) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-500 text-sm">
                                {{ conv.messages.length }} {{ t('hallOfFame.messages') }}
                            </span>
                            <svg
                                class="w-5 h-5 text-gray-400 transition-transform"
                                :class="{ 'rotate-180': expandedId === conv.id }"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>

                    <!-- Expanded conversation messages -->
                    <Transition name="expand">
                        <div v-if="expandedId === conv.id" class="border-t border-gray-700">
                            <div class="max-h-96 overflow-y-auto p-4 space-y-3">
                                <div
                                    v-for="msg in conv.messages"
                                    :key="msg.id"
                                    class="flex"
                                    :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
                                >
                                    <div
                                        class="max-w-[80%] px-4 py-2 rounded-xl text-sm"
                                        :class="msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-200'"
                                    >
                                        {{ msg.content }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
    max-height: 500px;
    opacity: 1;
}
</style>
