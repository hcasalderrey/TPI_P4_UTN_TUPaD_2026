import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

const redondear = (n: number): number => Math.round(n * 100) / 100

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.producto_id === producto.producto_id)
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.producto_id === producto.producto_id
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i,
              ),
            }
          }
          return { items: [...estado.items, { ...producto, cantidad }] }
        }),

      quitar: (productoId) =>
        set((estado) => ({ items: estado.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((estado) => ({
          items:
            cantidad < 1
              ? estado.items.filter((i) => i.producto_id !== productoId)
              : estado.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        })),

      vaciar: () => set({ items: [] }),

      total: () => redondear(get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0)),
    }),
    { name: 'foodstore-cart' }, // persiste items al recargar (las funciones no se serializan)
  ),
)
