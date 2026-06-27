import api from './api'
import type { RegisterPayload, LoginPayload, TokenResponse, UserProfile } from '@/types/auth'

export function getLocalTzOffsetMinutes(): number {
  // JS getTimezoneOffset() is inverted (minutes WEST of UTC), so negate it.
  return -new Date().getTimezoneOffset()
}

export async function register(payload: Omit<RegisterPayload, 'tz_offset_minutes'>): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/register', {
    ...payload,
    tz_offset_minutes: getLocalTzOffsetMinutes(),
  })
  return data
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/login', payload)
  return data
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/user/profile')
  return data
}

export async function uploadAvatar(file: File): Promise<{avatar_url: string}> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<{avatar_url: string}>('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
