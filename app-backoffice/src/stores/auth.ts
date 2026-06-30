import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '../api/auth'
import type { UserDetail } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const currentUser = ref<UserDetail | null>(
    localStorage.getItem('current_user')
      ? JSON.parse(localStorage.getItem('current_user')!)
      : null,
  )

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string): Promise<void> {
    const response = await apiLogin({ email, password })
    token.value = response.access_token
    localStorage.setItem('access_token', response.access_token)
    // Derive user info from token payload or store email
    try {
      const payload = JSON.parse(atob(response.access_token.split('.')[1]))
      currentUser.value = { id: payload.user_id, email: payload.email }
    } catch {
      currentUser.value = { id: 0, email }
    }
    localStorage.setItem('current_user', JSON.stringify(currentUser.value))
  }

  function logout(): void {
    token.value = null
    currentUser.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('current_user')
  }

  return { token, currentUser, isAuthenticated, login, logout }
})
