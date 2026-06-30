// === Auth ===

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

// === User ===

export interface User {
  id: number
  email: string
  disabled: boolean
}

export interface UserCreate {
  email: string
  password: string
}

export interface UserResponse extends User {
  created_by?: UserDetail | null
  created_at?: string
}

export interface UserDetail {
  id: number
  email: string
}

// === Author ===

export interface Author {
  id: number
  name: string
  email: string
  age: number
  active: boolean
}

export interface AuthorCreate {
  name: string
  email: string
  age: number
  active?: boolean
}

export interface AuthorResponse extends Author {
  created_at: string
  created_by: UserDetail | null
}

// === Category ===

export interface Category {
  id: number
  name: string
  active: boolean
}

export interface CategoryCreate {
  name: string
  active?: boolean
}

export interface CategoryResponse extends Category {
  created_at: string
  created_by: UserDetail | null
}

// === Book ===

export interface Book {
  id: number
  name: string
  active: boolean
  description?: string | null
  image?: string | null
  price?: number | string
}

export interface BookCreate {
  name: string
  active?: boolean
  description?: string | null
  image?: string | null
  price?: number | string
  author_id: number
  category_id: number
}

export interface BookResponse extends Book {
  category: CategoryDetail
  author: AuthorDetail
  created_at: string
  created_by: UserDetail | null
}

export interface CategoryDetail {
  id: number
  name: string
  active: boolean
}

export interface AuthorDetail {
  id: number
  name: string
  email: string
  age: number
  active: boolean
}
