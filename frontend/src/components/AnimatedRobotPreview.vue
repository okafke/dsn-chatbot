<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import type { RobotMood } from '../types'
import { createAnimationController, resolveSprite } from '../services/robotAnimation'

const props = defineProps<{
    mood: RobotMood
    size?: string
}>()

const animation = createAnimationController()

const currentImage = computed(() => {
    const { mood, action, eyes } = animation.state.value
    return resolveSprite(mood, action, eyes)
})

const altText = computed(() => {
    const { mood, action } = animation.state.value
    return `Robot feeling ${mood} (${action})`
})

const sizeClass = computed(() => props.size ?? 'w-24 h-24')

// Random negative delay so each preview starts at a different point in the animation cycle
const randomDelay = `${-(Math.random() * 6).toFixed(2)}s`

onMounted(() => {
    animation.setMood(props.mood)
    animation.start()
})

onUnmounted(() => {
    animation.stop()
})
</script>

<template>
    <div :class="[sizeClass, 'overflow-hidden rounded-lg']" class="robot-preview-container crt relative">
        <img
            v-if="currentImage"
            :alt="altText"
            :src="currentImage"
            :style="{ animationDelay: randomDelay }"
            class="robot-preview-img w-full h-full object-contain"
        />
        <div
            v-else
            class="w-full h-full flex items-center justify-center text-3xl"
        >
            🎮
        </div>

        <!-- CRT scanlines overlay -->
        <div class="crt-scanlines"></div>
        <!-- CRT flicker overlay -->
        <div class="crt-flicker"></div>
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

.robot-preview-img {
    transform: scale(1.05);
    animation: robotPreviewBreathe 6s ease-in-out infinite;
}

@keyframes robotPreviewBreathe {
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
</style>
