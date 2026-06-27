import { create } from 'zustand'
import type { Target, TargetCreatePayload, TargetUpdatePayload } from '@/types/target'
import * as targetService from '@/services/target.service'

interface TargetState {
  targets: Target[]
  isLoading: boolean
  error: string | null
  fetchTargets: () => Promise<void>
  addTarget: (payload: TargetCreatePayload) => Promise<void>
  editTarget: (id: number, payload: TargetUpdatePayload) => Promise<void>
  removeTarget: (id: number) => Promise<void>
  reorderTargets: (targetIds: number[]) => Promise<void>
  toggleSubtask: (targetId: number, subtaskId: number) => Promise<void>
}

export const useTargetStore = create<TargetState>((set, get) => ({
  targets: [],
  isLoading: false,
  error: null,

  fetchTargets: async () => {
    set({ isLoading: true, error: null })
    try {
      const targets = await targetService.getTargets()
      set({ targets })
    } catch (err: any) {
      set({ error: err?.response?.data?.detail ?? 'Failed to load targets' })
    } finally {
      set({ isLoading: false })
    }
  },

  addTarget: async (payload) => {
    const target = await targetService.createTarget(payload)
    set({ targets: [target, ...get().targets] })
  },

  editTarget: async (id, payload) => {
    const updated = await targetService.updateTarget(id, payload)
    set({ targets: get().targets.map((t) => (t.id === id ? updated : t)) })
  },

  removeTarget: async (id) => {
    await targetService.deleteTarget(id)
    set({ targets: get().targets.filter((t) => t.id !== id) })
  },

  reorderTargets: async (targetIds) => {
    // Optimistic update
    const currentTargets = get().targets
    const targetMap = new Map(currentTargets.map(t => [t.id, t]))
    const newOrder = targetIds.map(id => targetMap.get(id)).filter(Boolean) as Target[]
    
    // Add any targets that weren't in the reorder list (shouldn't happen, but just in case)
    const missing = currentTargets.filter(t => !targetIds.includes(t.id))
    const optimisticTargets = [...newOrder, ...missing]
    
    set({ targets: optimisticTargets })
    
    try {
      const updatedTargets = await targetService.reorderTargets(targetIds)
      set({ targets: updatedTargets })
    } catch (err: any) {
      // Revert on failure
      set({ targets: currentTargets, error: 'Failed to reorder targets' })
    }
  },

  toggleSubtask: async (targetId, subtaskId) => {
    const updated = await targetService.toggleSubtask(targetId, subtaskId)
    set({ targets: get().targets.map((t) => (t.id === targetId ? updated : t)) })
  },
}))
