import api from './api'
import type {
  Target,
  TargetCreatePayload,
  TargetUpdatePayload,
  SessionStartResponse,
  SessionEndResponse,
} from '@/types/target'

export async function getTargets(): Promise<Target[]> {
  const { data } = await api.get<Target[]>('/targets')
  return data
}

export async function createTarget(payload: TargetCreatePayload): Promise<Target> {
  const { data } = await api.post<Target>('/targets', payload)
  return data
}

export async function updateTarget(id: number, payload: TargetUpdatePayload): Promise<Target> {
  const { data } = await api.put<Target>(`/targets/${id}`, payload)
  return data
}

export async function deleteTarget(id: number): Promise<void> {
  await api.delete(`/targets/${id}`)
}

export async function reorderTargets(targetIds: number[]): Promise<Target[]> {
  const { data } = await api.put<Target[]>('/targets/reorder', targetIds)
  return data
}

export async function toggleSubtask(targetId: number, subtaskId: number): Promise<Target> {
  const { data } = await api.put<Target>(`/targets/${targetId}/subtasks/${subtaskId}/toggle`)
  return data
}

export async function startSession(targetId: number): Promise<SessionStartResponse> {
  const { data } = await api.post<SessionStartResponse>('/sessions/start', { target_id: targetId })
  return data
}

export async function endSession(sessionId: number, markComplete: boolean): Promise<SessionEndResponse> {
  const { data } = await api.post<SessionEndResponse>('/sessions/end', {
    session_id: sessionId,
    mark_complete: markComplete,
  })
  return data
}
