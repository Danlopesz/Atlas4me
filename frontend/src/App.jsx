import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ComoJogar from './pages/comoJogar'
import Jogar from './pages/Jogar'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import SobreNos from './pages/sobreNos'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/como-jogar" element={<ComoJogar />} />
      <Route path="/jogar" element={<Jogar />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/sobre-nos" element={<SobreNos />} />
    </Routes>
  )
}

export default App
