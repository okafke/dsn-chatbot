<script lang="ts" setup>
import { computed, toRef, watch } from 'vue'
import type { ChatMessage } from '../types'
import { useTypewriter } from '../composables/useTypewriter'
import { useChatStore } from '../stores/chat'

const props = defineProps<{
    message: ChatMessage
    /** Typewriter delay in ms between characters. Default: 30 */
    typewriterDelayMs?: number
}>()

const chatStore = useChatStore()
const contentRef = toRef(() => props.message.content)
const isAssistant = computed(() => props.message.role === 'assistant')

const { displayedText, isTyping } = useTypewriter(contentRef, {
    charDelayMs: props.typewriterDelayMs ?? 30,
    enabled: isAssistant.value,
})

// Sync typewriter state to the chat store so RobotDisplay can react
watch(isTyping, (typing) => {
    if (isAssistant.value) {
        chatStore.setTypewriting(typing)
    }
})

// Show the typewriter text for assistant messages, raw content for user messages
const visibleContent = computed(() =>
    isAssistant.value ? displayedText.value : props.message.content
)

// Show cursor when streaming OR when typewriter is still revealing characters
const showCursor = computed(() =>
    isAssistant.value && (props.message.isStreaming || isTyping.value)
)
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
            <div class="whitespace-pre-wrap break-words">{{ visibleContent }}<span
                v-if="showCursor"
                class="inline-block w-2 h-4 ml-0.5 bg-gray-300 animate-pulse rounded-sm"
            ></span></div>
        </div>
    </div>
</template>
