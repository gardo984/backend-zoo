import apiClient from './client'
import type { BookCreate, BookResponse } from '../types'

export interface FetchBooksParams {
  search?: string
  status?: boolean
  offset?: number
}

export async function fetchBooks(params?: FetchBooksParams): Promise<BookResponse[]> {
  const response = await apiClient.get<BookResponse[]>('/books/', {
    params: { ...params, limit: 20 },
  })
  return response.data
}

export async function fetchBook(id: number): Promise<BookResponse> {
  const response = await apiClient.get<BookResponse>(`/books/${id}`)
  return response.data
}

export async function createBook(data: BookCreate): Promise<BookResponse> {
  const response = await apiClient.post<BookResponse>('/books/', data)
  return response.data
}

export async function updateBook(id: number, data: BookCreate): Promise<BookResponse> {
  const response = await apiClient.put<BookResponse>(`/books/${id}`, data)
  return response.data
}

export async function deleteBook(id: number): Promise<void> {
  await apiClient.delete(`/books/${id}`)
}
