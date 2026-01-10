import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Jogar from "./pages/Jogar";
import ComoJogar from "./pages/ComoJogar";
import Perfil from './pages/Perfil';

function App() {
  return (
    <BrowserRouter>
      {/* Camadas de Estrelas Animadas Globais */}
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/como-jogar" element={<ComoJogar />} />

        {/* Mudei de /game para /jogar para combinar com seu menu */}
        <Route path="/jogar" element={<Jogar />} />

        {/* Rota escondida para redirecionamento do login, se precisar */}
        <Route path="/game" element={<Jogar />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;