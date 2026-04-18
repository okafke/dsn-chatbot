import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useModelStore = defineStore('model', () => {
    const models = ref<string[]>([])
    const selectedModel = ref<string | null>(null)
    const defaultModel = ref<string>('')
    const loaded = ref(false)

    const hasMultipleModels = computed(() => models.value.length > 1)

    const currentModel = computed(() => selectedModel.value || defaultModel.value || null)

    async function loadModels() {
        try {
            const response = await api.get('/models')
            models.value = response.data.models
            defaultModel.value = response.data.default
            if (!selectedModel.value && models.value.length > 0) {
                selectedModel.value = defaultModel.value
            }
            loaded.value = true
        } catch (e) {
            // Fallback: no models available
            models.value = []
            loaded.value = true
        }
    }

    function setModel(model: string) {
        selectedModel.value = model
    }

    return {
        models,
        selectedModel,
        defaultModel,
        loaded,
        hasMultipleModels,
        currentModel,
        loadModels,
        setModel,
    }
})
