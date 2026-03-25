import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useCallback } from "react";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Jogar from "./pages/Jogar";
import ComoJogar from "./pages/ComoJogar";
import Perfil from './pages/Perfil';
import UnifiedGlobe from "./components/UnifiedGlobe";
import './assets/GlobalLayout.css';
import './assets/Stars.css'; /* <-- IMPORTANTE: Trazendo o universo pra cá! */

const GLOBE_OFFSET_PX = 420;

function AppContent() {
    const location = useLocation();
    const isGameRoute = location.pathname === '/jogar' || location.pathname === '/game';

    const [highlightedIsos, setHighlightedIsos] = useState([]);

    const handleIsoUpdate = useCallback((isos) => setHighlightedIsos(isos), []);
    const handleIsoReset = useCallback(() => setHighlightedIsos([]), []);

    return (
        <>
            {/* O UNIVERSO VIVO VOLTOU AQUI! */}
            <div className="nebula-bg"></div>
            <div className="stars"></div>
            <div className="stars2"></div>
            <div className="stars3"></div>

            {/* O Globo fica por cima das estrelas e as rotas por cima do Globo */}
            <UnifiedGlobe
                validIsoCodes={highlightedIsos}
                globeOffsetX={isGameRoute ? GLOBE_OFFSET_PX : 0}
            />

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