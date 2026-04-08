import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage } from '../types'
import { sendMessageStream } from '../services/chat'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const conversationId = ref<string | null>(null)
  const isStreaming = ref(false)
  const error = ref<string | null>(null)

  function addMessage(message: ChatMessage) {
    messages.value.push(message)
  }

  function appendToLastMessage(content: string) {
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.role === 'assistant') {
      lastMsg.content += content
    }
  }

  function finishStreaming() {
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg) {
      lastMsg.isStreaming = false
    }
    isStreaming.value = false
  }

  async function sendMessage(content: string) {
    if (isStreaming.value) return

    error.value = null
    isStreaming.value = true

    // Add user message
    addMessage({
      role: 'user',
      content,
    })

    // Add placeholder for assistant response
    addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    })

    try {
      await sendMessageStream(content, conversationId.value, (event) => {
        switch (event.type) {
          case 'conversation':
            conversationId.value = event.id || null
            break
          case 'token':
            appendToLastMessage(event.content || '')
            break
          case 'done':
            finishStreaming()
            break
          case 'error':
            error.value = event.message || 'An error occurred'
            finishStreaming()
            break
        }
      })
    } catch (e: any) {
      error.value = e.message || 'Failed to send message'
      finishStreaming()
    }
  }

  function newConversation() {
    messages.value = []
    conversationId.value = null
    error.value = null
  }

  return {
    messages,
    conversationId,
    isStreaming,
    error,
    sendMessage,
    newConversation,
  }
})
