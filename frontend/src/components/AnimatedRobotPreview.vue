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
    <div :class="[sizeClass, 'overflow-hidden rounded-lg']" class="robot-preview-container">
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
    </div>
</template>

<style scoped>
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
