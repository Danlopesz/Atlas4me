import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Planet3D from '../components/Planet3D';
import '../assets/Home.css';
import '../assets/Stars.css';

const Home = () => {
    return (
        <>
            <Navbar />

            {/* --- ADICIONE O PLANETA AQUI --- */}
            <Planet3D />
            {/* ------------------------------- */}

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

                    <Link to="/jogar" className="btn-play-hero" style={{
                        marginTop: '30px',
                        background: 'linear-gradient(90deg, #00e5ff 0%, #00a8ff 100%)',
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