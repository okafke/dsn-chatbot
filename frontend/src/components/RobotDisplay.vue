<script lang="ts" setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import { resolveSprite } from '../services/robotAnimation'

const gameStore = useGameStore()

const currentImage = computed(() => {
    const { mood, action, eyes } = gameStore.animationState
    return resolveSprite(mood, action, eyes)
})

const altText = computed(() => {
    const { mood, action } = gameStore.animationState
    return `Robot feeling ${mood} (${action})`
})

const isSpeaking = computed(() => gameStore.animationState.action === 'speaking')
</script>

<template>
    <div class="flex items-center justify-center">
        <div class="relative p-3 rounded-2xl bg-gray-800/60 border border-gray-700/50 shadow-lg">
            <div class="crt relative block rounded-xl overflow-hidden bg-gray-700/40 leading-[0]">
            <img
                v-if="currentImage"
                :alt="altText"
                :src="currentImage"
                class="robot-img w-48 h-48 object-contain transition-opacity duration-75"
            />
            <div v-else class="w-48 h-48 flex items-center justify-center text-gray-500 text-sm">
                🤖
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
.robot-img {
    transform: scale(1.05);
    animation: robotBreathe 6s ease-in-out infinite;
}

@keyframes robotBreathe {
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

/* Tail pointing left toward the robot */
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
</style>
