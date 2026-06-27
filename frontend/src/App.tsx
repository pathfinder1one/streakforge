import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import AppRoutes from '@/routes/AppRoutes'

export default function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgb(18 17 16)',
            color: 'rgb(233 229 224)',
            border: '1px solid rgba(249,89,26,0.2)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#f9591a', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  )
}
