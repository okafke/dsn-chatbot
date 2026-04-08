<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage as ChatMessageType } from '../types'
import ChatMessage from './ChatMessage.vue'

const props = defineProps<{
  messages: ChatMessageType[]
}>()

const container = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new messages arrive or content changes
watch(
  () => props.messages.map((m) => m.content).join(''),
  async () => {
    await nextTick()
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight
    }
  }
)
</script>

<template>
  <div ref="container" class="flex-1 overflow-y-auto p-4 space-y-4">
    <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
      <div class="text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-lg font-medium">Start a conversation</p>
        <p class="text-sm mt-1">Type a message below to begin chatting</p>
      </div>
    </div>

    <ChatMessage v-for="(message, index) in messages" :key="index" :message="message" />
  </div>
</template>
