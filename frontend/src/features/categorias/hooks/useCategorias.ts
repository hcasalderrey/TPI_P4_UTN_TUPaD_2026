import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  getCategorias,
} from '../api/categorias'
import type { CategoriaInput } from '../types/categoria'

const KEY = ['categorias'] as const

export function useCategorias() {
  return useQuery({ queryKey: KEY, queryFn: getCategorias })
}

export function useCrearCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: CategoriaInput) => crearCategoria(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useActualizarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaInput }) =>
      actualizarCategoria(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useEliminarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    // La baja de una categoría no oculta sus productos, pero se refresca todo el catálogo.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
