/**
 * Robot Animation Service
 *
 * An extensible service that manages the robot's visual state:
 *   - **Moods** (sad, slightly_happy, …)
 *   - **Actions** (idle, speaking, head_tilt, …)
 *   - **Eye states** (open / closed) with random-interval blinking
 *   - **Idle behaviours** (e.g. occasional head tilt) that fire at random intervals
 *
 * ## Sprite naming convention
 *
 * Every sprite is registered with a key of `{mood}/{action}/{eyes}`.
 * When an image is requested the service looks up the key; if the exact
 * action variant is missing it falls back to `idle` for that mood+eyes combo.
 *
 * ## How to add a new mood / action
 *
 * 1. Add the literal to `RobotMood` / `RobotAction` in `types/index.ts`.
 * 2. Import the PNGs and call `registerSprite()` for every combination you have.
 * 3. Optionally register idle behaviours with `registerIdleBehaviour()`.
 */

import { ref, readonly, type Ref, type DeepReadonly } from 'vue'
import type {
    RobotMood,
    RobotAction,
    RobotEyes,
    RobotAnimationState,
    IdleBehaviour,
} from '../types'

// ── Sprite Registry ─────────────────────────────────────────────────────────

/** Internal key used to look up a sprite URL. */
function spriteKey(mood: RobotMood, action: RobotAction, eyes: RobotEyes): string {
    return `${mood}/${action}/${eyes}`
}

/** mood → action → eyes → image URL */
const spriteRegistry = new Map<string, string>()

/**
 * Register a sprite image for a given mood + action + eyes combination.
 *
 * ```ts
 * import sadIdle from '../assets/sad_robot.png'
 * registerSprite('sad', 'idle', 'open', sadIdle)
 * ```
 */
export function registerSprite(
    mood: RobotMood,
    action: RobotAction,
    eyes: RobotEyes,
    imageUrl: string,
): void {
    spriteRegistry.set(spriteKey(mood, action, eyes), imageUrl)
}

/**
 * Resolve the image URL for the current animation state.
 * Falls back to `idle` action if the requested action has no sprite.
 * Returns `undefined` if nothing is registered at all.
 */
export function resolveSprite(
    mood: RobotMood,
    action: RobotAction,
    eyes: RobotEyes,
): string | undefined {
    return (
        spriteRegistry.get(spriteKey(mood, action, eyes)) ??
        spriteRegistry.get(spriteKey(mood, 'idle', eyes))
    )
}

// ── Idle Behaviour Registry ─────────────────────────────────────────────────

/**
 * Behaviours keyed by mood.  Each mood can have zero or more idle behaviours
 * that fire at random intervals when the robot is in the `idle` action.
 */
const idleBehaviours = new Map<RobotMood, IdleBehaviour[]>()

/**
 * Register an idle behaviour for a mood.
 *
 * ```ts
 * registerIdleBehaviour('sad', {
 *     action: 'head_tilt',
 *     durationMs: 1500,
 *     minIntervalMs: 4000,
 *     maxIntervalMs: 8000,
 * })
 * ```
 */
export function registerIdleBehaviour(mood: RobotMood, behaviour: IdleBehaviour): void {
    const list = idleBehaviours.get(mood) ?? []
    list.push(behaviour)
    idleBehaviours.set(mood, list)
}

// ── Blink Configuration ─────────────────────────────────────────────────────

interface BlinkConfig {
    /** Duration the eyes stay closed (ms). */
    closedDurationMs: number
    /** Minimum time between blinks (ms). */
    minIntervalMs: number
    /** Maximum time between blinks (ms). */
    maxIntervalMs: number
    /** Probability (0–1) that a blink becomes a double-blink. */
    doubleBlinkChance: number
    /** Pause between the two blinks in a double-blink (ms). */
    doubleBlinkGapMs: number
}

const defaultBlinkConfig: BlinkConfig = {
    closedDurationMs: 150,
    minIntervalMs: 2000,
    maxIntervalMs: 5500,
    doubleBlinkChance: 0.15,
    doubleBlinkGapMs: 80,
}

let blinkConfig: BlinkConfig = { ...defaultBlinkConfig }

/** Override the global blink timing. */
export function setBlinkConfig(config: Partial<BlinkConfig>): void {
    blinkConfig = { ...blinkConfig, ...config }
}

// ── Animation Controller ────────────────────────────────────────────────────

/**
 * Creates a reactive animation controller.
 * Call this once per component instance (or once globally in a store).
 *
 * Returns reactive state + imperative methods to drive the animation.
 */
export function createAnimationController() {
    // ── Reactive state ──────────────────────────────────────────────────
    const state = ref<RobotAnimationState>({
        mood: 'sad',
        action: 'idle',
        eyes: 'open',
    })

    // ── Timer handles ───────────────────────────────────────────────────
    let blinkTimer: ReturnType<typeof setTimeout> | null = null
    let blinkCloseTimer: ReturnType<typeof setTimeout> | null = null
    let idleBehaviourTimer: ReturnType<typeof setTimeout> | null = null
    let idleBehaviourEndTimer: ReturnType<typeof setTimeout> | null = null
    let running = false

    // ── Helpers ─────────────────────────────────────────────────────────

    function randomBetween(min: number, max: number): number {
        return min + Math.random() * (max - min)
    }

    // ── Blinking ────────────────────────────────────────────────────────

    /** Perform a single close→open blink and invoke `onDone` when finished. */
    function doBlink(onDone: () => void) {
        if (!running) return
        state.value = { ...state.value, eyes: 'closed' }
        blinkCloseTimer = setTimeout(() => {
            if (!running) return
            state.value = { ...state.value, eyes: 'open' }
            onDone()
        }, blinkConfig.closedDurationMs)
    }

    function scheduleBlink() {
        if (!running) return
        const delay = randomBetween(blinkConfig.minIntervalMs, blinkConfig.maxIntervalMs)
        blinkTimer = setTimeout(() => {
            if (!running) return
            const isDouble = Math.random() < blinkConfig.doubleBlinkChance
            doBlink(() => {
                if (isDouble) {
                    // Brief pause then blink again
                    blinkTimer = setTimeout(() => {
                        if (!running) return
                        doBlink(() => scheduleBlink())
                    }, blinkConfig.doubleBlinkGapMs)
                } else {
                    scheduleBlink()
                }
            })
        }, delay)
    }

    // ── Idle Behaviours ─────────────────────────────────────────────────

    function scheduleIdleBehaviour() {
        if (!running) return
        const behaviours = idleBehaviours.get(state.value.mood)
        if (!behaviours || behaviours.length === 0) return

        // Pick a random behaviour from the list
        const behaviour = behaviours[Math.floor(Math.random() * behaviours.length)]
        const delay = randomBetween(behaviour.minIntervalMs, behaviour.maxIntervalMs)

        idleBehaviourTimer = setTimeout(() => {
            if (!running) return
            // Only trigger if we're currently idle (don't interrupt speaking, etc.)
            if (state.value.action !== 'idle') {
                scheduleIdleBehaviour()
                return
            }
            state.value = { ...state.value, action: behaviour.action }
            idleBehaviourEndTimer = setTimeout(() => {
                if (!running) return
                state.value = { ...state.value, action: 'idle' }
                scheduleIdleBehaviour()
            }, behaviour.durationMs)
        }, delay)
    }

    // ── Public API ──────────────────────────────────────────────────────

    /** Start the blink + idle-behaviour loops. Call on mount. */
    function start() {
        if (running) return
        running = true
        scheduleBlink()
        scheduleIdleBehaviour()
    }

    /** Stop all timers. Call on unmount. */
    function stop() {
        running = false
        if (blinkTimer) clearTimeout(blinkTimer)
        if (blinkCloseTimer) clearTimeout(blinkCloseTimer)
        if (idleBehaviourTimer) clearTimeout(idleBehaviourTimer)
        if (idleBehaviourEndTimer) clearTimeout(idleBehaviourEndTimer)
        blinkTimer = null
        blinkCloseTimer = null
        idleBehaviourTimer = null
        idleBehaviourEndTimer = null
    }

    /** Change the robot's mood. Resets action to idle and restarts idle behaviours. */
    function setMood(mood: RobotMood) {
        const wasRunning = running
        // Clear idle behaviour timers (mood-specific)
        if (idleBehaviourTimer) clearTimeout(idleBehaviourTimer)
        if (idleBehaviourEndTimer) clearTimeout(idleBehaviourEndTimer)
        idleBehaviourTimer = null
        idleBehaviourEndTimer = null

        state.value = { ...state.value, mood, action: 'idle' }

        if (wasRunning) {
            scheduleIdleBehaviour()
        }
    }

    /**
     * Set the robot's action directly (e.g. `'speaking'`).
     * While a non-idle action is active, idle behaviours won't fire.
     */
    function setAction(action: RobotAction) {
        state.value = { ...state.value, action }
    }

    /**
     * Convenience: set action to `'speaking'`.
     * Idle behaviours are suppressed while speaking.
     */
    function startSpeaking() {
        setAction('speaking')
    }

    /**
     * Convenience: return to `'idle'` after speaking finishes.
     */
    function stopSpeaking() {
        setAction('idle')
    }

    return {
        /** Readonly reactive animation state. */
        state: readonly(state) as DeepReadonly<Ref<RobotAnimationState>>,
        start,
        stop,
        setMood,
        setAction,
        startSpeaking,
        stopSpeaking,
    }
}

export type AnimationController = ReturnType<typeof createAnimationController>
