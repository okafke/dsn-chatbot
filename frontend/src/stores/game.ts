import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {Game, RobotMood} from '../types'
import {fetchGames} from '../services/games'

export const useGameStore = defineStore('game', () => {
    const games = ref<Game[]>([])
    const currentGame = ref<Game | null>(null)
    const currentMood = ref<RobotMood>('sad')
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function loadGames() {
        loading.value = true
        error.value = null
        try {
            games.value = await fetchGames()
        } catch (e: any) {
            error.value = e.message || 'Failed to load games'
        } finally {
            loading.value = false
        }
    }

    function selectGame(game: Game) {
        currentGame.value = game
        currentMood.value = 'sad' // Reset mood when starting a new game
    }

    function setMood(mood: RobotMood) {
        currentMood.value = mood
    }

    function resetGame() {
        currentGame.value = null
        currentMood.value = 'sad'
    }

    return {
        games,
        currentGame,
        currentMood,
        loading,
        error,
        loadGames,
        selectGame,
        setMood,
        resetGame,
    }
})
