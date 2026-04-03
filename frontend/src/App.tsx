import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useCallback } from "react";
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import Home from "./pages/home/Home";
import Jogar from "./pages/jogar/Jogar";
import ComoJogar from "./pages/home/ComoJogar";
import Perfil from './pages/auth/Perfil';
import { GameGlobe3D } from "./components/globe/GameGlobe3D";
import './styles/GlobalLayout.css';


function AppContent() {

    const [highlightedIsos, setHighlightedIsos] = useState<string[]>([]);

    const handleIsoUpdate = useCallback((isos: string[]) => setHighlightedIsos(isos), []);
    const handleIsoReset = useCallback(() => setHighlightedIsos([]), []);

    return (
        <>
            {/* Globo 3D R3F — full viewport, rotas por cima via z-index */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
                <GameGlobe3D validIsoCodes={highlightedIsos} />
            </div>

            <Routes>
                <Route path="/" element={<Home onIsoReset={handleIsoReset} />} />
                <Route path="/jogar" element={<Jogar onIsoUpdate={handleIsoUpdate} onIsoReset={handleIsoReset} />} />
                <Route path="/game" element={<Jogar onIsoUpdate={handleIsoUpdate} onIsoReset={handleIsoReset} />} />

                <Route path="/login" element={<div className="route-page-overlay"><Login /></div>} />
                <Route path="/cadastro" element={<div className="route-page-overlay"><Cadastro /></div>} />
                <Route path="/como-jogar" element={<div className="route-page-overlay"><ComoJogar /></div>} />
                <Route path="/perfil" element={<div className="route-page-overlay"><Perfil /></div>} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;