import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.css'
import './styles/Stars.css'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Remover o BrowserRouter daqui para não brigar com o App.jsx */}
    <App />
  </StrictMode>,
) 