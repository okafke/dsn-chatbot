<script lang="ts" setup>
import type {ChatMessage} from '../types'

defineProps<{
  message: ChatMessage
}>()
</script>

<template>
  <div
      :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      class="flex w-full"
  >
    <div
        :class="
        message.role === 'user'
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-gray-700 text-gray-100 rounded-bl-md'
      "
        class="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
    >
      <div class="whitespace-pre-wrap break-words">{{ message.content }}<span
          v-if="message.isStreaming"
          class="inline-block w-2 h-4 ml-0.5 bg-gray-300 animate-pulse rounded-sm"
      ></span></div>
    </div>
  </div>
</template>
