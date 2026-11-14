import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Única llamada a la API dentro de un useEffect: confirma la sesión (cookie) al montar.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}

export default App
