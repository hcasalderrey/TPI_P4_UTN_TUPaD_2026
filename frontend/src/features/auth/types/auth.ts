export type Rol = 'user' | 'admin'

/** UserPublic del backend. */
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface RegisterInput {
  username: string
  full_name: string
  email: string
  password: string
}
