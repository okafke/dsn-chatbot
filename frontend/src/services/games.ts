import type {Game} from '../types'

/**
 * Fetch the list of available games from the backend.
 * Optionally pass a language code to get translated descriptions.
 */
export async function fetchGames(language?: string): Promise<Game[]> {
    const token = localStorage.getItem('access_token')

    const params = new URLSearchParams()
    if (language) {
        params.set('language', language)
    }
    const qs = params.toString()
    const url = `/api/games${qs ? `?${qs}` : ''}`

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = '/login'
            return []
        }
        throw new Error(`Failed to fetch games: ${response.statusText}`)
    }

    return response.json()
}
