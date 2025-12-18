import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Jogar from "./pages/Jogar"; 
import ComoJogar from "./pages/ComoJogar"; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/como-jogar" element={<ComoJogar />} />

        {/* Mudei de /game para /jogar para combinar com seu menu */}
        <Route path="/jogar" element={<Jogar />} />
        
        {/* Rota escondida para redirecionamento do login, se precisar */}
        <Route path="/game" element={<Jogar />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;