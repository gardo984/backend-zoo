import apiClient from './client'
import type { UserCreate, UserUpdate, UserResponse } from '../types'

export interface FetchUsersParams {
  search?: string
  status?: boolean
  offset?: number
}

export async function fetchUsers(params?: FetchUsersParams): Promise<UserResponse[]> {
  const response = await apiClient.get<UserResponse[]>('/users/', {
    params: { ...params, limit: 20 },
  })
  return response.data
}

export async function updateUser(id: number, data: UserUpdate): Promise<UserResponse> {
  const response = await apiClient.put<UserResponse>(`/users/${id}`, data)
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
