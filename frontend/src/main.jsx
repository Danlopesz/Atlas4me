import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// CORREÇÃO 1: O nome do arquivo é index.css, não style.css
import './assets/index.css' 

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* CORREÇÃO 2: Removemos o BrowserRouter daqui para não brigar com o App.jsx */}
    <App />
  </StrictMode>,
)