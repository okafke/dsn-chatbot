<script lang="ts" setup>
import {useChatStore} from '../stores/chat'
import {useI18n} from '../i18n'
import MessageList from '../components/MessageList.vue'
import ChatInput from '../components/ChatInput.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import ModelSelector from '../components/ModelSelector.vue'

const chatStore = useChatStore()
const {t} = useI18n()

function handleSend(message: string) {
  chatStore.sendMessage(message)
}

function handleNewChat() {
  chatStore.newConversation()
}

</script>

<template>
  <div class="h-screen flex flex-col bg-gray-900">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-semibold text-white">{{ t('chat.title') }}</h1>
      </div>

      <div class="flex items-center gap-4">
        <ModelSelector />
        <LanguageSwitcher />
        <button
            class="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            @click="handleNewChat"
        >
          {{ t('chat.newChat') }}
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
