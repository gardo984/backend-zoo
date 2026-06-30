import apiClient from './client'
import type { AuthorCreate, AuthorResponse } from '../types'

export interface FetchAuthorsParams {
  search?: string
  status?: boolean
  offset?: number
}

export async function fetchAuthors(params?: FetchAuthorsParams): Promise<AuthorResponse[]> {
  const response = await apiClient.get<AuthorResponse[]>('/author/', {
    params: { ...params, limit: 20 },
  })
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
