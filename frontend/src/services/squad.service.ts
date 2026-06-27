import api from './api'
import type { Squad, SquadLeaderboardEntry } from '@/types/squad'

export async function getMySquads(): Promise<Squad[]> {
  const { data } = await api.get<Squad[]>('/squads/my')
  return data
}

export async function createSquad(name: string, description?: string): Promise<Squad> {
  const { data } = await api.post<Squad>('/squads', { name, description })
  return data
}

export async function joinSquad(invite_code: string): Promise<Squad> {
  const { data } = await api.post<Squad>('/squads/join', { invite_code })
  return data
}

export async function getSquad(squadId: number): Promise<Squad> {
  const { data } = await api.get<Squad>(`/squads/${squadId}`)
  return data
}

export async function leaveSquad(squadId: number): Promise<void> {
  await api.delete(`/squads/${squadId}/leave`)
}

export async function getSquadLeaderboard(squadId: number): Promise<{ squad_name: string; leaderboard: SquadLeaderboardEntry[] }> {
  const { data } = await api.get(`/squads/${squadId}/leaderboard`)
  return data
}
