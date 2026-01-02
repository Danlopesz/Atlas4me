import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <>
      <Navbar />
      
      <div className="hero-container">
        <div className="hero-content">
          
          {/* Título Principal */}
          <h1 className="hero-title">
            PENSE EM UM PAÍS...
          </h1>
          
          {/* Subtítulo Estilizado */}
          <h2 className="hero-subtitle">
            NÓS VAMOS ADIVINHÁ-LO.
          </h2>
          
          {/* Descrição curta */}
          <p className="hero-desc">
            Desafie e Perca.
          </p>
          
          {/* Botão Novo */}
       <Link to="/jogar" className="btn-play-hero" style={{ 
            marginTop: '30px',
            background: 'linear-gradient(90deg, #00e5ff 0%, #00a8ff 100%)', // Brighter cyan to blue
            padding: '12px 40px',
            fontSize: '1.1rem',
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.4)'
          }}>
            Jogar <span style={{ marginLeft: '10px' }}>&gt;</span>
          </Link>

        </div>
      </div>
    </>
  );
};

export default Home;