<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from '../i18n'
import { checkPassword } from '../services/games'

const props = defineProps<{
    gameId: string
}>()

const emit = defineEmits<{
    unlocked: []
}>()

const { t } = useI18n()
const passwordInput = ref('')
const isChecking = ref(false)
const isUnlocked = ref(false)
const shakeError = ref(false)
const showSuccess = ref(false)

async function handleSubmit() {
    const guess = passwordInput.value.trim()
    if (!guess || isChecking.value || isUnlocked.value) return

    isChecking.value = true
    shakeError.value = false

    try {
        const correct = await checkPassword(props.gameId, guess)
        if (correct) {
            isUnlocked.value = true
            showSuccess.value = true
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
        <!-- Lock icon -->
        <div class="lock-container" :class="{ unlocked: isUnlocked, shake: shakeError }">
            <div class="lock-wrapper">
                <!-- Shackle (the U-shaped part) -->
                <div class="shackle" :class="{ open: isUnlocked }">
                    <svg viewBox="0 0 60 40" class="w-16 h-10">
                        <path
                            d="M 10 40 L 10 15 C 10 6 20 0 30 0 C 40 0 50 6 50 15 L 50 40"
                            fill="none"
                            :stroke="isUnlocked ? '#22c55e' : '#9ca3af'"
                            stroke-width="6"
                            stroke-linecap="round"
                        />
                    </svg>
                </div>
                <!-- Lock body -->
                <div
                    class="lock-body"
                    :class="{ 'lock-body-unlocked': isUnlocked }"
                >
                    <!-- Keyhole -->
                    <div class="keyhole" :class="{ 'keyhole-unlocked': isUnlocked }">
                        <div class="keyhole-circle"></div>
                        <div class="keyhole-rect"></div>
                    </div>
                </div>
            </div>

            <!-- Success glow -->
            <Transition name="glow">
                <div v-if="showSuccess" class="success-glow"></div>
            </Transition>
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
.lock-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.lock-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease;
}

.shackle {
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: right bottom;
    z-index: 1;
    margin-bottom: -4px;
}

.shackle.open {
    transform: rotate(-30deg) translateX(-8px) translateY(-4px);
}

.lock-body {
    width: 4.5rem;
    height: 3.5rem;
    background: linear-gradient(135deg, #6b7280, #4b5563);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #9ca3af;
    transition: all 0.5s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.lock-body-unlocked {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border-color: #4ade80;
    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
}

.keyhole {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.3s ease;
}

.keyhole-circle {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: #1f2937;
    border: 1px solid #374151;
}

.keyhole-rect {
    width: 0.35rem;
    height: 0.5rem;
    background: #1f2937;
    border-radius: 0 0 2px 2px;
    margin-top: -2px;
}

.keyhole-unlocked .keyhole-circle {
    background: #dcfce7;
    border-color: #86efac;
}

.keyhole-unlocked .keyhole-rect {
    background: #dcfce7;
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
