<script lang="ts" setup>
import { onMounted } from 'vue'
import { useModelStore } from '../stores/model'

const modelStore = useModelStore()

onMounted(async () => {
    if (!modelStore.loaded) {
        await modelStore.loadModels()
    }
})
</script>

<template>
    <select
        v-if="modelStore.hasMultipleModels"
        :value="modelStore.currentModel"
        class="px-2 py-1 text-sm bg-gray-700 text-gray-300 border border-gray-600 rounded transition-colors hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        @change="modelStore.setModel(($event.target as HTMLSelectElement).value)"
    >
        <option
            v-for="model in modelStore.models"
            :key="model"
            :value="model"
        >
            {{ model }}
        </option>
    </select>
</template>
