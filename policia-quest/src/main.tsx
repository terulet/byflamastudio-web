import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './app/store.tsx'
import { App } from './app/App.tsx'
import './styles/app.css'

const container = document.getElementById('root')
if (!container) throw new Error('falta #root')

createRoot(container).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
