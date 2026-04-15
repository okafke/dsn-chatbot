<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from '../i18n'
import { useGameStore } from '../stores/game'
import { resolveSprite } from '../services/robotAnimation'
import { checkPassword } from '../services/games'

const props = defineProps<{
    gameId: string
    conversationId?: string | null
}>()

const emit = defineEmits<{
    unlocked: []
}>()

const { t } = useI18n()
const gameStore = useGameStore()
const passwordInput = ref('')
const isChecking = ref(false)
const isUnlocked = ref(false)
const shakeError = ref(false)
const showSuccess = ref(false)

// Sprite resolution via the animation system (same as RobotDisplay)
const currentImage = computed(() => {
    const { mood, action, eyes } = gameStore.animationState
    return resolveSprite(mood, action, eyes)
})

const altText = computed(() => {
    const { mood, action } = gameStore.animationState
    return `Lock ${mood} (${action})`
})

const isSpeaking = computed(() => gameStore.animationState.action === 'speaking')

async function handleSubmit() {
    const guess = passwordInput.value.trim()
    if (!guess || isChecking.value || isUnlocked.value) return

    isChecking.value = true
    shakeError.value = false

    try {
        const correct = await checkPassword(props.gameId, guess, props.conversationId)
        if (correct) {
            console.log(`🔓 Password cracked! The password was: ${guess}`)
            isUnlocked.value = true
            showSuccess.value = true
            // Switch to open_lock mood
            gameStore.setMood('open_lock')
            emit('unlocked')
        } else {
            // Trigger shake animation
            shakeError.value = true
            setTimeout(() => {
                shakeError.value = false
            }, 600)
            passwordInput.value = ''
        }
    } catch {
        shakeError.value = true
        setTimeout(() => {
            shakeError.value = false
        }, 600)
    } finally {
        isChecking.value = false
    }
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
    }
}

// Reset when gameId changes
watch(() => props.gameId, () => {
    isUnlocked.value = false
    showSuccess.value = false
    passwordInput.value = ''
})
</script>

<template>
    <div class="flex flex-col items-center gap-3">
        <!-- Lock sprite display (same CRT style as RobotDisplay) -->
        <div class="flex items-center justify-center" :class="{ shake: shakeError }">
            <div class="relative p-3 rounded-2xl bg-gray-800/60 border border-gray-700/50 shadow-lg">
                <div class="crt relative block rounded-xl overflow-hidden bg-gray-700/40 leading-[0]">
                    <img
                        v-if="currentImage"
                        :alt="altText"
                        :src="currentImage"
                        class="lock-img w-48 h-48 object-contain transition-opacity duration-75"
                    />
                    <div v-else class="w-48 h-48 flex items-center justify-center text-gray-500 text-sm">
                        🔒
                    </div>

                    <!-- CRT scanlines overlay -->
                    <div class="crt-scanlines"></div>
                    <!-- CRT flicker overlay -->
                    <div class="crt-flicker"></div>
                </div>

                <!-- Speech bubble with animated dots — outside overflow-hidden CRT container -->
                <Transition name="bubble">
                    <div v-if="isSpeaking" class="speech-bubble">
                        <span class="dot dot-1">.</span>
                        <span class="dot dot-2">.</span>
                        <span class="dot dot-3">.</span>
                    </div>
                </Transition>

                <!-- Success glow -->
                <Transition name="glow">
                    <div v-if="showSuccess" class="success-glow"></div>
                </Transition>
            </div>
        </div>

        <!-- Password input -->
        <div class="password-section" :class="{ shake: shakeError }">
            <form class="flex items-center gap-2" @submit.prevent="handleSubmit">
                <input
                    v-model="passwordInput"
                    type="text"
                    :disabled="isUnlocked"
                    :placeholder="t('passwordLock.inputPlaceholder')"
                    class="px-3 py-2 w-48 text-center text-sm bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-widest uppercase"
                    maxlength="32"
                    autocomplete="off"
                    @keydown="handleKeydown"
                />
                <button
                    type="submit"
                    :disabled="isChecking || isUnlocked || !passwordInput.trim()"
                    class="px-3 py-2 text-sm bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                    <span v-if="isChecking">⏳</span>
                    <span v-else-if="isUnlocked">✅</span>
                    <span v-else>🔑</span>
                </button>
            </form>
            <p v-if="isUnlocked" class="text-green-400 text-xs mt-1 text-center">
                {{ t('passwordLock.unlocked') }}
            </p>
        </div>
    </div>
</template>

<style scoped>
/* ── CRT Effect ── */
.crt {
    box-shadow:
        inset 0 0 60px rgba(0, 255, 150, 0.08),
        0 0 14px rgba(0, 255, 150, 0.10);
}

/* Scanlines */
.crt-scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 2px,
        rgba(0, 0, 0, 0.15) 2px,
        rgba(0, 0, 0, 0.15) 4px
    );
    z-index: 10;
}

/* Subtle flicker */
.crt-flicker {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 11;
    animation: crtFlicker 0.15s infinite;
    background: transparent;
}

@keyframes crtFlicker {
    0%   { opacity: 0.02; background: rgba(200, 255, 200, 0.03); }
    50%  { opacity: 0;    background: transparent; }
    100% { opacity: 0.02; background: rgba(200, 255, 200, 0.03); }
}

/* Vignette / screen edge darkening */
.crt::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 12;
    background: radial-gradient(
        ellipse at center,
        transparent 60%,
        rgba(0, 0, 0, 0.35) 100%
    );
}

/* Breathing / bobbing animation */
.lock-img {
    transform: scale(1.05);
    animation: lockBreathe 6s ease-in-out infinite;
}

@keyframes lockBreathe {
    0% {
        transform: scale(1.05) translateX(0.5px) translateY(1.5px);
    }
    25% {
        transform: scale(1.05) translateX(-0.5px) translateY(0px);
    }
    50% {
        transform: scale(1.05) translateX(0.5px) translateY(-1.5px);
    }
    75% {
        transform: scale(1.05) translateX(-0.5px) translateY(0px);
    }
    100% {
        transform: scale(1.05) translateX(0.5px) translateY(1.5px);
    }
}

.speech-bubble {
    position: absolute;
    top: 0.25rem;
    right: -2.5rem;
    z-index: 50;
    background: #374151;
    color: #e5e7eb;
    border: 1px solid #4b5563;
    border-radius: 0.75rem;
    padding: 0.25rem 0.6rem;
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1;
    letter-spacing: 0.15em;
    display: flex;
    align-items: center;
    gap: 1px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Tail pointing left toward the lock */
.speech-bubble::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #4b5563;
}

.speech-bubble::after {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 5px solid #374151;
}

/* Dot bounce animation */
.dot {
    display: inline-block;
    animation: dotBounce 1.4s ease-in-out infinite;
}

.dot-1 {
    animation-delay: 0s;
}

.dot-2 {
    animation-delay: 0.2s;
}

.dot-3 {
    animation-delay: 0.4s;
}

@keyframes dotBounce {
    0%, 80%, 100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    40% {
        transform: translateY(-6px);
        opacity: 1;
    }
}

/* Bubble enter/leave transition */
.bubble-enter-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.bubble-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.bubble-enter-from {
    opacity: 0;
    transform: scale(0.7);
}

.bubble-leave-to {
    opacity: 0;
    transform: scale(0.7);
}

.success-glow {
    position: absolute;
    inset: -1rem;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%);
    pointer-events: none;
    animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
}

/* Shake animation for wrong password */
.shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
    10%, 90% { transform: translateX(-1px); }
    20%, 80% { transform: translateX(2px); }
    30%, 50%, 70% { transform: translateX(-4px); }
    40%, 60% { transform: translateX(4px); }
}

/* Glow transition */
.glow-enter-active {
    transition: opacity 0.5s ease;
}
.glow-leave-active {
    transition: opacity 0.3s ease;
}
.glow-enter-from, .glow-leave-to {
    opacity: 0;
}

.password-section {
    min-height: 4rem;
}
</style>
