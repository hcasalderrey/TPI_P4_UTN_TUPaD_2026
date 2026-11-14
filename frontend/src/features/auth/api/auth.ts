import { api } from '@/shared/api/axiosInstance'
import type { RegisterInput, Usuario } from '../types/auth'

/** Login con formulario OAuth2. El backend responde con la cookie HttpOnly; el cuerpo no trae el token. */
export async function loginRequest(username: string, password: string): Promise<void> {
  await api.post('/auth/token', new URLSearchParams({ username, password }))
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout')
}

export async function fetchMe(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export async function registerRequest(datos: RegisterInput): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', datos)
  return data
}
