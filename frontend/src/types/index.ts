export interface User {
    id: string
    email: string
    username: string
    created_at: string
}

export interface TokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
}

export interface ChatMessage {
    id?: string
    role: 'user' | 'assistant' | 'system'
    content: string
    model?: string
    created_at?: string
    isStreaming?: boolean
}

export interface Conversation {
    id: string
    title: string
    created_at: string
    updated_at: string
}

export interface ConversationDetail extends Conversation {
    messages: ChatMessage[]
}

export interface SSEEvent {
    type: 'conversation' | 'token' | 'done' | 'error' | 'mood'
    id?: string
    content?: string
    message?: string
    value?: string
}

export interface Game {
    id: string
    name: string
    description: string
    initial_mood: string
    initial_message?: string | null
}

// ── Robot Animation Types ───────────────────────────────────────────────────

/** Extensible mood identifier. Add new moods here. */
export type RobotMood = 'sad' | 'neutral' | 'very_happy' | 'slightly_happy'

/** Extensible action identifier. Add new actions here. */
export type RobotAction = 'idle' | 'speaking' | 'head_tilt'

/** Eye state for blinking animation. */
export type RobotEyes = 'open' | 'closed'

/**
 * A unique key identifying a specific sprite frame.
 * Every combination of mood × action × eyes that has an image must be registered.
 */
export interface RobotSpriteKey {
    mood: RobotMood
    action: RobotAction
    eyes: RobotEyes
}

/**
 * Configuration for an idle-time behaviour that the animation service
 * can trigger at random intervals (e.g. occasional head tilt).
 */
export interface IdleBehaviour {
    /** The action to switch to during this behaviour. */
    action: RobotAction
    /** How long (ms) the behaviour lasts before returning to idle. */
    durationMs: number
    /** Minimum delay (ms) between occurrences. */
    minIntervalMs: number
    /** Maximum delay (ms) between occurrences. */
    maxIntervalMs: number
}

/**
 * Full animation state exposed by the animation service.
 * The RobotDisplay component reads this reactively.
 */
export interface RobotAnimationState {
    mood: RobotMood
    action: RobotAction
    eyes: RobotEyes
}
