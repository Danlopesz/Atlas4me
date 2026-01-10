import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/Navbar.css';

const Navbar = () => {
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        const token = localStorage.getItem('token');

        if (storedName && token) {
            setUserName(storedName);
        }
    }, []);

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