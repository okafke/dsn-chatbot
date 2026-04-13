import type {Game} from '../types'

/**
 * Fetch the list of available games from the backend.
 */
export async function fetchGames(): Promise<Game[]> {
    const token = localStorage.getItem('access_token')

    const response = await fetch('/api/games', {
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
