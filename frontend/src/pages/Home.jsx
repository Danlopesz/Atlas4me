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
          <Link to="/jogar" className="btn-play-hero">
            JOGAR AGORA 
            {/* Seta simples via texto */}
            <span style={{ fontSize: '1.5rem', lineHeight: '0' }}>›</span>
          </Link>

        </div>
      </div>
    </>
  );
};

export default Home;