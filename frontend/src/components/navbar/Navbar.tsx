import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = localStorage.getItem('token');
    const firstName = localStorage.getItem('firstName');
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const drawerRef = useRef<HTMLElement>(null);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            drawerRef.current?.removeAttribute('inert');
            closeButtonRef.current?.focus();
        } else {
            document.body.style.overflow = '';
            drawerRef.current?.setAttribute('inert', '');
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        if (isMenuOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isMenuOpen]);

    const authLinks = token ? (
        <>
            <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className="user-profile">
                Olá, {firstName}
            </Link>
            <button onClick={handleLogout} className="btn-logout">Sair</button>
        </>
    ) : (
        <>
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
            <Link to="/cadastro" onClick={() => setIsMenuOpen(false)} className="btn-highlight">Cadastrar</Link>
        </>
    );

    return (
        <>
            <header className="navbar">
                <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
                    <img src="/img/ATLAS4ME.svg" alt="ATLAS4ME" className="navbar-logo-img" />
                </Link>

                {/* Links centralizados — desktop */}
                <nav className="nav-links">
                    <Link to="/como-jogar">Como Jogar</Link>
                    <Link to="/jogar">Jogar</Link>
                    <Link to="/ranking">Ranking</Link>
                </nav>

                {/* Auth à direita — desktop */}
                <div className="nav-actions">
                    {authLinks}
                </div>

                {/* Hambúrguer — mobile */}
                <div
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    role="button"
                    aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                    aria-expanded={isMenuOpen}
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </header>

            {/* Backdrop — mobile */}
            {isMenuOpen && (
                <div
                    className="mobile-backdrop"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Drawer — mobile */}
            <aside
                ref={drawerRef}
                className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navegação"
                aria-hidden={!isMenuOpen}
            >
                <button
                    ref={closeButtonRef}
                    className="drawer-close"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Fechar menu"
                >
                    ✕
                </button>

                <nav className="drawer-nav">
                    <Link to="/como-jogar" className="drawer-link" onClick={() => setIsMenuOpen(false)}>
                        Como Jogar
                    </Link>
                    <Link to="/jogar" className="drawer-link" onClick={() => setIsMenuOpen(false)}>
                        Jogar
                    </Link>
                    <Link to="/ranking" className="drawer-link" onClick={() => setIsMenuOpen(false)}>
                        Ranking
                    </Link>

                    {token ? (
                        <>
                            <Link to="/perfil" className="drawer-link drawer-link--profile" onClick={() => setIsMenuOpen(false)}>
                                Olá, {firstName}
                            </Link>
                            <button
                                className="drawer-link drawer-link--logout"
                                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="drawer-link" onClick={() => setIsMenuOpen(false)}>
                                Entrar
                            </Link>
                            <Link to="/cadastro" className="drawer-link drawer-link--cta" onClick={() => setIsMenuOpen(false)}>
                                Cadastrar
                            </Link>
                        </>
                    )}
                </nav>
            </aside>
        </>
    );
};

export default Navbar;
