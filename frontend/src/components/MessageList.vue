<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ChatMessage as ChatMessageType } from '../types'
import ChatMessage from './ChatMessage.vue'
import { useChatStore } from '../stores/chat'

const props = defineProps<{
    messages: ChatMessageType[]
}>()

const chatStore = useChatStore()

const container = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

function scrollToBottom() {
    if (container.value) {
        container.value.scrollTop = container.value.scrollHeight
    }
}

// Auto-scroll when new messages arrive (covers token streaming)
watch(
    () => props.messages.map((m) => m.content).join(''),
    async () => {
        await nextTick()
        scrollToBottom()
    }
)

// Use a MutationObserver to catch typewriter-driven DOM text changes
// that happen between store updates (e.g. character-by-character reveals)
onMounted(() => {
    if (container.value) {
        resizeObserver = new ResizeObserver(() => {
            scrollToBottom()
        })
        // Observe the container's direct children wrapper for size changes
        // caused by the typewriter revealing more text
        resizeObserver.observe(container.value)
    }
})

onUnmounted(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
})
</script>

<template>
    <div ref="container" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
            <div class="text-center text-gray-500">
                <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-linecap="round" stroke-linejoin="round"
                          stroke-width="1.5"/>
                </svg>
                <p class="text-lg font-medium">Start a conversation</p>
                <p class="text-sm mt-1">Type a message below to begin chatting</p>
            </div>
        </div>

        <ChatMessage
            v-for="(message, index) in messages"
            :key="`${chatStore.generation}-${index}`"
            :message="message"
            :typewriter-delay-ms="index === 0 && chatStore.fastInitialMessage ? 10 : undefined"
        />
    </div>
</template>
