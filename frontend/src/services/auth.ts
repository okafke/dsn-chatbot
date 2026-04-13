import api from './api'
import type {TokenResponse, User} from '../types'

export async function login(username: string, password: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', {username, password})
    const data = response.data
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data
}

export async function register(
    email: string,
    username: string,
    password: string
): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/register', {
        email,
        username,
        password,
    })
    const data = response.data
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data
}

export async function getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
}

export function logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
}

export function isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
}
