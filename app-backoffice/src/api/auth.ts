import apiClient from './client'
import type { LoginCredentials, LoginResponse } from '../types'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/login/', credentials)
  return response.data
}
