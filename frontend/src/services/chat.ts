import type {SSEEvent} from '../types'

/**
 * Send a chat message and process the streaming SSE response.
 * Uses fetch + ReadableStream instead of EventSource for POST support.
 */
export async function sendMessageStream(
    message: string,
    conversationId: string | null,
    onEvent: (event: SSEEvent) => void,
    gameId?: string | null
): Promise<void> {
    const token = localStorage.getItem('access_token')

    const body: Record<string, unknown> = {
        message,
        conversation_id: conversationId,
    }
    if (gameId) {
        body.game_id = gameId
    }

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = '/login'
            return
        }
        throw new Error(`Chat request failed: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const {done, value} = await reader.read()
        if (done) break

        buffer += decoder.decode(value, {stream: true})

        // Parse SSE events from buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6)) as SSEEvent
                    onEvent(data)
                } catch {
                    // Skip malformed JSON
                }
            }
        }
    }

    // Process any remaining buffer
    if (buffer.startsWith('data: ')) {
        try {
            const data = JSON.parse(buffer.slice(6)) as SSEEvent
            onEvent(data)
        } catch {
            // Skip malformed JSON
        }
    }
}
