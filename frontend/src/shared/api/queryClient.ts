import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // un error de la API (404, 403...) no mejora reintentando
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
})
