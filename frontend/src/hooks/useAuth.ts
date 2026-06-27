import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { token, user, isLoading, isInitialized, login, register, logout, fetchProfile } = useAuthStore()
  return { token, user, isLoading, isInitialized, login, register, logout, fetchProfile, isAuthenticated: !!token }
}
