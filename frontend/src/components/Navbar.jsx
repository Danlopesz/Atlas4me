import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
          <Link to="/" className="navbar-logo">ATLAS4ME</Link>
          <nav>
              <Link to="/">Início</Link>
              <Link to="/jogar">Jogar Agora</Link>
              <Link to="/como-jogar">Como Jogar</Link>

              {userName ? (
                  <>
                      <Link to="/perfil"
                            style={{color: 'var(--neon-cyan)', borderBottom: '1px solid var(--neon-cyan)'}}>
                          Olá, {userName} (Perfil)
                      </Link>
                      <button
                          onClick={handleLogout}
                          style={{
                              background: 'transparent',
                              border: '1px solid #e74c3c',
                              color: '#e74c3c',
                              padding: '5px 15px',
                              fontSize: '0.9rem',
                              width: 'auto',
                              marginTop: 0,
                              marginLeft: '10px'
                          }}
                      >
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