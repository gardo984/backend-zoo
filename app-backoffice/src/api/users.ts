import apiClient from './client'
import type { UserCreate, UserResponse } from '../types'

export async function fetchUsers(): Promise<UserResponse[]> {
  const response = await apiClient.get<UserResponse[]>('/users/')
  return response.data
}

export async function fetchUser(id: number): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(`/users/${id}`)
  return response.data
}

export async function createUser(data: UserCreate): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>('/users/', data)
  return response.data
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}
