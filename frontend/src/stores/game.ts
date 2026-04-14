import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Game, RobotMood, RobotAction } from '../types'
import { fetchGames } from '../services/games'
import {
    createAnimationController,
    type AnimationController,
} from '../services/robotAnimation'

export const useGameStore = defineStore('game', () => {
    const games = ref<Game[]>([])
    const currentGame = ref<Game | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // ── Animation controller (one per store lifetime) ───────────────────
    let _animation: AnimationController | null = null

    function getAnimation(): AnimationController {
        if (!_animation) {
            _animation = createAnimationController()
        }
        return _animation
    }

    /** Reactive animation state for templates. */
    const animationState = computed(() => getAnimation().state.value)

    /** Convenience: current mood from animation state. */
    const currentMood = computed(() => animationState.value.mood)

    // ── Game lifecycle ──────────────────────────────────────────────────

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
        const anim = getAnimation()
        anim.setMood(game.initial_mood as RobotMood)
        anim.start()
    }

    function setMood(mood: RobotMood) {
        getAnimation().setMood(mood)
    }

    function setAction(action: RobotAction) {
        getAnimation().setAction(action)
    }

    function startSpeaking() {
        getAnimation().startSpeaking()
    }

    function stopSpeaking() {
        getAnimation().stopSpeaking()
    }

    function resetGame() {
        getAnimation().stop()
        currentGame.value = null
    }

    /** Start animation loops (call on component mount). */
    function startAnimation() {
        getAnimation().start()
    }

    /** Stop animation loops (call on component unmount). */
    function stopAnimation() {
        getAnimation().stop()
    }

    return {
        // State
        games,
        currentGame,
        currentMood,
        animationState,
        loading,
        error,
        // Game actions
        loadGames,
        selectGame,
        resetGame,
        // Animation actions
        setMood,
        setAction,
        startSpeaking,
        stopSpeaking,
        startAnimation,
        stopAnimation,
    }
})
