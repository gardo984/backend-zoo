import apiClient from './client'
import type { AuthorCreate, AuthorResponse } from '../types'

export async function fetchAuthors(): Promise<AuthorResponse[]> {
  const response = await apiClient.get<AuthorResponse[]>('/author/')
  return response.data
}

export async function fetchAuthor(id: number): Promise<AuthorResponse> {
  const response = await apiClient.get<AuthorResponse>(`/author/${id}`)
  return response.data
}

export async function createAuthor(data: AuthorCreate): Promise<AuthorResponse> {
  const response = await apiClient.post<AuthorResponse>('/author/', data)
  return response.data
}

export async function updateAuthor(id: number, data: AuthorCreate): Promise<AuthorResponse> {
  const response = await apiClient.put<AuthorResponse>(`/author/${id}`, data)
  return response.data
}

export async function deleteAuthor(id: number): Promise<void> {
  await apiClient.delete(`/author/${id}`)
}
