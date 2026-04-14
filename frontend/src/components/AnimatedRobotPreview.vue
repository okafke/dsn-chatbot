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

onMounted(() => {
    animation.setMood(props.mood)
    animation.start()
})

onUnmounted(() => {
    animation.stop()
})
</script>

<template>
    <img
        v-if="currentImage"
        :alt="altText"
        :src="currentImage"
        :class="[sizeClass, 'object-contain']"
    />
    <div
        v-else
        :class="[sizeClass, 'flex items-center justify-center text-3xl']"
    >
        🎮
    </div>
</template>
