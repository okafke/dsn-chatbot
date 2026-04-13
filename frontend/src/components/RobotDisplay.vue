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
</script>

<template>
    <div class="flex items-center justify-center">
        <img
            v-if="currentImage"
            :alt="altText"
            :src="currentImage"
            class="w-48 h-48 object-contain transition-opacity duration-75"
        />
        <div v-else class="w-48 h-48 flex items-center justify-center text-gray-500 text-sm">
            🤖
        </div>
    </div>
</template>
