import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/Navbar.css';

const Navbar = () => {
    // Lemos o localStorage UMA ÚNICA VEZ durante a montagem do componente
    const [userName, setUserName] = useState(() => {
        const storedName = localStorage.getItem('userName'); // No seu Login.jsx estava salvando como 'firstName' ou 'userName'? Certifique-se do nome da chave!
        const token = localStorage.getItem('token');

        if (storedName && token) {
            return storedName;
        }
        return null;
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setUserName(null);
        window.location.href = '/';
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <img src="/img/ATLAS4ME.svg" alt="ATLAS4ME" className="navbar-logo-img" />
            </Link>
            <nav>
                <Link to="/">Início</Link>
                <Link to="/como-jogar">Como Jogar</Link>

                {userName ? (
                    <>
                        <Link to="/perfil" className="user-profile">
                            Olá, {userName}
                        </Link>
                        <button onClick={handleLogout}>
                            Sair
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/cadastro" className="btn-highlight">Cadastro</Link>
                    </>
                )}
            </nav>
        </nav>
    );
};

export default Navbar;