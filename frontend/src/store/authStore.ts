import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchMe, loginRequest, logoutRequest } from '@/features/auth/api/auth'
import type { Usuario } from '@/features/auth/types/auth'
import { registrarManejadorDeSesion } from '@/shared/api/axiosInstance'

interface AuthState {
  usuario: Usuario | null
  /** true hasta que checkSession confirma (o descarta) la sesión al montar la app. */
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiar: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password) // la cookie HttpOnly la guarda el navegador
        const usuario = await fetchMe()
        set({ usuario, cargando: false })
      },

      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        try {
          set({ usuario: await fetchMe(), cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      limpiar: () => set({ usuario: null }),
    }),
    {
      name: 'foodstore-auth',
      // Solo se guarda el usuario (nombre, email, rol): jamás el token, que el JS no puede leer.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

// Ante un 401 o una cuenta desactivada, el interceptor de Axios limpia la sesión.
registrarManejadorDeSesion(() => useAuthStore.getState().limpiar())
