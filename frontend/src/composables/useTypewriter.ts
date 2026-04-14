import { ref, watch, onUnmounted, type Ref } from 'vue'

export interface TypewriterOptions {
    /** Delay in milliseconds between each character. Default: 30 */
    charDelayMs?: number
    /** If true, the typewriter effect is active. If false, text is shown immediately. Default: true */
    enabled?: boolean
}

/**
 * Composable that reveals text character-by-character with a typewriter effect.
 *
 * It watches a reactive source string and gradually reveals characters.
 * When the source grows (e.g. from SSE streaming), new characters are queued
 * and revealed at the configured pace. When the source is set to a completely
 * new value (e.g. a pre-filled message), it starts typing from the beginning.
 *
 * @param source - Reactive ref containing the full target text
 * @param options - Configuration for the typewriter behaviour
 * @returns `displayedText` - a ref containing the currently visible portion
 * @returns `isTyping` - a ref that is true while characters are still being revealed
 */
export function useTypewriter(source: Ref<string>, options: TypewriterOptions = {}) {
    const charDelayMs = options.charDelayMs ?? 30
    const enabled = options.enabled ?? true

    const displayedText = ref('')
    const isTyping = ref(false)

    let timerId: ReturnType<typeof setTimeout> | null = null
    let currentIndex = 0

    function stopTimer() {
        if (timerId !== null) {
            clearTimeout(timerId)
            timerId = null
        }
    }

    function tick() {
        const target = source.value
        if (currentIndex < target.length) {
            currentIndex++
            displayedText.value = target.slice(0, currentIndex)
            isTyping.value = true
            timerId = setTimeout(tick, charDelayMs)
        } else {
            isTyping.value = false
            timerId = null
        }
    }

    if (!enabled) {
        // When disabled, just mirror the source directly
        watch(source, (val) => {
            displayedText.value = val
        }, { immediate: true })
    } else {
        watch(source, (newVal, oldVal) => {
            if (!oldVal && !newVal) return

            // If the new value starts with what we've already displayed,
            // it's an append (streaming) — just let the timer catch up
            const isAppend = newVal.startsWith(displayedText.value) && currentIndex <= newVal.length

            if (!isAppend) {
                // Completely new text — reset and start from scratch
                stopTimer()
                currentIndex = 0
                displayedText.value = ''
            }

            // Start ticking if not already running
            if (timerId === null && currentIndex < newVal.length) {
                isTyping.value = true
                tick()
            }
        }, { immediate: true })
    }

    onUnmounted(() => {
        stopTimer()
    })

    return {
        displayedText,
        isTyping,
    }
}
