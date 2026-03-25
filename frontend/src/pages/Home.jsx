import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../assets/Home.css';

// Prop onIsoReset: callback para limpar os ISOs destacados no globo ao voltar para Home
const Home = ({ onIsoReset }) => {

    // Toda vez que o usuário chega na Home, limpa o destaque do globo
    useEffect(() => {
        if (onIsoReset) onIsoReset();
    }, [onIsoReset]);

    return (
        // overlay-panel is-visible: overlay transparente sobre o globo
        <div className="overlay-panel home-overlay is-visible">
            <Navbar />

            <div className="hero-container">
                <div className="hero-content">

                    <h1 className="hero-title">
                        PENSE EM UM PAÍS DA AMERICA DO SUL...
                    </h1>

                    <h2 className="hero-subtitle">
                        E NÓS IREMOS ADIVINHÁ-LO
                    </h2>

                    <p className="hero-desc">
                        Desafie e Perca.
                    </p>

                    {/* Link navegação real — URL muda para /jogar, globo não é desmontado */}
                    <Link
                        to="/jogar"
                        className="btn-play-hero"
                        style={{
                            marginTop: '30px',
                            background: 'linear-gradient(90deg, #00e5ff 0%, #00a8ff 100%)',
                            padding: '12px 40px',
                            fontSize: '1.1rem',
                            boxShadow: '0 0 25px rgba(0, 229, 255, 0.4)'
                        }}
                    >
                        Jogar <span style={{ marginLeft: '10px' }}>&#62;</span>
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default Home;