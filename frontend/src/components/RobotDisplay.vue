<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import type {RobotMood} from '../types'

import sadRobot from '../assets/sad_robot.png'
import sadRobotEyesClosed from '../assets/sad_robot_eyes_closed.png'
import slightlyHappyRobot from '../assets/slightly_happy_robot.png'
import slightlyHappyRobotEyesClosed from '../assets/slightly_happy_robot_eyes_closed.png'

const props = defineProps<{
  mood: RobotMood
}>()

const imageMap: Record<RobotMood, { open: string; closed: string }> = {
  sad: {open: sadRobot, closed: sadRobotEyesClosed},
  slightly_happy: {open: slightlyHappyRobot, closed: slightlyHappyRobotEyesClosed},
}

const isBlinking = ref(false)
let blinkTimeout: ReturnType<typeof setTimeout> | null = null
let blinkInterval: ReturnType<typeof setTimeout> | null = null

const currentImage = computed(() => {
  const images = imageMap[props.mood]
  return isBlinking.value ? images.closed : images.open
})

function scheduleBlink() {
  // Random interval between 3-5 seconds
  const delay = 3000 + Math.random() * 2000
  blinkInterval = setTimeout(() => {
    isBlinking.value = true
    blinkTimeout = setTimeout(() => {
      isBlinking.value = false
      scheduleBlink()
    }, 150)
  }, delay)
}

onMounted(() => {
  scheduleBlink()
})

onUnmounted(() => {
  if (blinkTimeout) clearTimeout(blinkTimeout)
  if (blinkInterval) clearTimeout(blinkInterval)
})
</script>

<template>
  <div class="flex items-center justify-center">
    <img
        :alt="`Robot feeling ${mood}`"
        :src="currentImage"
        class="w-48 h-48 object-contain transition-opacity duration-75"
    />
  </div>
</template>
