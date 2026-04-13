<script lang="ts" setup>
import {useRouter} from 'vue-router'
import {useAuthStore} from '../stores/auth'
import {useChatStore} from '../stores/chat'
import MessageList from '../components/MessageList.vue'
import ChatInput from '../components/ChatInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

function handleSend(message: string) {
  chatStore.sendMessage(message)
}

function handleNewChat() {
  chatStore.newConversation()
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-900">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-semibold text-white">DSN Chatbot</h1>
      </div>

      <div class="flex items-center gap-4">
        <button
            class="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            @click="handleNewChat"
        >
          + New Chat
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

    <!-- Messages -->
    <MessageList :messages="chatStore.messages"/>

    <!-- Input -->
    <ChatInput :disabled="chatStore.isStreaming" @send="handleSend"/>
  </div>
</template>
