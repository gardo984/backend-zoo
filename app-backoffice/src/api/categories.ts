import apiClient from './client'
import type { CategoryCreate, CategoryResponse } from '../types'

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const response = await apiClient.get<CategoryResponse[]>('/categories/')
  return response.data
}

export async function fetchCategory(id: number): Promise<CategoryResponse> {
  const response = await apiClient.get<CategoryResponse>(`/categories/${id}`)
  return response.data
}

export async function createCategory(data: CategoryCreate): Promise<CategoryResponse> {
  const response = await apiClient.post<CategoryResponse>('/categories/', data)
  return response.data
}

export async function updateCategory(id: number, data: CategoryCreate): Promise<CategoryResponse> {
  const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, data)
  return response.data
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}
