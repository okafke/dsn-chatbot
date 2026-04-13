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
}

export type RobotMood = 'sad' | 'slightly_happy'
