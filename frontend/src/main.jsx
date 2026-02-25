import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './assets/index.css'
import './assets/Stars.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Remover o BrowserRouter daqui para não brigar com o App.jsx */}
    <App />
  </StrictMode>,
)