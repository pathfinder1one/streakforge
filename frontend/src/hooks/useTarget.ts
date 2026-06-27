import { useTargetStore } from '@/store/targetStore'

export function useTarget() {
  const { targets, isLoading, error, fetchTargets, addTarget, editTarget, removeTarget } = useTargetStore()
  return { targets, isLoading, error, fetchTargets, addTarget, editTarget, removeTarget }
}
