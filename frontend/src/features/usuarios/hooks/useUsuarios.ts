import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'

const KEY = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({ queryKey: KEY, queryFn: getUsuarios })
}

export function useActivarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => activarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDesactivarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => desactivarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
