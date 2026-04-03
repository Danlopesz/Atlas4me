import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = localStorage.getItem('token');
    const firstName = localStorage.getItem('firstName');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="navbar">
            <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
                <img src="/img/ATLAS4ME.svg" alt="ATLAS4ME" className="navbar-logo-img" />
            </Link>

            {/* Ícone do Menu Hambúrguer */}
            <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>

            {/* Navegação - A classe 'active' controla a exibição no mobile */}
            <nav className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
                <Link to="/como-jogar" onClick={toggleMenu}>Como Jogar</Link>
                <Link to="/jogar" onClick={toggleMenu}>Jogar</Link>

                {token ? (
                    <>
                        <Link to="/perfil" onClick={toggleMenu} className="user-profile">
                            Olá, {firstName}
                        </Link>
                        <button onClick={handleLogout} className="btn-logout">Sair</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" onClick={toggleMenu}>Entrar</Link>
                        <Link to="/cadastro" onClick={toggleMenu} className="btn-highlight">Cadastrar</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Navbar;