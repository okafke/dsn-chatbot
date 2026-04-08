<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
}>()

const input = ref('')
const textarea = ref<HTMLTextAreaElement | null>(null)

function handleSubmit() {
  const message = input.value.trim()
  if (!message || props.disabled) return
  emit('send', message)
  input.value = ''
  // Reset textarea height
  if (textarea.value) {
    textarea.value.style.height = 'auto'
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

function autoResize(e: Event) {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 200) + 'px'
}
</script>

<template>
  <div class="border-t border-gray-700 p-4 bg-gray-800">
    <form @submit.prevent="handleSubmit" class="flex items-end gap-3 max-w-4xl mx-auto">
      <textarea
        ref="textarea"
        v-model="input"
        @keydown="handleKeydown"
        @input="autoResize"
        :disabled="disabled"
        rows="1"
        placeholder="Type a message... (Shift+Enter for new line)"
        class="flex-1 resize-none px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      ></textarea>
      <button
        type="submit"
        :disabled="disabled || !input.trim()"
        class="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  </div>
</template>
